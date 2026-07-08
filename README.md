# NRO Track

Web thống kê thông báo Ngọc Rồng Online, chạy hoàn toàn miễn phí trên GitHub:

- **GitHub Pages** host frontend tĩnh (Next.js static export).
- **GitHub Actions** chạy crawler mỗi ~10 phút: lấy thông báo mới từ
  service.dungpham.com.vn, gửi email cảnh báo, xuất `public/data/*.json` rồi
  build + deploy lại site. Không cần máy nào chạy 24/7.
- Dữ liệu tích luỹ được lưu trên nhánh **`data`** (file `data/*.ndjson`),
  force-push mỗi lần chạy thành đúng 1 commit để repo không phình.

## Cấu trúc

- `scripts/update.ts` — một lượt cập nhật: crawl mới → gửi mail cảnh báo → ghi
  NDJSON → xuất JSON/CSV tĩnh. GitHub Actions gọi script này.
- `scripts/migrate-db.ts` — chạy một lần để chuyển dữ liệu SQLite cũ sang NDJSON.
- `alerts.json` — danh sách cảnh báo email (sửa trực tiếp trên GitHub).
- `.github/workflows/update-and-deploy.yml` — cron + build + deploy Pages.
- `src/lib/stats-client.ts` — mọi thống kê tính phía trình duyệt từ JSON tĩnh.

## Dev local

```bash
npm install
npm run update   # crawl dữ liệu mới nhất vào data/ + public/data/ (cần mạng)
npm run dev      # mở http://localhost:3000
```

`npm run build` xuất site tĩnh ra `out/`.

## Cảnh báo email

Sửa `alerts.json` (trên GitHub: nút *Sửa alerts.json trên GitHub* ở trang
Cảnh báo Email). Cần khai báo SMTP secrets trong repo
**Settings → Secrets and variables → Actions**: `SMTP_HOST`, `SMTP_PORT`,
`SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`.

Lưu ý: repo public nên email trong `alerts.json` hiển thị công khai.
