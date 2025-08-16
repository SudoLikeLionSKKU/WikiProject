import { DocumentType } from "../../types/basic";
import { updateDocumentStar } from "./fetcher";
import { LocalStorage } from "./localStorage";

export abstract class FavoriteHandler {
  public static async SetFavorites(document: DocumentType): Promise<void> {
    if (document == null) return;
    LocalStorage.SetFavorites(document.id.toString());
    await updateDocumentStar(document.id, document.stars + 1);
  }

  public static async RemoveFavorites(document: DocumentType): Promise<void> {
    if (document == null) return;
    LocalStorage.RemoveFavorites(document.id.toString());
    if (document.stars > 0)
      await updateDocumentStar(document.id, document.stars - 1);
  }
}
