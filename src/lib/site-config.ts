// Config dùng được ở client bundle (không đụng process.env của Node).
// Config cho crawler/script nằm ở ./config.ts.
export const SERVERS = ["Super 1", "Super 3"];
export const DEFAULT_SERVER = "Super 1";

// Link repo GitHub — dùng cho nút "Sửa cảnh báo" trỏ tới file alerts.json.
export const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL ?? "";
