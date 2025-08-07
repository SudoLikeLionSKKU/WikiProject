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
} from "../../types/dto";
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

export async function createDocument(
  document: DetailDocument
): Promise<number> {
  //트랜잭션 시작
  try {
    const document_id: number = await insertDocument({
      created_by: document.created_by,
      stars: 0,
      dong: document.dong,
      gu: document.gu,
      title: document.title,
      location: document.location,
    });

    //introduction
    const introduction_section_id: number = await insertSection({
      section_key: SECTION_KEY_INTRODUCTION,
      document_id: document_id,
    });

    const introduction_section_revision_id: number =
      await InsertSectionRevision({
        document_id: document_id,
        section_id: introduction_section_id,
        content: document.introduction?.content,
        created_by: document.created_by,
      });

    UpdateSectionCurrentReivisonId(
      introduction_section_id,
      introduction_section_revision_id
    );

    //Feature
    const feature_section_id: number = await insertSection({
      section_key: SECTION_KEY_FEATURE,
      document_id: document_id,
    });

    const feature_section_revision_id: number = await InsertSectionRevision({
      document_id: document_id,
      section_id: feature_section_id,
      content: document.feature?.content,
      created_by: document.created_by,
    });

    UpdateSectionCurrentReivisonId(
      feature_section_id,
      feature_section_revision_id
    );

    //Additional Info
    const additionalInfo_section_id: number = await insertSection({
      section_key: SECTION_KEY_ADDITIONAL_INFO,
      document_id: document_id,
    });

    const additionalInfo_section_revision_id: number =
      await InsertSectionRevision({
        document_id: document_id,
        section_id: additionalInfo_section_id,
        content: document.additionalInfo?.content,
        created_by: document.created_by,
      });

    UpdateSectionCurrentReivisonId(
      additionalInfo_section_id,
      additionalInfo_section_revision_id
    );

    //HashTags
    document.Hashtags?.forEach((hashtag: HashtagType) => {
      InsertHashtag({
        document_id: document_id,
        content: hashtag.content,
      });
    });

    return document_id;
  } catch (ex) {
    //rollback
    throw ex;
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
