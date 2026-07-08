import { listMailRules } from "@/lib/db";
import { DEFAULT_SUBJECT } from "@/lib/mailer";
import { config } from "@/lib/config";
import { getSelectedServer } from "@/lib/server-selection";
import { addRuleAction, deleteRuleAction, toggleRuleAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const server = await getSelectedServer();
  const rules = listMailRules(server);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Cảnh báo Email — {server}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Khi worker (<code>npm run watch</code>) phát hiện thông báo mới đúng tên nhân vật bên
          dưới trên server {server}, hệ thống sẽ tự gửi một email riêng cho lượt đó tới địa chỉ
          bạn chọn. Đổi server bằng ô chọn cạnh logo NRO Track.
        </p>
      </div>

      <form action={addRuleAction} className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Tên nhân vật
          </label>
          <input
            name="player_name"
            required
            placeholder="vd: kakapote"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Mail đến
          </label>
          <input
            name="mail_to"
            type="email"
            required
            defaultValue={config.mail.to}
            placeholder="ban@gmail.com"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Tiêu đề email (tuỳ chọn)
          </label>
          <input
            name="subject"
            placeholder={DEFAULT_SUBJECT}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <button type="submit" className="btn-primary">
          Thêm cảnh báo
        </button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tên nhân vật</th>
              <th className="px-4 py-3">Server</th>
              <th className="px-4 py-3">Mail đến</th>
              <th className="px-4 py-3">Tiêu đề email</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        rule.enabled ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    {rule.enabled ? "Running" : "Stop"}
                  </span>
                </td>
                <td className="px-4 py-2 font-medium">{rule.player_name}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{rule.server}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{rule.mail_to ?? "-"}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                  {rule.subject ?? DEFAULT_SUBJECT}
                </td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                  {new Date(rule.created_at).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-3">
                    <form action={toggleRuleAction.bind(null, rule.id)}>
                      <button type="submit" className="text-xs text-amber-500 hover:underline">
                        {rule.enabled ? "Tắt" : "Bật"}
                      </button>
                    </form>
                    <form action={deleteRuleAction.bind(null, rule.id)}>
                      <button type="submit" className="text-xs text-red-500 hover:underline">
                        Xoá
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {rules.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Chưa có cảnh báo nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Cần cấu hình SMTP trong file <code>.env</code> (SMTP_HOST, SMTP_USER, SMTP_PASS...) thì
        email mới thực sự gửi được — xem <code>.env.example</code>.
      </p>
    </div>
  );
}
