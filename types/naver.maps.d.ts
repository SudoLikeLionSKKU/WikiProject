// src/types/naver.maps.d.ts

declare namespace naver.maps {
  class Map {
    constructor(mapDiv: string | HTMLElement, mapOptions?: MapOptions);
  }

  class LatLng {
    constructor(lat: number, lng: number);
  }

  class Marker {
    constructor(options: MarkerOptions);
  }

  interface MapOptions {
    center: LatLng;
    zoom: number;
  }

  interface MarkerOptions {
    position: LatLng;
    map: Map;
    title?: string;
  }

  namespace Service {
    function geocode(
      options: GeocodeOptions,
      callback: (status: Service.Status, response: GeocodeResponse) => void
    ): void;

    enum Status {
      OK = "OK",
    }
  }

  interface GeocodeOptions {
    query: string;
  }

  interface GeocodeResponse {
    v2: {
      addresses: Array<{
        x: string;
        y: string;
        roadAddress: string;
        jibunAddress: string;
      }>;
    };
  }
}
