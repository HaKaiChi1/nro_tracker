"use server";

import { revalidatePath } from "next/cache";
import { addMailRule, deleteMailRule, toggleMailRule } from "@/lib/db";
import { getSelectedServer } from "@/lib/server-selection";

export async function addRuleAction(formData: FormData): Promise<void> {
  const playerName = String(formData.get("player_name") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const mailTo = String(formData.get("mail_to") ?? "").trim();

  if (!playerName || !mailTo) return;

  const server = await getSelectedServer();

  addMailRule(playerName, subject || null, mailTo, server);
  revalidatePath("/alerts");
}

export async function deleteRuleAction(id: number): Promise<void> {
  deleteMailRule(id);
  revalidatePath("/alerts");
}

export async function toggleRuleAction(id: number): Promise<void> {
  toggleMailRule(id);
  revalidatePath("/alerts");
}
