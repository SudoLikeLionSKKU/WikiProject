// src/components/list/card.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import type { ListDocument } from "..//..//..//types/complex";

type Props = {
  doc: ListDocument;
  indexText?: string;
  detailHref?: string;
};

export default function Card({ doc, indexText = "", detailHref }: Props) {
  // ✅ ListDocument에 있는 필드만 사용
  const title = doc.title;
  const intro = doc.introduction?.content ?? "";

  // Hashtags: ListDocument에서는 각 항목이 { id, document_id, content, created_at } 형태
  const hashtags =
    Array.isArray(doc.Hashtags) ? doc.Hashtags.map((h) => h.content).filter(Boolean) : [];

  // 좋아요: 타입에 없으므로 로컬 상태만 사용(초기값 0/false)
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const toggleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
  };

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-gray-500">{indexText}</div>
        <div className="text-xs text-gray-400">혜화동 450m</div>
      </div>

      <h3 className="mb-2 text-lg font-semibold leading-tight">{title}</h3>

      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
        {intro || "소개 문구가 아직 등록되지 않았습니다."}
      </p>

      {/* 해시태그: 클릭 가능(동작 없음) */}
      <div className="mb-4 flex flex-wrap gap-2">
        {hashtags.length > 0 ? (
          hashtags.map((t, i) => (
            <button
              key={`${t}-${i}`}
              type="button"
              className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              #{t}
            </button>
          ))
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-400 cursor-not-allowed"
          >
            #해시태그없음
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        {/* ♥ 토글 (로컬 UI만) */}
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
      className={`h-5 w-5 ${filled ? "text-red-600" : "text-gray-900"}`}
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
