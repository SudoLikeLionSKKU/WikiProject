import { supabase } from "./supabase";
import {
  ListDocument,
  DetailSection,
  DetailDocument,
} from "../../types/complex";
import { DocumentType, Location, ReviewType } from "../../types/basic";
import {
  InsertDocumentDto,
  InsertSectionDto,
  InsertSectionRevisionDto,
  InsertHashtagDto,
  CreateDocumentDto,
  InsertReviewDto,
} from "../../types/dto";
import { LocalStorage } from "./localStorage";

/* 인기 문서 */
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

/* 최근 문서 리스트 (카테고리 선택 가능) */
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

/* 상세 문서 (단일 리비전 + document_id 주입) */
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
          section_id,
          document_id
        )
      )
    `
    )
    .eq("id", document_id)
    .order("created_at", { ascending: false, foreignTable: "Reviews" })
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // 문서 없음
      return null;
    }
    throw error;
  }

  const introSection = data.Sections.find(
    (s: any) => s.section_key === "introduction"
  );
  const featureSection = data.Sections.find(
    (s: any) => s.section_key === "feature"
  );
  const additionalInfoSection = data.Sections.find(
    (s: any) => s.section_key === "additionalInfo"
  );

  // DetailDocument이 기대하는 정확한 필드로 매핑
  type RevShape = {
    id: number;
    created_at: string;
    created_by: string;
    content: string | null;
    section_id: number;
    document_id: number;
  };

  const withDocId = (rev?: any, docId?: number): RevShape | null => {
    if (!rev || docId == null) return null;
    return {
      id: rev.id as number,
      created_at: rev.created_at as string,
      created_by: (rev.created_by ?? "") as string, // null 보호
      content: (rev.content ?? null) as string | null,
      section_id: rev.section_id as number,
      document_id: docId,
    };
  };

  return {
    ...data,
    Hashtags: data.Hashtags,
    introduction: introSection?.SectionRevisions,
    feature: featureSection?.SectionRevisions,
    additionalInfo: additionalInfoSection?.SectionRevisions,
    reviews: data.Reviews ?? [],
  };
}

/* 문서 생성 (RPC) */
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

/* 해당 문서의 하트(스타) 개수 변경 */
export async function updateDocumentStar(
  document_id: number,
  star: number
): Promise<Number> {
  const { data, error } = await supabase
    .from("Documents")
    .update({ stars: star })
    .filter("id", "eq", document_id)
    .select("id")
    .single();
  if (error) throw error;

  return data.id;
}

/* 한 문서에 대한 Reviews가져오기 */
export async function GetReviewsByDocumentId(
  document_id: number
): Promise<ReviewType[] | null> {
  const { data, error } = await supabase
    .from("Reviews")
    .select("id, created_at, created_by, content, document_id")
    .filter("document_id", "eq", document_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/* --- 아래는 직접 테이블에 쓰는 로우레벨 함수들(필요 시 사용) --- */

export async function insertReview(dto: InsertReviewDto): Promise<number> {
  const { data, error } = await supabase
    .from("Reviews")
    .insert(dto)
    .select("id")
    .single();

  if (error) throw error;

  return data.id;
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
  const { error } = await supabase
    .from("Sections")
    .update({
      current_revision_id: revision_id,
    })
    .eq("id", section_id);

  if (error) throw error;
}

export async function InsertSectionRevision(
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
