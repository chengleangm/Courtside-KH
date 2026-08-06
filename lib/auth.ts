import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "courtside_admin";

function digest(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function expectedToken(): string {
  return digest(`${process.env.ADMIN_PASSWORD || "admin123"}:${process.env.AUTH_SECRET || "dev-secret"}`);
}

export function passwordIsValid(password: string): boolean {
  const expected = Buffer.from(digest(process.env.ADMIN_PASSWORD || "admin123"));
  const received = Buffer.from(digest(password));
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return false;
  const expected = Buffer.from(expectedToken());
  const received = Buffer.from(token);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
