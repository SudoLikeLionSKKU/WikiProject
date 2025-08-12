import { Location } from "../../types/basic";
import { NaverMap } from "./NaverMap";

export abstract class LocalStorage {
  private static gu_key = "gu";
  private static dong_key = "dong";
  private static favorite_key = "favorite_key";

  public static SetGuDong(guDong: Location): void {
    localStorage.setItem(this.gu_key, guDong.gu.trim());
    localStorage.setItem(this.dong_key, guDong.dong.trim());
  }

  public static GetGuDong(): Location | null {
    const gu: string | null = localStorage.getItem(this.gu_key);
    const dong: string | null = localStorage.getItem(this.dong_key);

    if (gu && dong) return { gu, dong };

    return null;
  }

  public static async ValidateGuDong(): Promise<boolean> {
    //LocalStorage에 저장된 장소가 아니면
    const guDong: Location | null = this.GetGuDong();
    if (guDong == null) return false;

    //저장된 장소가 실제 내가 있는 위치가 아니라면
    // const realLocation: Location | null = await NaverMap.GetAddress();

    // if (realLocation == null || realLocation.gu != guDong.gu) {
    //   return false;
    // }
    return true;
  }

  public static GetFavorites(): string[] {
    const data: string | null = localStorage.getItem(this.favorite_key);
    if (data == null) return [];
    return JSON.parse(data) as string[];
  }

  public static SetFavorites(document_id: string): void {
    const data: string | null = localStorage.getItem(this.favorite_key);
    if (data == null) {
      localStorage.setItem(this.favorite_key, JSON.stringify([document_id]));
      return;
    }

    const favorites: string[] = JSON.parse(data) as string[];
    localStorage.setItem(
      this.favorite_key,
      JSON.stringify([...favorites, document_id])
    );
  }
}
