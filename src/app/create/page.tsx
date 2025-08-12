"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, ChangeEvent, KeyboardEvent } from "react";
import { createDocument } from "@/lib/fetcher"; // 실제 함수 위치(fetcher) 기준
import type { CreateDocumentDto } from "../../../types/dto";

/** 카테고리 옵션(임의) */
const CATEGORY_OPTIONS = [
  { id: "식당", label: "식당" },
  { id: "카페", label: "카페" },
  { id: "의료", label: "의료" },
  { id: "주거", label: "주거" },
  { id: "문화", label: "문화" },
  { id: "공원", label: "공원" },
];

/** 추천 해시태그(임의) */
const RECOMMENDED_TAGS = [
  "조용한카페",
  "운동시설좋음",
  "디카페인",
  "피트니스",
  "스터디카페",
];

export default function CreateDocumentPage() {
  const router = useRouter();

  /** DTO 상태를 최초부터 명확히 정의 */
  const [dto, setDto] = useState<CreateDocumentDto>({
    doc_created_by: "",
    doc_dong: "",
    doc_gu: "",
    doc_title: "",
    doc_location: "",
    doc_category: "",
    intro_content: "",
    feature_content: "",
    additional_info_content: "",
    hashtags_content: [],
  });

  /** 제출 로딩/에러 */
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /** 간단 유효성 */
  const isValid = useMemo(() => {
    if (!dto.doc_title.trim()) return false;
    if (!dto.doc_category.trim()) return false;
    if (!dto.doc_created_by.trim()) return false;
    if (!dto.doc_gu.trim()) return false;
    if (!dto.doc_dong.trim()) return false;
    if (!dto.doc_location.trim()) return false;
    return true;
  }, [dto]);

  /** 공통 input 변경 핸들러 */
  const onChange =
    <K extends keyof CreateDocumentDto>(key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setDto((prev) => ({ ...prev, [key]: e.target.value }));
    };

  /** 해시태그 토글(추천 태그 클릭 시 추가/삭제) */
  const toggleTag = (rawTag: string) => {
    const tag = normalizeTag(rawTag);
    setDto((prev) => {
      const exists = prev.hashtags_content.includes(tag);
      const next = exists
        ? prev.hashtags_content.filter((t) => t !== tag)
        : [...prev.hashtags_content, tag];
      return { ...prev, hashtags_content: next };
    });
  };

  /** 해시태그 직접 입력: 스페이스/쉼표로 구분 */
  const [tagInput, setTagInput] = useState("");
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      const clean = normalizeTag(tagInput);
      if (clean) {
        setDto((prev) =>
          prev.hashtags_content.includes(clean)
            ? prev
            : { ...prev, hashtags_content: [...prev.hashtags_content, clean] }
        );
        setTagInput("");
      }
    }
  };
  const removeTag = (tag: string) => {
    setDto((prev) => ({
      ...prev,
      hashtags_content: prev.hashtags_content.filter((t) => t !== tag),
    }));
  };

  /** 제출 */
  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const newId = await createDocument(dto);
      alert("문서가 생성되었습니다!");
      router.push(`/detail/${newId}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message ?? "문서 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* 로고/타이틀 */}
      <div className="mb-4 text-2xl font-bold text-blue-600">동네백과</div>

      {/* 상단 경고/에러 */}
      {errorMsg && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {errorMsg}
        </div>
      )}

      {/* 좌: 본문 / 우: 보조 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* LEFT: 제목 + 본문들 */}
        <section className="md:col-span-2 space-y-4">
          {/* 작성자 / 구 / 동 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              value={dto.doc_created_by}
              onChange={onChange("doc_created_by")}
              placeholder="작성자"
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none ring-blue-500 focus:ring-2"
            />
            <input
              value={dto.doc_gu}
              onChange={onChange("doc_gu")}
              placeholder="구 (예: 종로구)"
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none ring-blue-500 focus:ring-2"
            />
            <input
              value={dto.doc_dong}
              onChange={onChange("doc_dong")}
              placeholder="동 (예: 명륜3가)"
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none ring-blue-500 focus:ring-2"
            />
          </div>

          {/* 제목 */}
          <input
            value={dto.doc_title}
            onChange={onChange("doc_title")}
            placeholder="제목"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg outline-none ring-blue-500 focus:ring-2"
          />

          {/* 정확한 위치 */}
          <input
            value={dto.doc_location}
            onChange={onChange("doc_location")}
            placeholder="정확한 위치 (도로명 주소 등)"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none ring-blue-500 focus:ring-2"
          />

          {/* 소개 */}
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700">소개</div>
            <textarea
              value={dto.intro_content}
              onChange={onChange("intro_content")}
              placeholder="소개 내용을 입력하세요"
              className="h-36 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none ring-blue-500 focus:ring-2"
            />
          </div>

          {/* 특징 */}
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700">특징</div>
            <textarea
              value={dto.feature_content}
              onChange={onChange("feature_content")}
              placeholder="특징을 입력하세요"
              className="h-36 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none ring-blue-500 focus:ring-2"
            />
          </div>

          {/* 추가 정보 */}
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700">추가 정보</div>
            <textarea
              value={dto.additional_info_content}
              onChange={onChange("additional_info_content")}
              placeholder="추가 정보를 입력하세요"
              className="h-36 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none ring-blue-500 focus:ring-2"
            />
          </div>
        </section>

        {/* RIGHT: 카테고리 + 해시태그 */}
        <aside className="space-y-4">
          {/* 카테고리(ComboBox) + 위치 박스(모양용) */}
          <div className="flex items-center gap-3">
            {/* ComboBox */}
            <div className="relative w-full">
              <select
                value={dto.doc_category}
                onChange={onChange("doc_category")}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 outline-none ring-blue-500 focus:ring-2"
              >
                <option value="">카테고리 선택</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              {/* caret */}
              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* 위치 박스(디자인 유지용) */}
            <div className="inline-flex items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900 min-w-[110px]">
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 22s7-5.686 7-12a7 7 0 10-14 0c0 6.314 7 12 7 12z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="10"
                    r="2.8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
                <span className="whitespace-nowrap">위치</span>
              </span>
              <svg
                className="ml-3 h-4 w-4 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M7 10l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* 해시태그 추천 */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 text-lg font-semibold">해시태그</div>

            {/* 추천 태그 */}
            <div className="mb-3 flex flex-wrap gap-2">
              {RECOMMENDED_TAGS.map((t) => {
                const selected = dto.hashtags_content.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`rounded-full px-3 py-1 text-sm ring-1 transition ${
                      selected
                        ? "bg-blue-600 text-white ring-blue-600"
                        : "bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>

            {/* 현재 태그 목록 */}
            {dto.hashtags_content.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {dto.hashtags_content.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label={`${tag} 제거`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 직접 입력 */}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="태그 입력 후 스페이스/엔터/쉼표"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none ring-blue-500 focus:ring-2"
            />
          </div>
        </aside>
      </div>

      {/* 하단 제출 버튼 */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-lg text-white shadow-sm transition ${
            !isValid || submitting
              ? "bg-blue-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {submitting ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeWidth="4"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
              업로드 중...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              문서 업로드
            </>
          )}
        </button>
        {/* 간단 안내 */}
        {!isValid && (
          <p className="mt-2 text-center text-sm text-gray-500">
            필수 항목(작성자/구/동/정확한 위치/제목/카테고리)을 입력해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}

/** 태그 전처리: 공백/#, 쉼표 제거 & 소문자/트림 */
function normalizeTag(raw: string) {
  const t = raw.replaceAll("#", "").replaceAll(",", " ").trim();
  if (!t) return "";
  return t;
}
