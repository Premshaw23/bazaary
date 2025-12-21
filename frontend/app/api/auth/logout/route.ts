import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Clear the cookie by setting it to expired
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Set-Cookie": `access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax;`,
    },
  });
}
