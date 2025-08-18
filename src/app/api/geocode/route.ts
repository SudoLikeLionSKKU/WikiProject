// src/app/api/geocode/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is missing" },
      { status: 400 }
    );
  }

  const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${query.trim()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-NCP-APIGW-API-KEY-ID":
          process.env.NEXT_PUBLIC_NAVERMAP_API_KEY_ID ?? "",
        "X-NCP-APIGW-API-KEY": process.env.NEXT_PUBLIC_NAVERMAP_API_KEY ?? "",
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
