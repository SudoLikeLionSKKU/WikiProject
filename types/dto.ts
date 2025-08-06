import {
  HashtagType,
  ReviewType,
  SectionRevisionType,
  SectionType,
} from "./basic";

export interface DetailSection extends SectionType {
  SectionRevisions: SectionRevisionType[];
}

/**
 * @description 리스트 페이지에서 사용되는 Document 자료형
 */
export interface ListDocument extends Document {
  Hashtags: HashtagType[];
  introduction: SectionRevisionType;
}

/**
 * @description 상세 페이지에서 사용되는 Document 자료형
 */
export interface DetailDocument extends Document {
  Hashtags: HashtagType[];
  introduction: SectionRevisionType;
  feature: SectionRevisionType;
  additionalInfo: SectionRevisionType;
  reviews: ReviewType;
}
