import {
  HashtagType,
  ReviewType,
  SectionRevisionType,
  SectionType,
  DocumentType,
} from "./basic";

export interface DetailSection extends SectionType {
  SectionRevisions: SectionRevisionType[];
}

/**
 * @description 리스트 페이지에서 사용되는 Document 자료형
 */
export interface ListDocument extends DocumentType {
  Hashtags: HashtagType[];
  introduction: SectionRevisionType;
}

/**
 * @description 상세 페이지에서 사용되는 Document 자료형
 */
export interface DetailDocument extends DocumentType {
  Hashtags: HashtagType[];
  introduction: SectionRevisionType | null | undefined;
  feature: SectionRevisionType | null | undefined;
  additionalInfo: SectionRevisionType | null | undefined;
  reviews: ReviewType[];
}
export type { DocumentType };