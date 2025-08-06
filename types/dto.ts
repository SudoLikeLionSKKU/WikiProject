import { Hashtag, Review, SectionRevision, Section } from "./basic";

export interface DetailSection extends Section {
  SectionRevisions: SectionRevision[];
}

/**
 * @description 리스트 페이지에서 사용되는 Document 자료형
 */
export interface ListDocument extends Document {
  Hashtags: Hashtag[];
  introduction: SectionRevision;
}

/**
 * @description 상세 페이지에서 사용되는 Document 자료형
 */
export interface DetailDocument extends Document {
  Hashtags: Hashtag[];
  introduction: SectionRevision;
  feature: SectionRevision;
  additionalInfo: SectionRevision;
  reviews: Review;
}
