import { supabase } from "./supabase";
import { ListDocument, DetailSection } from "../../types/dto";
import { DocumentType } from "../../types/basic";
import { LocalStorage, Location } from "./localStorage";

export async function getPopularDocuments(
  limit: number
): Promise<DocumentType[] | null> {
  const location: Location | null = LocalStorage.GetGuDong();
  if (location == null) return null;

  const { data, error } = await supabase
    .from("Documents")
    .select("*")
    .filter("gu", "eq", location.gu)
    .filter("dong", "eq", location.dong)
    .limit(limit)
    .order("stars", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getListDocuments(
  limit: number
): Promise<ListDocument[] | null> {
  const location: Location | null = LocalStorage.GetGuDong();
  if (location == null) return null;

  const { data, error } = await supabase
    .from("Documents")
    .select(
      `
      id,
      created_at,
      created_by,
      title,
      location,
      stars,
      gu,
      dong,
      Hashtags(id, content),
      Sections(
        section_key,
        SectionRevisions!Sections_current_revision_id_fkey(
        id, 
        created_at, 
        content, 
        section_id
        )
      )
    `
    )
    .filter("gu", "eq", location.gu)
    .filter("dong", "eq", location.dong)
    .filter("Sections.section_key", "eq", "introduction")
    .limit(limit)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const transformedData = data.map((doc: any) => {
    const introSection: DetailSection = doc.Sections.find(
      (s: DetailSection) => s.section_key === "introduction"
    );

    return {
      ...doc,
      Hashtags: doc.Hashtags,
      introduction: introSection?.SectionRevisions,
    };
  });

  return transformedData;
}
