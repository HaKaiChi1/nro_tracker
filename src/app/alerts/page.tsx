"use client";

import { useEffect, useState } from "react";
import { withBase } from "@/lib/base-path";
import { REPO_URL } from "@/lib/site-config";
import { useServer } from "@/lib/server-context";
import type { AlertRule } from "@/lib/types";

const DEFAULT_SUBJECT = "[NRO TRACKER] THÔNG BÁO";

export default function AlertsPage() {
  const { server } = useServer();
  const [rules, setRules] = useState<AlertRule[] | null>(null);

  useEffect(() => {
    fetch(withBase(`/data/alerts.json?t=${Date.now()}`))
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AlertRule[]) => setRules(data))
      .catch(() => setRules([]));
  }, []);

  const visible = (rules ?? []).filter((r) => r.server === server);
  const editUrl = REPO_URL ? `${REPO_URL}/edit/main/alerts.json` : "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Cảnh báo Email — {server}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Khi workflow cập nhật dữ liệu (chạy trên GitHub Actions mỗi ~10 phút) phát hiện thông báo
          mới đúng tên nhân vật bên dưới trên server {server}, hệ thống sẽ tự gửi email tới địa chỉ
          đã khai báo. Danh sách cảnh báo nằm trong file <code>alerts.json</code> ở gốc repo — sửa
          file đó trên GitHub để thêm/xoá/tắt cảnh báo.
        </p>
      </div>

      {editUrl && (
        <a
          href={editUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-primary self-start"
        >
          ✏️ Sửa alerts.json trên GitHub
        </a>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tên nhân vật</th>
              <th className="px-4 py-3">Server</th>
              <th className="px-4 py-3">Mail đến</th>
              <th className="px-4 py-3">Tiêu đề email</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((rule, index) => (
              <tr key={index} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        rule.enabled !== false ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    {rule.enabled !== false ? "Running" : "Stop"}
                  </span>
                </td>
                <td className="px-4 py-2 font-medium">{rule.player_name}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{rule.server}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{rule.mail_to || "-"}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                  {rule.subject || DEFAULT_SUBJECT}
                </td>
              </tr>
            ))}

            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  {rules === null ? "Đang tải..." : "Chưa có cảnh báo nào cho server này."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card text-xs text-slate-500 dark:text-slate-400">
        <p className="mb-2 font-medium text-slate-700 dark:text-slate-300">Định dạng alerts.json:</p>
        <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 dark:bg-slate-900">{`[
  {
    "player_name": "kakapote",
    "server": "Super 1",
    "mail_to": "ban@gmail.com",
    "subject": "Tuỳ chọn — bỏ trống dùng tiêu đề mặc định",
    "enabled": true
  }
]`}</pre>
        <p className="mt-2">
          Lưu ý: repo public nên địa chỉ email trong file này sẽ hiển thị công khai. Email chỉ gửi
          được khi đã cấu hình SMTP secrets trong Settings → Secrets and variables → Actions.
        </p>
      </div>
    </div>
  );
}
