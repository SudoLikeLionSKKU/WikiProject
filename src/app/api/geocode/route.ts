// src/app/api/geocode/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  console.log("query", query);

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is missing" },
      { status: 400 }
    );
  }

  const url = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-NCP-APIGW-API-KEY-ID":
          process.env.NEXT_PUBLIC_NAVERMAP_API_KEY_ID ?? "",
        "X-NCP-APIGW-API-KEY": process.env.NEXT_PUBLIC_NAVERMAP_API_KEY ?? "",
      },
    });

    console.log("id", process.env.NEXT_PUBLIC_NAVERMAP_API_KEY_ID);
    console.log("key", process.env.NEXT_PUBLIC_NAVERMAP_API_KEY);

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Geocoding API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch geocoding data" },
      { status: 500 }
    );
  }
}
