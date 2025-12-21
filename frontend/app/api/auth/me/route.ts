import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
  const res = await fetch(`${backendUrl}/auth/me`, {
    headers: { cookie },
    credentials: "include",
  });
  if (!res.ok) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const user = await res.json();
  return NextResponse.json(user);
}
