"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDetailDocument } from "@/lib/fetcher";
import { LocalStorage } from "@/lib/localStorage"; // 파일명이 loalStorage.ts이면 경로를 "@/lib/loalStorage" 로
import type { DetailDocument } from "../../../../types/complex";

const toKey = (v: string | number | undefined) => String(v ?? "");

export default function Detail() {
  const { page } = useParams<{ page: string }>();
  const docKey = toKey(page);

  const [doc, setDoc] = useState<DetailDocument | null>(null);
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
        const data = (await getDetailDocument(
          Number(page)
        )) as DetailDocument | null;
        if (!ignore) setDoc(data ?? null);
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
          <Link
            href={`/detail/${page}`}
            className="text-base font-bold text-gray-900 hover:underline"
          >
            {doc?.title}
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
                ${
                  isFav
                    ? "border border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              title={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              {isFav ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.48 3.499a1 1 0 0 1 1.04 0l3.22 1.94 3.6.52a1 1 0 0 1 .56 1.7l-2.6 2.54.61 3.57a1 1 0 0 1-1.45 1.05L12 14.77l-3.21 1.69a1 1 0 0 1-1.45-1.05l.61-3.57-2.6-2.54a1 1 0 0 1 .56-1.7l3.6-.52 3.22-1.94Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M11.48 3.499a1 1 0 0 1 1.04 0l3.22 1.94 3.6.52a1 1 0 0 1 .56 1.7l-2.6 2.54.61 3.57a1 1 0 0 1-1.45 1.05L12 14.77l-3.21 1.69a1 1 0 0 1-1.45-1.05l.61-3.57-2.6-2.54a1 1 0 0 1 .56-1.7l3.6-.52 3.22-1.94Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
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
            <span className="truncate">{doc?.location}</span>
          </div>

          {/* 해시태그 */}
          <div className="mb-6 flex flex-wrap gap-2">
            {doc?.Hashtags.map((item) => (
              <button
                key={item.id}
                type="button"
                className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 active:scale-[0.98] transition"
                aria-label={`${item.content} 필터`}
              >
                {String(item.content).startsWith("#")
                  ? item.content
                  : `#${item.content}`}
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
                  if (el)
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
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
              {doc?.introduction?.content ?? "소개 내용이 없습니다."} (
              {doc?.introduction?.created_by} / {doc?.introduction?.created_at})
            </div>
          </section>

          {/* 특징 */}
          <section id="feature" className="mb-8 scroll-mt-16">
            <h2 className="text-xl font-semibold mb-2">특징</h2>
            <div className="rounded border bg-white p-4">
              {doc?.feature?.content ?? "특징 정보가 없습니다."} (
              {doc?.feature?.created_by} / {doc?.feature?.created_at})
            </div>
          </section>

          {/* 방문객 의견 */}
          <section id="reviews" className="mb-8 scroll-mt-16">
            <h2 className="text-xl font-semibold mb-3">방문객 의견</h2>
            <div className="space-y-3">
              {doc?.reviews?.map((review) => (
                <div className="rounded border bg-white p-4 text-gray-500">
                  {review.content} ({review.created_by}/{review.created_at})
                </div>
              ))}
            </div>
          </section>

          {/* 추가 정보 */}
          <section id="more" className="mb-16 scroll-mt-16">
            <h2 className="text-xl font-semibold mb-2">추가 정보</h2>
            <div className="rounded border bg-white p-4">
              {doc?.additionalInfo?.content ?? "추가 정보가 없습니다."} (
              {doc?.additionalInfo?.created_by} /{" "}
              {doc?.additionalInfo?.created_at})
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
