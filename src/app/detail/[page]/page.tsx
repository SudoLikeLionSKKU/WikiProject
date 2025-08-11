"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDetailDocument } from "@/lib/fetcher";
import { LocalStorage } from "@/lib/localStorage"; // 파일명이 loalStorage.ts이면 경로를 "@/lib/loalStorage" 로
import type { DetailDocument } from "../../../../types/complex";

type MaybeObj = { content?: unknown; name?: unknown; tag?: unknown } & Record<string, unknown>;

const pickText = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);

  if (Array.isArray(v)) {
    // 배열이면 각 요소를 재귀로 문자열화 후 빈값 제거하고 줄바꿈으로 합침
    return v.map(pickText).filter(Boolean).join("\n\n");
  }

  if (typeof v === "object") {
    const o = v as MaybeObj;
    // 흔한 케이스: { id, content, ... }
    if (o.content != null) return pickText(o.content);
    // 혹시 다른 키로 텍스트를 담는 경우까지 커버
    if (o.name != null) return pickText(o.name);
    if (o.tag != null) return pickText(o.tag);
  }

  // 마지막 방어
  try { return JSON.stringify(v); } catch { return String(v); }
};

const pickTags = (v: unknown): string[] => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(pickText).filter(Boolean);
  // 단일 값이면 1개짜리 배열로
  return [pickText(v)].filter(Boolean);
};

type DetailVM = {
  intro?: string;
  feature?: string;
  additional?: string;
  hashtags?: string[];
};

function toVM(d: DetailDocument): DetailVM {
  // 다양한 백엔드 필드명 변형을 방어적으로 처리
  const introRaw =
    (d as any).intro_content ?? (d as any).intro ?? (d as any).introParagraphs;
  const featureRaw =
    (d as any).feature_content ?? (d as any).feature ?? (d as any).body;
  const additionalRaw =
    (d as any).additional_info_content ?? (d as any).additional ?? (d as any).extra;

  const hashtagsRaw =
    (d as any).hashtags_content ?? (d as any).hashtags ?? (d as any).tags ?? [];

  return {
    intro: pickText(introRaw),
    feature: pickText(featureRaw),
    additional: pickText(additionalRaw),
    hashtags: pickTags(hashtagsRaw),
  };
}


const toKey = (v: string | number | undefined) => String(v ?? "");

export default function Detail() {
  const { page } = useParams<{ page: string }>();
  const docKey = toKey(page);

  const [doc, setDoc] = useState<DetailVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 즐겨찾기 상태
  const [isFav, setIsFav] = useState(false);

  // 문서 데이터 로드
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = (await getDetailDocument(Number(page))) as DetailDocument | null;
        if (!ignore) setDoc(data ? toVM(data) : null);
      } catch {
        if (!ignore) setErr("문서를 불러오는 중 오류가 발생했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [page]);

  // 진입 시 즐겨찾기 조회
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const favs: unknown = await (LocalStorage as any).GetFavorites?.();

        let has = false;
        if (Array.isArray(favs)) {
          has = favs.map(toKey).includes(docKey);
        } else if (favs && typeof favs === "object") {
          has = !!(favs as Record<string, boolean>)[docKey];
        }
        if (!ignore) setIsFav(has);
      } catch {
        // 조회 실패는 무시
      }
    })();
    return () => {
      ignore = true;
    };
  }, [docKey]);

  // 즐겨찾기 토글
  const toggleFavorite = async () => {
    try {
      const next = !isFav;

      if ((LocalStorage as any).SetFavorites?.length >= 2) {
        await (LocalStorage as any).SetFavorites(docKey, next);
      } else if ((LocalStorage as any).SetFavorites) {
        await (LocalStorage as any).SetFavorites(docKey);
      } else {
        const favs: unknown = await (LocalStorage as any).GetFavorites?.();
        let list: string[] = [];
        if (Array.isArray(favs)) list = favs.map(toKey);
        else if (favs && typeof favs === "object") {
          list = Object.entries(favs as Record<string, boolean>)
            .filter(([, v]) => !!v)
            .map(([k]) => k);
        }
        const set = new Set(list);
        next ? set.add(docKey) : set.delete(docKey);
        await (LocalStorage as any).SetFavorites?.(Array.from(set));
      }

      setIsFav(next);
    } catch {
      alert("즐겨찾기 저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <>
      {/* 최상단 고정 헤더 */}
      <header className="fixed inset-x-0 top-0 z-40 h-12 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
          {/* 좌측: 제목(클릭 시 현재 상세로 이동) */}
          <Link href={`/detail/${page}`} className="text-base font-bold text-gray-900 hover:underline">
            성대커피
          </Link>

          {/* 우측: 편집 / 즐겨찾기 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition"
              aria-label="편집"
            >
              편집
            </button>

            <button
              type="button"
              onClick={toggleFavorite}
              aria-pressed={isFav}
              aria-label="즐겨찾기"
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium active:scale-[0.98] transition
                ${isFav
                  ? "border border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
              title={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              {isFav ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.48 3.499a1 1 0 0 1 1.04 0l3.22 1.94 3.6.52a1 1 0 0 1 .56 1.7l-2.6 2.54.61 3.57a1 1 0 0 1-1.45 1.05L12 14.77l-3.21 1.69a1 1 0 0 1-1.45-1.05l.61-3.57-2.6-2.54a1 1 0 0 1 .56-1.7l3.6-.52 3.22-1.94Z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M11.48 3.499a1 1 0 0 1 1.04 0l3.22 1.94 3.6.52a1 1 0 0 1 .56 1.7l-2.6 2.54.61 3.57a1 1 0 0 1-1.45 1.05L12 14.77l-3.21 1.69a1 1 0 0 1-1.45-1.05l.61-3.57-2.6-2.54a1 1 0 0 1 .56-1.7l3.6-.52 3.22-1.94Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              )}
              <span>{isFav ? "즐겨찾기됨" : "즐겨찾기"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 헤더 높이만큼 여백 확보 */}
      <div className="pt-14 flex min-h-screen bg-gray-50">
        {/* 왼쪽 사이드바 */}
        <aside className="w-64 bg-white shadow-sm border-r p-4">
          <h2 className="text-lg font-semibold mb-3">기본 정보</h2>

          {/* 위치 + 거리 (고정 텍스트) */}
          <div className="mb-4 flex items-center text-sm text-gray-700">
            <svg
              className="mr-2 h-4 w-4 shrink-0 text-gray-700"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M11 2a1 1 0 0 1 2 0v1.055A8.002 8.002 0 0 1 20.945 11H22a1 1 0 1 1 0 2h-1.055A8.002 8.002 0 0 1 13 20.945V22a1 1 0 1 1-2 0v-1.055A8.002 8.002 0 0 1 3.055 13H2a1 1 0 1 1 0-2h1.055A8.002 8.002 0 0 1 11 3.055V2Zm1 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
            </svg>
            <span className="truncate">혜화동 · 450m</span>
          </div>

          {/* 해시태그 */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(doc?.hashtags?.length
              ? doc.hashtags
              : ["#조용함", "#스터디카페", "#콘센트", "#테라스"])!.map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 active:scale-[0.98] transition"
                aria-label={`${tag} 필터`}
              >
                {String(tag).startsWith("#") ? tag : `#${tag}`}
              </button>
            ))}
          </div>

          {/* 목차 */}
          <h3 className="text-sm font-semibold text-gray-800 mb-2">목차</h3>
          <nav className="flex flex-col gap-1 text-sm">
            {[
              { i: 1, t: "소개", id: "intro" },
              { i: 2, t: "특징", id: "feature" },
              { i: 3, t: "방문객 의견", id: "reviews" },
              { i: 4, t: "추가 정보", id: "more" },
            ].map((sec) => (
              <button
                key={sec.i}
                type="button"
                onClick={() => {
                  const el = document.getElementById(sec.id);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="w-full rounded-md px-2 py-1 text-left text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition"
                aria-label={`${sec.t}로 이동`}
              >
                {sec.i}. {sec.t}
              </button>
            ))}
          </nav>
        </aside>

        {/* 메인 */}
        <main className="flex-1 p-6">
          <header className="flex items-center justify-between mb-6">
            <span className="text-sm text-gray-500">문서 번호: {page}</span>
          </header>

          {err && (
            <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}
          {loading && !doc && (
            <div className="mb-8 animate-pulse space-y-4">
              <div className="h-6 w-40 rounded bg-gray-200" />
              <div className="h-24 rounded bg-gray-200" />
              <div className="h-6 w-28 rounded bg-gray-200" />
              <div className="h-24 rounded bg-gray-200" />
            </div>
          )}

          {/* 소개 */}
          <section id="intro" className="mb-8 scroll-mt-16">
            <h2 className="text-xl font-semibold mb-2">소개</h2>
            <div className="rounded border bg-white p-4">
              {doc?.intro ?? "소개 내용이 없습니다."}
            </div>
          </section>

          {/* 특징 */}
          <section id="feature" className="mb-8 scroll-mt-16">
            <h2 className="text-xl font-semibold mb-2">특징</h2>
            <div className="rounded border bg-white p-4">
              {doc?.feature ?? "특징 정보가 없습니다."}
            </div>
          </section>

          {/* 방문객 의견 */}
          <section id="reviews" className="mb-8 scroll-mt-16">
            <h2 className="text-xl font-semibold mb-3">방문객 의견</h2>
            <div className="space-y-3">
              <div className="rounded border bg-white p-4 text-gray-500">추후 연동 예정</div>
            </div>
          </section>

          {/* 추가 정보 */}
          <section id="more" className="mb-16 scroll-mt-16">
            <h2 className="text-xl font-semibold mb-2">추가 정보</h2>
            <div className="rounded border bg-white p-4">
              {doc?.additional ?? "추가 정보가 없습니다."}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
