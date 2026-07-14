"use server";
import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clearAdminSession, createAdminSession } from "@/lib/auth";

export type LoginState = { error?: string };
export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "请输入邮箱和密码" };
  const admin = await db.adminUser.findUnique({ where: { email } });
  if (!admin || !admin.isActive || !(await compare(password, admin.passwordHash))) return { error: "邮箱或密码不正确" };
  await createAdminSession(admin.id);
  await db.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  redirect("/admin/products");
}
export async function logoutAction() { await clearAdminSession(); redirect("/admin/login"); }
