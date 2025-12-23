import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  if (!q.trim()) {
    return NextResponse.json([], { status: 200 });
  }

  // Adjust the backend URL as needed
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
  const url = `${backendUrl}/products/search?q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Backend search failed" }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
