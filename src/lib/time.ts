// Site stores "YYYY-MM-DD HH:MM:SS" — treat it as local time, matching Date.now().
function toDate(time: string): Date {
  return new Date(time.replace(" ", "T"));
}

export function formatDateVi(time: string): string {
  const [datePart, timePart] = time.split(" ");
  const [y, m, d] = (datePart ?? "").split("-");
  return `${d}/${m}/${y} - ${timePart ?? ""}`;
}

export function timeAgoVi(time: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - toDate(time).getTime()) / 1000));

  if (seconds < 60) return `${seconds} giây trước`;

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.round(hours / 24);
  return `${days} ngày trước`;
}

export function formatPollAgo(lastPollAt: string | null): string {
  if (!lastPollAt) return " — worker chưa chạy lần nào";

  const seconds = Math.max(0, Math.round((Date.now() - new Date(lastPollAt).getTime()) / 1000));

  if (seconds < 90) return ` — kiểm tra ${seconds}s trước`;
  const minutes = Math.round(seconds / 60);
  return ` — kiểm tra ${minutes} phút trước`;
}
