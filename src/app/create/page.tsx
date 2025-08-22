"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, ChangeEvent, KeyboardEvent } from "react";
import { createDocument } from "@/lib/fetcher";
import type { CreateDocumentDto } from "../../../types/dto";
import { seoulGuDong } from "../../../types/seoulGuDong";

/** 간단한 디바운스 헬퍼 */
function useDebouncedCallback<T extends (...args: any[]) => void>(cb: T, delay = 600) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (...args: Parameters<T>) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => cb(...args), delay);
  };
}

export default function CreateDocumentPage() {
  const router = useRouter();

  /** DTO 상태 */
  const [dto, setDto] = useState<CreateDocumentDto>({
    doc_created_by: "",
    doc_dong: "",
    doc_gu: "",
    doc_title: "",
    doc_location: "",
    // 카테고리는 더 이상 사용하지 않지만 DTO에 존재할 수 있으므로 빈 값 유지
    doc_category: "",
    intro_content: "",
    feature_content: "",
    additional_info_content: "",
    hashtags_content: [],
  });

  /** 제출 로딩/에러 */
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /** 입력 유효성 */
  const isValid = useMemo(() => {
    if (!dto.doc_title.trim()) return false;
    if (!dto.doc_created_by.trim()) return false;
    if (!dto.doc_gu.trim()) return false;
    if (!dto.doc_dong.trim()) return false;
    if (!dto.doc_location.trim()) return false;
    return true;
  }, [dto]);

  /** 공통 변경 핸들러 */
  const onChange =
    <K extends keyof CreateDocumentDto>(key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setDto((prev) => ({ ...prev, [key]: e.target.value }));
    };

  /** 수동 태그 입력 */
  const [tagInput, setTagInput] = useState("");
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      const clean = tagInput.replaceAll("#", "").replaceAll(",", " ").trim();
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

  /** ---------------- AI 추천 태그 ---------------- */
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [aiError, setAiError] = useState<string | null>(null);

  const canTriggerAI = useMemo(() => {
    const text = [
      dto.doc_title,
      dto.intro_content,
      dto.feature_content,
      dto.additional_info_content,
    ]
      .filter(Boolean)
      .join(" ");
    return text.replace(/\s/g, "").length >= 10;
  }, [
    dto.doc_title,
    dto.intro_content,
    dto.feature_content,
    dto.additional_info_content,
  ]);

  const requestAITags = async () => {
    try {
      if (!canTriggerAI) {
        setAiTags([]);
        setAiStatus("idle");
        return;
      }
      setAiStatus("loading");
      setAiError(null);

      const res = await fetch("/api/hashtag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: dto.doc_title,
          intro: dto.intro_content,
          feature: dto.feature_content,
          more: dto.additional_info_content,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("AI 태그 API 실패:", res.status, text);
        setAiStatus("error");
        setAiError(text || "추천 태그 요청 실패");
        return;
      }
      const data = await res.json();
      const tags: string[] = Array.isArray(data?.tags) ? data.tags : [];
      setAiTags(tags);
      setAiStatus("done");
    } catch (err: any) {
      console.error(err);
      setAiStatus("error");
      setAiError(err?.message ?? "알 수 없는 오류");
    }
  };

  const debouncedRequestAITags = useDebouncedCallback(requestAITags, 700);

  useEffect(() => {
    debouncedRequestAITags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dto.doc_title,
    dto.intro_content,
    dto.feature_content,
    dto.additional_info_content,
  ]);

  /** 추천 태그 클릭하면 선택 토글 */
  const togglePickAiTag = (t: string) => {
    const clean = t.replace(/^#/, "").trim();
    setDto((prev) => {
      const exists = prev.hashtags_content.includes(clean);
      return {
        ...prev,
        hashtags_content: exists
          ? prev.hashtags_content.filter((x) => x !== clean)
          : [...prev.hashtags_content, clean],
      };
    });
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

            <div className="flex items-center gap-3">
              {/* 구 선택 */}
              <div className="relative w-[280px]">
                <select
                  value={dto.doc_gu}
                  onChange={onChange("doc_gu")}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 outline-none ring-blue-500 focus:ring-2"
                  required
                >
                  <option value="">구</option>
                  {Object.keys(seoulGuDong).map((gu) => (
                    <option key={gu} value={gu}>
                      {gu}
                    </option>
                  ))}
                </select>
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

              {/* 동 선택 */}
              <div className="relative w-[280px]">
                <select
                  value={dto.doc_dong}
                  onChange={onChange("doc_dong")}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 outline-none ring-blue-500 focus:ring-2 disabled:bg-gray-100"
                  required
                  disabled={!dto.doc_gu}
                >
                  <option value="">동</option>
                  {dto.doc_gu &&
                    seoulGuDong[dto.doc_gu].map((dong) => (
                      <option key={dong} value={dong}>
                        {dong}
                      </option>
                    ))}
                </select>
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
            </div>
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

        {/* RIGHT: AI 추천 태그 */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-lg font-semibold">AI 추천 태그</div>
              <button
                type="button"
                onClick={requestAITags}
                className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
                title="다시 분석"
              >
                새로고침
              </button>
            </div>

            {/* 상태 안내 */}
            {aiStatus === "idle" && (
              <p className="text-sm text-gray-500">추천이 아직 없습니다.</p>
            )}
            {aiStatus === "loading" && (
              <p className="text-sm text-gray-500">AI 분석 중…</p>
            )}
            {aiStatus === "error" && (
              <p className="text-sm text-red-600">추천 실패: {aiError ?? "오류"}</p>
            )}

            {/* 추천 태그 목록 */}
            {aiTags.length > 0 && (
              <div className="mb-3 mt-1 flex flex-wrap gap-2">
                {aiTags.map((t) => {
                  const picked = dto.hashtags_content.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => togglePickAiTag(t)}
                      className={`rounded-full px-3 py-1 text-sm ring-1 transition ${
                        picked
                          ? "bg-blue-600 text-white ring-blue-600"
                          : "bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100"
                      }`}
                    >
                      #{t}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 현재 선택된 태그 */}
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

            {/* 수동 입력 */}
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
            !isValid || submitting ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {submitting ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
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
        {!isValid && (
          <p className="mt-2 text-center text-sm text-gray-500">
            필수 항목(작성자/구/동/정확한 위치/제목)을 입력해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}
