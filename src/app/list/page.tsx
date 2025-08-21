"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Card from "@/components/list/card";
import type { ListDocument } from "..//..//..//types/complex";
import { getListDocuments } from "@/lib/fetcher";

const CATEGORY_ALIAS: Record<string, string> = {};
const NAME_TO_ID: Record<string, string> = {};
const CATEGORY_NAME_BY_ID: Record<number, string> = {};

export default function ListPage() {
  const [docs, setDocs] = useState<ListDocument[]>([]);

  const params = useParams<{ category?: string }>();
  const qsCategory =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("category")
      : null;
  const rawParam = (params?.category as string) ?? qsCategory ?? "";

  const normalized = (() => {
    const key = decodeURIComponent(rawParam).trim();
    return key ? (CATEGORY_ALIAS[key] ?? key) : "";
  })();
  const requestCategory = /^\d+$/.test(normalized)
    ? normalized
    : (NAME_TO_ID[normalized] ?? normalized);

  useEffect(() => {
    (async () => {
      try {
        const res = await getListDocuments(20, requestCategory);
        setDocs(Array.isArray(res) ? res : []);
      } catch {
        setDocs([]);
      }
    })();
  }, [requestCategory]);

  const [searchInput, setSearchInput] = useState<string>("");  // 입력창 값
  const [filterKeyword, setFilterKeyword] = useState<string>(""); // 커밋된 검색어

  const getTitle = (d: any): string =>
    String(
      d?.title ??
      d?.Title ??
      d?.name ??
      d?.Name ??
      d?.documentTitle ??
      d?.DocumentTitle ??
      ""
    );

  const filteredDocs = useMemo(() => {
    const kw = filterKeyword.trim().toLowerCase();
    if (!kw) return docs; // 빈 검색어면 전체 표시
    return docs.filter((d) => getTitle(d).toLowerCase().includes(kw));
  }, [docs, filterKeyword]);

  const handleSearchClick = () => {
    // 버튼(돋보기) 클릭 시 검색어 커밋
    setFilterKeyword(searchInput);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      setFilterKeyword(searchInput);
    }
  };

  const categoryName =
    CATEGORY_NAME_BY_ID[Number(docs[0]?.category)] ||
    (typeof docs[0]?.category === "string" ? (docs[0]?.category as string) : "") ||
    normalized ||
    rawParam ||
    "";
  const headerTitle = categoryName ? `${categoryName} 카테고리` : "카테고리";
  const headerDescMap: Record<string, string> = {
    카페: "우리 동네에서 조용히 공부하기 좋은 카페를 찾아보세요.",
    식당: "우리 동네에서 든든하고 맛있는 밥집을 찾아보세요.",
    의료: "우리 동네의 병원·약국 등 의료 정보를 확인해보세요.",
    주거: "우리 동네의 주거/부동산 정보를 찾아보세요.",
    문화: "전시·공연·도서관 등 우리 동네 문화 공간을 찾아보세요.",
    공원: "산책·러닝하기 좋은 공원/녹지를 둘러보세요.",
  };
  const headerDesc = headerDescMap[categoryName] ?? "우리 동네의 유용한 정보를 확인해보세요.";

  const recommendedTags = useMemo(() => {
    const counter = new Map<string, number>();
    for (const d of docs) {
      const arr = (d as any)?.Hashtags ?? [];
      for (const h of arr) {
        const t = String(h?.content || "").replace(/^#/, "").trim();
        if (!t) continue;
        counter.set(t, (counter.get(t) || 0) + 1);
      }
    }
    return [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([t]) => t);
  }, [docs]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 border-b border-gray-200 bg-white">
        <div className="px-0 py-3">
          <Link href="/" className="text-lg font-bold text-gray-900 hover:text-blue-600">
            동네백과
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{headerTitle}</h1>
        <p className="mt-1 text-sm text-gray-600">{headerDesc}</p>

        <div className="mt-4 flex gap-3 items-center">
          <div className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 w-full max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="제목으로 검색"
              className="flex-1 outline-none bg-transparent text-sm"
              aria-label="검색어 입력"
            />
            <button
              type="button"
              onClick={handleSearchClick}
              aria-label="검색"
              className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              title="검색"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <button
            type="button"
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            지도 보기
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {(recommendedTags.length ? recommendedTags : ["조용한카페", "운동시설옆", "디카페인", "스터디카페", "피트니스"]).map((t) => (
            <button
              key={t}
              type="button"
              className="rounded-full border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-50"
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc, idx) => (
            <Card
              key={doc.id ?? `doc-${idx}`}
              doc={doc}
              indexText={`${idx + 1}.`}
              detailHref={`/detail/${doc.id}`}
            />
          ))
        ) : (
          <p>조건에 맞는 결과가 없습니다.</p>
        )}
      </section>
    </main>
  );
}
