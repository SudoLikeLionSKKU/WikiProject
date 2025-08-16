"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Card from "@/components/list/card";
import type { ListDocument } from "..//..//..//types/complex";
import { getListDocuments } from "@/lib/fetcher";

const CATEGORY_ALIAS: Record<string, string> = {};
const NAME_TO_ID: Record<string, string> = {};
const CATEGORY_NAME_BY_ID: Record<number, string> = {};

export default function ListPage() {
  const [docs, setDocs] = useState<ListDocument[]>([]);
  const searchParams = useSearchParams();

  const recommendedTags = useMemo(() => {
  const counter = new Map<string, number>();
  for (const d of docs) {
    const arr = d?.Hashtags ?? [];
    for (const h of arr) {
      const t = String(h?.content || "").replace(/^#/, "").trim();
      if (!t) continue;
      counter.set(t, (counter.get(t) || 0) + 1);
    }
  }
  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1]) // 자주 나온 순
    .slice(0, 5)                  // 상위 5개
    .map(([t]) => t);
}, [docs]);


  const rawParam = searchParams.get("category") ?? "";
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
  // ---

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

        <div className="mt-4 flex gap-3">
          <button type="button" className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            검색하기
          </button>
          <button type="button" className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            지도 보기
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {(recommendedTags.length ? recommendedTags : ["조용한카페","운동시설옆","디카페인","스터디카페","피트니스"]).map((t) => (
            <button key={t} type="button" className="rounded-full border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-50">
              #{t}
            </button>
          ))}
        </div>
      </div>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {docs.length > 0 ? (
          docs.map((doc, idx) => (
            <Card
              key={doc.id ?? `doc-${idx}`}
              doc={doc}
              indexText={`${idx + 1}.`}
              detailHref={`/detail/${doc.id}`}
            />
          ))
        ) : (
          <p>아직 문서가 없습니다. 새로운 곳을 등록해주세요. </p>
        )}
      </section>
    </main>
  );
}
