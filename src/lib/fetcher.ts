import { supabase } from "./supabase";
import {
  ListDocument,
  DetailSection,
  DetailDocument,
} from "../../types/complex";
import {
  DocumentType,
  HashtagType,
  SECTION_KEY_ADDITIONAL_INFO,
  SECTION_KEY_FEATURE,
  SECTION_KEY_INTRODUCTION,
} from "../../types/basic";
import {
  InsertDocumentDto,
  InsertSectionDto,
  InsertSectionRevisionDto,
  InsertHashtagDto,
  CreateDocumentDto,
} from "../../types/dto";
import { LocalStorage } from "./localStorage";
import { Location } from "../../types/basic";

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
  limit: number,
  category?: string
): Promise<ListDocument[] | null> {
  const location: Location | null = LocalStorage.GetGuDong();
  if (location == null) return null;

  let query = supabase
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
      category,
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

  // category 값이 있을 때만 필터링을 추가합니다.
  if (category) {
    query = query.filter("category", "eq", category);
  }

  const { data, error } = await query;

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
      category,
      Hashtags(id, content, document_id, created_at),
      Reviews(id, created_at, created_by, content, document_id),
      Sections(
        section_key,
        SectionRevisions!Sections_current_revision_id_fkey(
        id, 
        created_at,
        created_by,
        content, 
        section_id
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

// 클라이언트 코드
export async function createDocument(dto: CreateDocumentDto): Promise<number> {
  const { data: document_id, error } = await supabase.rpc(
    "create_document_full_transaction",
    dto
  );

  if (error) {
    console.error("문서 생성 트랜잭션 실패:", error);
    throw error;
  }

  if (document_id) {
    return document_id;
  } else {
    throw new Error("문서 ID를 반환받지 못했습니다.");
  }
}

async function insertDocument(dto: InsertDocumentDto): Promise<number> {
  const { data, error } = await supabase
    .from("Documents")
    .insert(dto)
    .select("id")
    .single();

  if (error) throw error;

  return data?.id;
}

async function insertSection(dto: InsertSectionDto): Promise<number> {
  const { data, error } = await supabase
    .from("Sections")
    .insert(dto)
    .select("id")
    .single();

  if (error) throw error;

  return data?.id;
}

async function UpdateSectionCurrentReivisonId(
  section_id: number,
  revision_id: number
): Promise<void> {
  const { data, error } = await supabase
    .from("Sections")
    .update({
      current_revision_id: revision_id,
    })
    .eq("id", section_id);

  if (error) throw error;
}

async function InsertSectionRevision(
  dto: InsertSectionRevisionDto
): Promise<number> {
  const { data, error } = await supabase
    .from("SectionRevisions")
    .insert(dto)
    .select("id")
    .single();

  if (error) throw error;

  return data?.id;
}

async function InsertHashtag(dto: InsertHashtagDto): Promise<number> {
  const { data, error } = await supabase
    .from("Hashtags")
    .insert(dto)
    .select("id")
    .single();

  if (error) throw error;

  return data?.id;
}
