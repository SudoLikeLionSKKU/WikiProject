import { Location } from "../../types/basic";

export abstract class NaverMap {
  private static API_KEY_ID = process.env.NEXT_PUBLIC_NAVERMAP_API_KEY_ID;
  private static API_KEY = process.env.NEXT_PUBLIC_NAVERMAP_API_KEY;

  private static async GetAddressFromCoords(
    longitude: number,
    latitude: number
  ): Promise<Location | null> {
    const isProduction = process.env.NEXT_PUBLIC_ENV === "production";
    const baseUrl = isProduction
      ? "https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc"
      : "";

    const url = `${baseUrl}/api/naver-map?coords=${longitude},${latitude}&output=json&orders=roadaddr`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-NCP-APIGW-API-KEY-ID": this.API_KEY_ID ?? "",
          "X-NCP-APIGW-API-KEY": this.API_KEY ?? "",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return {
          gu: data.results[0].region.area2.name,
          dong: data.results[0].region.area3.name,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to get address from coordinates:", error);
      return null;
    }
  }

  private static getCurrentCoords = (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      // 브라우저가 Geolocation API를 지원하는지 확인
      if (!navigator.geolocation) {
        reject(new Error("Geolocation API를 지원하지 않는 브라우저입니다."));
        return;
      }

      // 현재 위치를 요청
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 성공 시 위도와 경도를 추출하여 반환
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          resolve({ latitude, longitude });
        },
        (error) => {
          // 실패 시 에러 코드와 메시지 반환
          let errorMessage = "위치 정보를 가져오는데 실패했습니다.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "사용자가 위치 정보 접근을 거부했습니다.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "위치 정보를 사용할 수 없습니다.";
              break;
            case error.TIMEOUT:
              errorMessage = "위치 정보를 가져오는 요청 시간이 초과되었습니다.";
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          // 옵션 설정
          enableHighAccuracy: true, // 높은 정확도
          timeout: 5000, // 5초 타임아웃
          maximumAge: 0, // 캐시된 위치 사용 안 함
        }
      );
    });
  };

  public static async GetAddress(): Promise<Location | null> {
    const coords = await this.getCurrentCoords();
    return this.GetAddressFromCoords(coords.longitude, coords.latitude);
  }
}
