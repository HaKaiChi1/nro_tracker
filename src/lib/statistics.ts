import { getMeta, queryAll, latestRecord, totalRecords } from "./db";
import { config } from "./config";

export interface Summary {
  totalRecords: number;
  latestTime: string;
  lastPollAt: string | null;
}

export function summary(server: string = config.server): Summary {
  const latest = latestRecord(server);

  return {
    totalRecords: totalRecords(server),
    latestTime: latest?.time ?? "-",
    lastPollAt: getMeta("last_poll_at"),
  };
}

// Thứ tự hiển thị các thành viên trong Tiểu Đội Sát Thủ.
export const SQUAD_MEMBERS = ["Số 1", "Số 2", "Số 3", "Số 4", "Tiểu đội trưởng"] as const;
export const SQUAD_LABELS: Record<string, string> = {
  "Số 1": "Số 1",
  "Số 2": "Số 2",
  "Số 3": "Số 3",
  "Số 4": "Số 4",
  "Tiểu đội trưởng": "TĐT",
};

// Danh sách bản đồ thuộc hành tinh Namec (theo danh mục lọc địa điểm trong
// game) — địa điểm nào không nằm trong danh sách này mặc định thuộc Fide.
export const NAMEC_LOCATIONS = new Set<string>([
  "Vách núi Moori",
  "Nhà Moori",
  "Làng Mori",
  "Đồi nấm tím",
  "Thị trấn Moori",
  "Thung lũng Maima",
  "Vực maima",
  "Đảo Guru",
  "Thung lũng Namếc",
  "Núi hoa vàng",
  "Núi hoa tím",
  "Nam Guru",
  "Đông Nam Guru",
  "Trạm tàu vũ trụ",
]);

export type Planet = "namec" | "fide";

function classifyPlanet(location: string | null): Planet | null {
  if (!location) return null;
  return NAMEC_LOCATIONS.has(location) ? "namec" : "fide";
}

// Một tiểu đội luôn xuất hiện trọn vẹn tại MỘT địa điểm, cách nhau không quá
// 1-2 phút giữa các con. Nhưng 2 tiểu đội khác nhau (ở 2 địa điểm khác nhau)
// có thể xuất hiện gần nhau về thời gian và xen kẽ nhau trong luồng dữ liệu.
// Nên phải gộp riêng theo từng địa điểm: một đợt chỉ nhận thêm sự kiện cùng
// địa điểm, chưa đủ 5 con, và cách sự kiện gần nhất của chính nó <= 2 phút.
const GROUP_GAP_MS = 2 * 60 * 1000;

interface RawGroup {
  time: string;
  ms: number;
  lastMs: number;
  location: string | null;
  appeared: Set<string>;
}

function toMs(time: string): number {
  return new Date(time.replace(" ", "T")).getTime();
}

// Gộp các sự kiện xuất hiện thành từng đợt (một tiểu đội), thứ tự tăng dần
// theo thời gian. Dùng chung cho feed, biểu đồ chu kỳ và biểu đồ theo ngày.
function computeGroups(server: string): RawGroup[] {
  const rows = queryAll<{ time: string; boss_name: string; location: string | null }>(
    `
    SELECT time, boss_name, location
    FROM boss_events
    WHERE server = ? AND is_killed = 0
    ORDER BY datetime(time) ASC, id ASC
    `,
    server
  );

  const groups: RawGroup[] = [];
  const openByLocation = new Map<string, RawGroup>();

  for (const row of rows) {
    const locationKey = row.location ?? "__unknown__";
    const ms = toMs(row.time);
    const open = openByLocation.get(locationKey);

    const canContinue = open && !open.appeared.has(row.boss_name) && ms - open.lastMs <= GROUP_GAP_MS;

    const group = canContinue
      ? open!
      : (() => {
          const g: RawGroup = { time: row.time, ms, lastMs: ms, location: row.location, appeared: new Set() };
          groups.push(g);
          openByLocation.set(locationKey, g);
          return g;
        })();

    group.appeared.add(row.boss_name);
    group.lastMs = ms;

    if (group.appeared.size >= SQUAD_MEMBERS.length) {
      openByLocation.delete(locationKey);
    }
  }

  return groups;
}

export interface SquadGroup {
  id: string;
  time: string;
  location: string | null;
  appeared: Record<string, boolean>;
}

export interface SquadFeed {
  rows: SquadGroup[];
  total: number;
}

export function squadFeed(server: string = config.server, page = 1, pageSize = 10): SquadFeed {
  const groups = computeGroups(server).slice().reverse();

  const total = groups.length;
  const offset = Math.max(page - 1, 0) * pageSize;

  return {
    rows: groups.slice(offset, offset + pageSize).map((g) => ({
      id: `${g.time}-${g.location ?? ""}`,
      time: g.time,
      location: g.location,
      appeared: Object.fromEntries(SQUAD_MEMBERS.map((name) => [name, g.appeared.has(name)])),
    })),
    total,
  };
}

export interface LocationHistoryEntry {
  stt: number;
  time: string;
  location: string;
}

// Lịch sử địa điểm xuất hiện tại Namec, mới nhất -> xa nhất — dùng để xuất CSV.
export function locationHistory(server: string = config.server): LocationHistoryEntry[] {
  return computeGroups(server)
    .slice()
    .reverse()
    .filter((g) => classifyPlanet(g.location) === "namec")
    .map((g, i) => ({ stt: i + 1, time: g.time, location: g.location! }));
}

export interface LocationStat {
  name: string;
  count: number;
}

// Tổng số lần xuất hiện theo khu vực, tính trên toàn bộ lịch sử (không theo ngày).
export function locationStats(server: string = config.server): LocationStat[] {
  return queryAll<LocationStat>(
    `
    SELECT location AS name, COUNT(*) AS count
    FROM boss_events
    WHERE server = ? AND is_killed = 0 AND location IS NOT NULL AND location <> ''
    GROUP BY location
    ORDER BY count DESC
    `,
    server
  );
}

export function namecLocationStats(server: string = config.server): LocationStat[] {
  return locationStats(server).filter((l) => NAMEC_LOCATIONS.has(l.name));
}

export function fideLocationStats(server: string = config.server): LocationStat[] {
  return locationStats(server).filter((l) => !NAMEC_LOCATIONS.has(l.name));
}

export interface CycleBucket {
  label: string;
  count: number;
}

export interface CycleStats {
  avgMinutes: number | null;
  medianMinutes: number | null;
  buckets: CycleBucket[];
}

// Chu kỳ thực tế luôn rơi trong khoảng 10-20 phút — ngoài khoảng này là nhiễu
// (mất tín hiệu lúc crawl, v.v.) nên bỏ qua hẳn, không tính vào biểu đồ/trung bình.
const CYCLE_MIN_MINUTES = 10;
const CYCLE_MAX_MINUTES = 20;

function bucketize(gaps: number[]): CycleBucket[] {
  const buckets: CycleBucket[] = [];
  for (let m = CYCLE_MIN_MINUTES; m < CYCLE_MAX_MINUTES; m += 1) {
    buckets.push({ label: `${m}p`, count: 0 });
  }

  for (const gap of gaps) {
    const idx = Math.min(buckets.length - 1, Math.floor(gap - CYCLE_MIN_MINUTES));
    buckets[idx].count += 1;
  }

  return buckets;
}

// Khoảng cách thời gian giữa 2 đợt tiểu đội liên tiếp (cùng hành tinh nếu có
// lọc `planet`) — giúp ước lượng chu kỳ xuất hiện trung bình/phổ biến nhất.
export function cycleStats(server: string = config.server, planet?: Planet): CycleStats {
  const groups = computeGroups(server).filter((g) => !planet || classifyPlanet(g.location) === planet);

  const gaps: number[] = [];
  for (let i = 1; i < groups.length; i += 1) {
    const gap = (groups[i].ms - groups[i - 1].ms) / 60_000;
    if (gap >= CYCLE_MIN_MINUTES && gap <= CYCLE_MAX_MINUTES) gaps.push(gap);
  }

  if (gaps.length === 0) {
    return { avgMinutes: null, medianMinutes: null, buckets: bucketize([]) };
  }

  const sorted = [...gaps].sort((a, b) => a - b);
  const avgMinutes = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const medianMinutes = sorted[Math.floor(sorted.length / 2)];

  return { avgMinutes, medianMinutes, buckets: bucketize(gaps) };
}

export interface DailyCount {
  date: string;
  count: number;
  byLocation: NamedCount[];
}

export interface NamedCount {
  name: string;
  count: number;
}

// Số đợt tiểu đội xuất hiện theo từng ngày (cùng hành tinh nếu có lọc
// `planet`), `days` ngày gần nhất — kèm phân bổ theo địa điểm để hiện tooltip.
export function dailySquadCounts(
  server: string = config.server,
  planet?: Planet,
  days = 30
): DailyCount[] {
  const groups = computeGroups(server).filter((g) => !planet || classifyPlanet(g.location) === planet);

  const byDate = new Map<string, Map<string, number>>();
  for (const g of groups) {
    const date = g.time.slice(0, 10);
    const loc = g.location ?? "Không rõ";
    const perLocation = byDate.get(date) ?? new Map<string, number>();
    perLocation.set(loc, (perLocation.get(loc) ?? 0) + 1);
    byDate.set(date, perLocation);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .slice(-days)
    .map(([date, perLocation]) => ({
      date,
      count: [...perLocation.values()].reduce((a, b) => a + b, 0),
      byLocation: [...perLocation.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    }));
}

export interface NamecTimelineEntry {
  time: string;
  location: string;
}

// Toàn bộ lần xuất hiện của Tiểu Đội Sát Thủ tại Namec trong ngày gần nhất có
// dữ liệu (không giới hạn số lượng), mới nhất trước.
export function namecTimeline(server: string = config.server): NamecTimelineEntry[] {
  const groups = computeGroups(server)
    .filter((g) => classifyPlanet(g.location) === "namec")
    .slice()
    .reverse();

  const latestDate = groups[0]?.time.slice(0, 10);
  if (!latestDate) return [];

  return groups
    .filter((g) => g.time.slice(0, 10) === latestDate)
    .map((g) => ({ time: g.time, location: g.location! }));
}

// Số lần xuất hiện theo từng địa điểm trong ngày gần nhất có dữ liệu (Namec).
export function namecLocationCountsToday(server: string = config.server): LocationStat[] {
  const counts = new Map<string, number>();
  for (const e of namecTimeline(server)) {
    counts.set(e.location, (counts.get(e.location) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// 3 địa điểm trung tâm hiện riêng màu, các địa điểm hiếm gộp vào "Khác" — khớp
// với cách tô màu đang dùng ở Timeline.
const HUB_LOCATIONS = ["Đông Nam Guru", "Nam Guru", "Thung lũng Maima"] as const;

export interface HourlyLocationPoint {
  hour: string;
  "Đông Nam Guru": number;
  "Nam Guru": number;
  "Thung lũng Maima": number;
  Khác: number;
}

// Số lần xuất hiện theo từng giờ trong ngày, tách theo địa điểm — ngày gần
// nhất có dữ liệu (Namec).
export function namecHourlyLocationCounts(server: string = config.server): HourlyLocationPoint[] {
  const points: HourlyLocationPoint[] = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, "0")}h`,
    "Đông Nam Guru": 0,
    "Nam Guru": 0,
    "Thung lũng Maima": 0,
    Khác: 0,
  }));

  for (const e of namecTimeline(server)) {
    const hour = Number(e.time.slice(11, 13));
    const key = (HUB_LOCATIONS as readonly string[]).includes(e.location)
      ? (e.location as (typeof HUB_LOCATIONS)[number])
      : "Khác";
    points[hour][key] += 1;
  }

  return points;
}

export interface LocationProbability {
  name: string;
  probability: number;
}

export interface PredictionResult {
  lastLocation: string | null;
  lastTime: string | null;
  sampleSize: number;
  predictions: LocationProbability[];
}

// Dự đoán địa điểm Tiểu Đội Sát Thủ (Namec) xuất hiện tiếp theo bằng mô hình
// Markov bậc 1: P(vị trí tiếp theo = X | vị trí hiện tại = vị trí lần gần
// nhất). Dữ liệu thật cho thấy có quy luật rõ: 3 địa điểm trung tâm (Đông Nam
// Guru, Nam Guru, Thung lũng Maima) chiếm ~95% và các địa điểm hiếm luôn dẫn
// về 1 trong 3 trung tâm này — nên mô hình theo vị trí hiện tại chính xác hơn
// nhiều so với chỉ lấy tần suất tổng. Làm mượt Laplace (alpha=1) để tránh xác
// suất 0 tuyệt đối với các cặp chuyển tiếp hiếm gặp/chưa từng thấy.
export function predictNextNamecLocation(server: string = config.server): PredictionResult {
  const groups = computeGroups(server).filter((g) => classifyPlanet(g.location) === "namec");

  if (groups.length === 0) {
    return { lastLocation: null, lastTime: null, sampleSize: 0, predictions: [] };
  }

  const allLocations = [...new Set(groups.map((g) => g.location!))];
  const last = groups[groups.length - 1];

  const transitionCounts = new Map<string, number>();
  let sampleSize = 0;
  for (let i = 1; i < groups.length; i += 1) {
    if (groups[i - 1].location === last.location) {
      const to = groups[i].location!;
      transitionCounts.set(to, (transitionCounts.get(to) ?? 0) + 1);
      sampleSize += 1;
    }
  }

  const ALPHA = 1;
  const denom = sampleSize + ALPHA * allLocations.length;

  const predictions = allLocations
    .map((name) => ({
      name,
      probability: ((transitionCounts.get(name) ?? 0) + ALPHA) / denom,
    }))
    .sort((a, b) => b.probability - a.probability);

  return { lastLocation: last.location, lastTime: last.time, sampleSize, predictions };
}
