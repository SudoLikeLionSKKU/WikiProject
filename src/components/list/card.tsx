"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ListDocument } from "..//..//..//types/complex";
import { FavoriteHandler } from "@/lib/FavoriteHandler";
import { LocalStorage } from "@/lib/localStorage";

type Props = {
  doc: ListDocument;
  indexText?: string;
  detailHref?: string;
};

export default function Card({ doc, indexText = "", detailHref }: Props) {
  const { id, title, introduction, Hashtags, location, stars } = doc;

  // 1) 파생 데이터(메모이제이션)
  const idStr = useMemo(() => (id != null ? String(id) : ""), [id]);
  const intro = introduction?.content ?? "";
  const hashtags = (Hashtags?.map(h => h.content).filter(Boolean)) ?? [];

  // 2) 상태
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState<number>(stars ?? 0);

  // 3) 초기/재동기화: doc 변경 시 즐겨찾기/별점 동기화
  useEffect(() => {
    // 별점은 props 변경을 신뢰해 동기화
    setCount(stars ?? 0);

    // 즐겨찾기 여부는 LocalStorage에서 안전 조회
    if (!idStr) return;
    try {
      const favs = LocalStorage.GetFavorites();
      setLiked(favs.includes(idStr));
    } catch {
      setLiked(false);
    }
  }, [idStr, stars]);

  // 4) 즐겨찾기 토글 (낙관적 업데이트 + 실패 시 롤백)
  const toggleLike = async () => {
    if (!idStr) return;

    const next = !liked;
    setLiked(next);
    setCount(prev => Math.max(0, prev + (next ? 1 : -1)));

    try {
      if (next) {
        await FavoriteHandler.SetFavorites(doc);
      } else {
        await FavoriteHandler.RemoveFavorites(doc);
      }
    } catch (err) {
      console.error("Failed to update favorite:", err);
      // 롤백
      setLiked(!next);
      setCount(prev => Math.max(0, prev + (next ? -1 : 1)));
    }
  };

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-gray-500">{indexText}</div>
        <div className="text-xs text-gray-400">{location || ""}</div>
      </div>

      <h3 className="mb-2 text-lg font-semibold leading-tight">{title}</h3>

      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
        {intro || "소개 문구가 아직 등록되지 않았습니다."}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {hashtags.length > 0 ? (
          hashtags.map((t, i) => (
            <button
              key={`${t}-${i}`}
              type="button"
              className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              #{t}
            </button>
          ))
        ) : (
          <div className="py-1 text-xs text-gray-400">#해시태그없음</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-pressed={liked}
          onClick={toggleLike}
          className="flex items-center gap-1 text-sm"
        >
          <Heart filled={liked} />
          <span className={liked ? "text-red-600" : "text-gray-900"}>{count}</span>
        </button>

        {detailHref ? (
          <Link
            href={detailHref}
            className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            상세 보기
          </Link>
        ) : (
          <span className="invisible rounded-xl border border-gray-300 px-3 py-1.5 text-sm">
            상세 보기
          </span>
        )}
      </div>
    </article>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-5 w-5 transition-colors ${filled ? "text-red-600" : "text-gray-400 hover:text-gray-600"}`}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.824 0-3.41.997-4.312 2.475C11.099 4.747 9.513 3.75 7.688 3.75 5.099 3.75 3 5.765 3 8.25c0 6.188 8.25 11.25 9 11.25s9-5.062 9-11.25z"
      />
    </svg>
  );
}
