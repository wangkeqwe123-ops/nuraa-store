import "server-only";
import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const COOKIE = "nuraa_admin_session";
const SESSION_DAYS = 7;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createAdminSession(adminId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await db.adminSession.create({ data: { adminId, tokenHash: hashToken(token), expiresAt } });
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}

export async function getAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.adminSession.findUnique({ where: { tokenHash: hashToken(token) }, include: { admin: true } });
  if (!session || session.expiresAt <= new Date() || !session.admin.isActive) return null;
  return session.admin;
}

export async function requireAdmin() { const admin = await getAdmin(); if (!admin) redirect("/admin/login"); return admin; }

export async function clearAdminSession() {
  const jar = await cookies(); const token = jar.get(COOKIE)?.value;
  if (token) await db.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete(COOKIE);
}
