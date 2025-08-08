import { Database } from "./database.types";

export type Location = {
  gu: string;
  dong: string;
};

/**
 * @description Document 원시 자료에 대한 타입 정의입니다.
 * Document 자체는 상세 내용을 포함하지 않고 있으며 해당 Document에 대한 상세정보는 Section, SectionRivison을 통해 저장됩니다.
 */
export type DocumentType = Database["public"]["Tables"]["Documents"]["Row"];

/**
 * @description 어떤 document가 어떤 hashtag를 가졌는지에 대한 타입 정의입니다.
 */
export type HashtagType = Database["public"]["Tables"]["Hashtags"]["Row"];

/**
 * @description 상세 페이지의 방문객 의견에 해당하는 리뷰 정보를 담는 타입 정의입니다.
 */
export type ReviewType = Database["public"]["Tables"]["Reviews"]["Row"];

/**
 * @description Document와 SectionRevisions 사이에서 해당 Document의 최신 Section 수정항목이 무엇인지에 대한 정보를 담습니다.
 */
export type SectionType = Database["public"]["Tables"]["Sections"]["Row"];

/**
 * @description 실제 버전 별로 상세 정보를 담아놓는 항목입니다.
 */
export type SectionRevisionType =
  Database["public"]["Tables"]["SectionRevisions"]["Row"];

export const SECTION_KEY_INTRODUCTION = "introduction";
export const SECTION_KEY_FEATURE = "feature";
export const SECTION_KEY_ADDITIONAL_INFO = "additionalInfo";
