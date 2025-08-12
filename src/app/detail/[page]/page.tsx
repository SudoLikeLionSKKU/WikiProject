// src/app/detail/[page]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDetailDocument } from "@/lib/fetcher";
// 👇 [수정 3] 외부 LocalStorage 유틸리티 의존성 제거
// import { LocalStorage } from "@/lib/localStorage"; 
import type { DetailDocument } from "../../../../types/complex";

/* -----------------------------
   유틸
----------------------------- */
// ... (유틸 함수들은 변경사항이 없으므로 생략합니다)
type MaybeObj = { content?: unknown; name?: unknown; tag?: unknown; author?: unknown; user?: unknown; writer?: unknown; updated_by?: unknown; created_by?: unknown; owner?: unknown; updated_at?: unknown; updatedAt?: unknown; created_at?: unknown; createdAt?: unknown; date?: unknown; } & Record<string, unknown>;
const pickText = (v: unknown): string => { if (v == null) return ""; if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v); if (Array.isArray(v)) return v.map(pickText).filter(Boolean).join("\n\n"); if (typeof v === "object") { const o = v as MaybeObj; if (o.content != null) return pickText(o.content); if (o.name != null) return pickText(o.name); if (o.tag != null) return pickText(o.tag); } try { return JSON.stringify(v); } catch { return String(v); } };
const pickTags = (v: unknown): string[] => { if (v == null) return []; if (Array.isArray(v)) return v.map(pickText).filter(Boolean); return [pickText(v)].filter(Boolean); };
const parseDate = (v: unknown) => { if (!v) return null; const d = new Date(String(v)); return isNaN(+d) ? null : d; };
const timeAgo = (isoLike?: string) => { if (!isoLike) return ""; const d = parseDate(isoLike); if (!d) return ""; const diff = Date.now() - d.getTime(); const m = Math.floor(diff / 60000); const h = Math.floor(m / 60); const dys = Math.floor(h / 24); if (m < 1) return "방금 전"; if (m < 60) return `${m}분 전`; if (h < 24) return `${h}시간 전`; if (dys < 7) return `${dys}일 전`; return d.toISOString().slice(0, 10); };
const pick = (o: any, keys: string[]) => keys.map((k) => o?.[k]).find(Boolean);
const metaFrom = (v: any) => ({ author: pick(v, ["updated_by", "editor", "author", "user", "writer", "created_by", "owner", "name"]) ?? undefined, when: pick(v, ["updated_at", "updatedAt", "created_at", "createdAt", "date"]) ?? undefined, });

function Placeholder({ text }: { text: string }) {
  return <div className="italic text-gray-500 text-sm py-4">{text}</div>
}

/* -----------------------------
   ViewModel
----------------------------- */
type ReviewVM = { text: string; author?: string; when?: string };
type DetailVM = { title?: string; address?: string; intro?: string; feature?: string; additional?: string; hashtags?: string[]; reviews?: ReviewVM[]; lastEditedBy?: string; lastEditedAt?: string; };
function toVM(d: DetailDocument): DetailVM {
  // ... (toVM 함수는 변경사항이 없으므로 생략)
  const introRaw = (d as any).intro_content ?? (d as any).intro ?? (d as any).introParagraphs;
  const featureRaw = (d as any).feature_content ?? (d as any).feature ?? (d as any).body;
  const additionalRaw = (d as any).additional_info_content ?? (d as any).additional ?? (d as any).extra;
  const docAuthor = metaFrom(d).author;
  const docWhen = metaFrom(d).when;
  const hashtagsRaw = (d as any).hashtags_content ?? (d as any).hashtags ?? (d as any).tags ?? [];
  const reviewsRaw = (d as any).reviews ?? (d as any).review_list ?? (d as any).comments ?? [];
  const reviews: ReviewVM[] = Array.isArray(reviewsRaw) ? reviewsRaw.map((it: any) => ({ text: pickText(it?.content ?? it?.body ?? it?.text ?? it), author: metaFrom(it).author, when: metaFrom(it).when, })).filter((r) => r.text) : [];
  return {
    title: pickText((d as any).title ?? (d as any).name ?? (d as any).place_name ?? "제순식당"),
    address: pickText((d as any).address_road ?? (d as any).road_address ?? (d as any).address ?? "혜화 어딘가 도로명 주소"),
    intro: pickText(introRaw).replace(/\s*\([^/)]+\s*\/\s*[^)]+\)$/, "").trim(),
    feature: pickText(featureRaw).replace(/\s*\([^/)]+\s*\/\s*[^)]+\)$/, "").trim(),
    additional: pickText(additionalRaw).replace(/\s*\([^/)]+\s*\/\s*[^)]+\)$/, "").trim(),
    hashtags: pickTags(hashtagsRaw),
    reviews,
    lastEditedBy: docAuthor || undefined,
    lastEditedAt: docWhen || undefined,
  };
}
/* -----------------------------
   페이지 컴포넌트
----------------------------- */
const toKey = (v: string | number | undefined) => String(v ?? "");

export default function Detail() {
  const { page } = useParams<{ page: string }>();
  const docKey = toKey(page);

  const [doc, setDoc] = useState<DetailVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);

  // 👇 [수정 3] localStorage 직접 제어 함수
  const getFavoritesFromStorage = (): string[] => {
    try {
      const item = window.localStorage.getItem('favorite_key');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("즐겨찾기 로딩 실패:", error);
      return [];
    }
  };

  const setFavoritesInStorage = (favs: string[]): void => {
    try {
      window.localStorage.setItem('favorite_key', JSON.stringify(favs));
    } catch (error) {
      console.error("즐겨찾기 저장 실패:", error);
    }
  };

  // 데이터 로드
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true); setErr(null);
        const data = (await getDetailDocument(Number(page))) as DetailDocument | null;
        if (!ignore) setDoc(data ? toVM(data) : null);
      } catch { if (!ignore) setErr("문서를 불러오는 중 오류가 발생했습니다.");
      } finally { if (!ignore) setLoading(false); }
    })();
    
    return () => { ignore = true; };
  }, [page]);

  // 즐겨찾기 초기화 (직접 제어 함수 사용)
  useEffect(() => {
    if (!docKey) return;
    const favs = getFavoritesFromStorage();
    setIsFav(favs.includes(docKey));
  }, [docKey]);

  // 즐겨찾기 토글 함수 (직접 제어 함수 사용)
  const toggleFavorite = () => {
    try {
      const currentFavs = getFavoritesFromStorage();
      const set = new Set(currentFavs);
      
      if (set.has(docKey)) {
        set.delete(docKey);
        setIsFav(false);
      } else {
        set.add(docKey);
        setIsFav(true);
      }
      
      setFavoritesInStorage(Array.from(set));
    } catch {
      alert("즐겨찾기 저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 h-12 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
          <Link href={`/detail/${page}`} className="text-base font-bold text-gray-900 hover:underline">
            {doc?.title ?? "..."}
          </Link>
          <div className="flex items-center gap-3">
            {doc?.lastEditedBy || doc?.lastEditedAt ? (
              <span className="text-xs text-gray-500">
                최근 편집: {doc?.lastEditedBy ?? "알 수 없음"} · {timeAgo(doc?.lastEditedAt)}
              </span>
            ) : null}
            <button
              type="button" onClick={toggleFavorite} aria-pressed={isFav} aria-label="즐겨찾기"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium active:scale-[0.98] transition ${ isFav ? "border border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" }`}
              title={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              {isFav ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.48 3.499a1 1 0 0 1 1.04 0l3.22 1.94 3.6.52a1 1 0 0 1 .56 1.7l-2.6 2.54.61 3.57a1 1 0 0 1-1.45 1.05L12 14.77l-3.21 1.69a1 1 0 0 1-1.45-1.05l.61-3.57-2.6-2.54a1 1 0 0 1 .56-1.7l3.6-.52 3.22-1.94Z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M11.48 3.499a1 1 0 0 1 1.04 0l3.22 1.94 3.6.52a1 1 0 0 1 .56 1.7l-2.6 2.54.61 3.57a1 1 0 0 1-1.45 1.05L12 14.77l-3.21 1.69a1 1 0 0 1-1.45-1.05l.61-3.57-2.6-2.54a1 1 0 0 1 .56-1.7l3.6-.52 3.22-1.94Z" stroke="currentColor" strokeWidth="1.5" /></svg>
              )}
              <span>{isFav ? "즐겨찾기됨" : "즐겨찾기"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="pt-14 flex min-h-screen bg-gray-50">
        <aside className="w-64 bg-white shadow-sm border-r p-4">
          <h2 className="text-lg font-semibold mb-3">기본 정보</h2>
          <div className="mb-4 flex items-center text-sm text-gray-700">
            <span className="truncate">{doc?.address ?? "주소 정보 없음"}</span>
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            {(doc?.hashtags?.length ? doc.hashtags : []).map((tag) => (
              <button key={tag} type="button" className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 active:scale-[0.98] transition">
                {String(tag).startsWith("#") ? tag : `#${tag}`}
              </button>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">목차</h3>
          <nav className="flex flex-col gap-1 text-sm">
            {[
              { i: 1, t: "소개", id: "intro" },
              { i: 2, t: "특징", id: "feature" },
              { i: 3, t: "방문객 의견", id: "reviews" },
              { i: 4, t: "추가 정보", id: "more" },
            ].map((sec) => (
              <button key={sec.i} type="button" onClick={() => { document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className="w-full rounded-md px-2 py-1 text-left text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition">
                {sec.i}. {sec.t}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-8">
            <div className="bg-white border border-gray-200 rounded-md shadow-sm p-6 md:p-8">
                <section id="intro" className="prose prose-sm max-w-none scroll-mt-16">
                    <h2 className="font-bold text-xl border-b border-gray-200 pb-1 mb-2">1. 소개</h2>
                    {doc?.intro ? <p className="whitespace-pre-wrap">{doc.intro}</p> : <Placeholder text="소개 내용이 없습니다." />}
                </section>
                <hr className="my-8 border-t-0" />
                <section id="feature" className="prose prose-sm max-w-none scroll-mt-16">
                    <h2 className="font-bold text-xl border-b border-gray-200 pb-1 mb-2">2. 특징</h2>
                    {doc?.feature ? <p className="whitespace-pre-wrap">{doc.feature}</p> : <Placeholder text="특징 정보가 없습니다." />}
                </section>
                <hr className="my-8 border-t-0" />
                <section id="reviews" className="prose prose-sm max-w-none scroll-mt-16">
                    <h2 className="font-bold text-xl border-b border-gray-200 pb-1 mb-2">3. 방문객 의견</h2>
                    <div className="not-prose space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
                        {doc?.reviews?.length ? (
                            doc.reviews.slice(0, isReviewsExpanded ? doc.reviews.length : 3).map((r, i) => (
                                <div key={i} className="border-b border-gray-200 pb-3 last:border-b-0">
                                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
                                        <span className="font-semibold text-gray-800">{r.author ?? "익명"}</span>
                                        <span className="text-gray-400">·</span>
                                        <span>{r.when ? timeAgo(r.when) : "방금 전"}</span>
                                    </div>
                                    <p className="text-sm text-gray-800">{r.text}</p>
                                </div>
                            ))
                        ) : (
                            <Placeholder text="리뷰가 없습니다." />
                        )}
                        {doc?.reviews && doc.reviews.length > 3 && (
                            <div className="pt-2">
                                <button
                                    onClick={() => setIsReviewsExpanded(!isReviewsExpanded)}
                                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 transition"
                                >
                                    {/* 👇 [수정 2] 아이콘 변경 */}
                                    {isReviewsExpanded ? '접기 ▲' : '더보기 ▼'}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
                <hr className="my-8 border-t-0" />
                <section id="more" className="prose prose-sm max-w-none scroll-mt-16">
                    <h2 className="font-bold text-xl border-b border-gray-200 pb-1 mb-2">4. 추가 정보</h2>
                    {doc?.additional ? <p className="whitespace-pre-wrap">{doc.additional}</p> : <Placeholder text="추가 정보가 없습니다." />}
                </section>
            </div>
        </main>
      </div>
    </>
  );
}
