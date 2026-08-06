import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, expectedToken, passwordIsValid } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (!passwordIsValid(String(password || ""))) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE, expectedToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 12, path: "/" });
  return response;
}
