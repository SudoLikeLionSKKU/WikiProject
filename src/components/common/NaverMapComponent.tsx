// src/components/NaverMapComponent.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const SCRIPT_STATUS = {
  LOADING: "loading",
  LOADED: "loaded",
  ERROR: "error",
};

export default function NaverMapComponent({
  address,
  width,
  height,
}: {
  address: string;
  width: number;
  height: number;
}) {
  const mapRef = useRef<naver.maps.Map | null>(null);
  const [scriptStatus, setScriptStatus] = useState(SCRIPT_STATUS.LOADING);

  // 직접 API를 호출하는 대신, API 라우트를 호출
  const fetchGeocode = async (addr: string): Promise<naver.maps.LatLng> => {
    const response = await fetch(`/api/geocode?query=${addr}`);
    if (!response.ok) {
      throw new Error("Geocoding API route call failed");
    }
    const data = await response.json();

    if (data.addresses.length === 0) {
      throw new Error("주소를 찾을 수 없습니다.");
    }

    const { x, y } = data.addresses[0];
    return new naver.maps.LatLng(Number(y), Number(x));
  };

  const initMap = async () => {
    if (!window.naver) return;

    try {
      if (!address) return;
      const gecode: naver.maps.LatLng = await fetchGeocode(address);
      var mapOptions = {
        center: gecode,
        zoom: 18,
      };

      const map = new naver.maps.Map("naver-map", mapOptions);
      mapRef.current = map;

      new naver.maps.Marker({
        position: gecode,
        map: map,
        title: address,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    initMap();
  }, [scriptStatus, address]);

  return (
    <>
      <Script
        strategy="beforeInteractive"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVERMAP_API_KEY_ID}`}
        onLoad={() => setScriptStatus(SCRIPT_STATUS.LOADED)}
        onError={() => setScriptStatus(SCRIPT_STATUS.ERROR)}
      />
      <div id="naver-map" className="w-full h-[200px] w-[200px]"></div>
    </>
  );
}
