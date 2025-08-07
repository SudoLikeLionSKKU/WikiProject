import { supabase } from "./supabase";
import { ListDocument, DetailSection, DetailDocument } from "../../types/dto";
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

export async function getDetailDocument(
  document_id: number
): Promise<DetailDocument | null> {
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
      Hashtags(id, content, document_id, created_at),
      Reviews(id, created_at, created_by, content, document_id),
      Sections(
        section_key,
        SectionRevisions(
          id,
          created_at,
          created_by,
          content,
          section_id,
          document_id
        )
      )
    `
    )
    .eq("id", document_id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // PGRST116 에러 코드는 데이터가 없을 때 발생합니다.
      return null;
    }
    throw error;
  }

  const introSection = data.Sections.find(
    (s: any) => s.section_key == "introduction"
  );

  const featureSection = data.Sections.find(
    (s: any) => s.section_key == "feature"
  );

  const additionalInfoSection = data.Sections.find(
    (s: any) => s.section_key == "additionalInfo"
  );

  return {
    ...data,
    Hashtags: data.Hashtags,
    introduction: introSection?.SectionRevisions,
    feature: featureSection?.SectionRevisions,
    additionalInfo: additionalInfoSection?.SectionRevisions,
    reviews: data.Reviews ?? [],
  };
}
