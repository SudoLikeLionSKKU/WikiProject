// app/api/naver-map/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const coords = searchParams.get("coords");
  const output = searchParams.get("output");
  const orders = searchParams.get("orders");

  const targetUrl = `https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${coords}&output=${output}&orders=${orders}`;

  try {
    const r = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "X-NCP-APIGW-API-KEY-ID":
          process.env.NEXT_PUBLIC_NAVERMAP_API_KEY_ID ?? "",
        "X-NCP-APIGW-API-KEY": process.env.NEXT_PUBLIC_NAVERMAP_API_KEY ?? "",
      },
    });

    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
