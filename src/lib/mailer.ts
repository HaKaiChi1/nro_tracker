import nodemailer, { type Transporter } from "nodemailer";
import { config } from "./config";
import type { MailRule, NotificationRow } from "./db";

export const DEFAULT_SUBJECT = "[NRO TRACKER] THÔNG BÁO";

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });

  return transporter;
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

function formatDateTime(time: string): { niceDate: string; niceTime: string } {
  const [datePart, timePart] = time.split(" ");
  const [y, m, d] = (datePart ?? "").split("-");
  return { niceDate: `${d}/${m}/${y}`, niceTime: timePart ?? "" };
}

export async function sendRuleAlertEmail(rule: MailRule, record: NotificationRow): Promise<void> {
  const mailer = getTransporter();
  if (!mailer) return;

  const to = rule.mail_to?.trim() || config.mail.to;
  if (!to) return;

  const subject = rule.subject?.trim() || DEFAULT_SUBJECT;
  const { niceDate, niceTime } = formatDateTime(record.time);
  const player = record.player_name ?? rule.player_name;

  const summaryLine = `Nhân vật ${player} vừa có thông báo mới vào lúc ${niceTime} ngày ${niceDate}.`;

  const text = `${summaryLine}\n\nNội dung: ${record.value ?? ""}`;

  const html = `
    <div style="font-family:system-ui,sans-serif;font-size:15px">
      <p>${escapeHtml(summaryLine)}</p>
      <p style="color:#475569">${escapeHtml(record.value ?? "")}</p>
    </div>
  `;

  try {
    await mailer.sendMail({
      from: config.mail.from,
      to,
      subject,
      text,
      html,
    });
    console.log(`[mailer] Đã gửi cảnh báo cho "${rule.player_name}" → ${to} (${subject})`);
  } catch (error) {
    console.error("[mailer] Gửi email thất bại:", error);
  }
}
