import { supabase } from "./supabase";
import { ListDocument, DetailSection } from "../../types/dto";
import { DocumentType } from "../../types/basic";

export async function getPopularDocuments(
  limit: number
): Promise<DocumentType[] | null> {
  const { data, error } = await supabase
    .from("Documents")
    .select("*")
    .limit(limit)
    .order("stars", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getListDocuments(
  limit: number
): Promise<ListDocument[] | null> {
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
