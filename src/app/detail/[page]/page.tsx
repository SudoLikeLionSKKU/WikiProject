// src/app/detail/[page]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getDetailDocument,
  GetReviewsByDocumentId,
  insertReview,
} from "@/lib/fetcher";
import { LocalStorage } from "@/lib/localStorage";
import type { DetailDocument } from "../../../../types/complex";
import { FavoriteHandler } from "@/lib/FavoriteHandler";
import EditButton from "@/components/common/EditButton";
import { ReviewType } from "../../../../types/basic";
import { InsertReviewDto } from "../../../../types/dto";
import NaverMapComponent from "@/components/common/NaverMapComponent";

/* -----------------------------
   페이지 컴포넌트
----------------------------- */
const toKey = (v: string | number | undefined) => String(v ?? "");

function Placeholder({ text }: { text: string }) {
  return <div className="italic text-gray-500 text-sm py-4">{text}</div>;
}

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";

  const diff = Math.max(0, Date.now() - t);
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "방금 전";
  if (sec < 60) return `${sec}초 전`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  const week = Math.floor(day / 7);
  if (week < 5) return `${week}주 전`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}달 전`;
  const year = Math.floor(day / 365);
  return `${year}년 전`;
}

export default function Detail() {
  const { page } = useParams<{ page: string }>();
  const docKey = toKey(page);

  const [doc, setDoc] = useState<DetailDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
  const [review, setReview] = useState<InsertReviewDto>({
    content: "",
    created_by: "",
    document_id: Number(page),
  });

  // 데이터 로드
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = (await getDetailDocument(
          Number(page)
        )) as DetailDocument | null;
        if (!ignore) setDoc(data);
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

  // 즐겨찾기 초기화 (직접 제어 함수 사용)
  useEffect(() => {
    if (!docKey) return;
    const favs = LocalStorage.GetFavorites();
    setIsFav(favs.includes(docKey));
  }, [docKey]);

  // 즐겨찾기 토글 함수 (직접 제어 함수 사용)
  const toggleFavorite = () => {
    try {
      const newFav = !isFav;
      if (doc == null) return;

      if (newFav) {
        FavoriteHandler.SetFavorites(doc as DetailDocument);
        setDoc({ ...doc, stars: doc.stars + 1 });
      } else {
        FavoriteHandler.RemoveFavorites(doc as DetailDocument);
        setDoc({ ...doc, stars: doc.stars - 1 });
      }
      setIsFav(newFav);
    } catch {
      alert("즐겨찾기 저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handlerReviewSubmit = async (e: any) => {
    e.preventDefault();
    //1. 리뷰를 물리적으로 DB에 저장한다.

    const id: number = await insertReview(review);
    console.log(id);
    if (!id) return;
    //2. 리뷰 저장이 성공할 경우 현재 화면에 반영한다.
    const datas = await GetReviewsByDocumentId(Number(page));
    console.log(datas);
    if (doc && datas) {
      setDoc({ ...doc, reviews: datas });
    }
    //3. 리뷰 등록창을 초기화한다.
    setReview({ content: "", created_by: "", document_id: Number(page) });
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 h-12 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
          <Link
            href={`/main`}
            className="text-base font-bold text-gray-900 hover:underline"
          >
            동네백과
          </Link>
          <div className="flex items-center gap-3">
            {doc?.created_at ? (
              <span className="text-xs text-gray-500">
                최근 편집: {doc?.created_by ?? "알 수 없음"} ·{" "}
                {timeAgo(doc?.created_at)}
              </span>
            ) : null}
            <Link href={`/edit/${page}`}>
              <EditButton size="sm" />
            </Link>

            <button
              type="button"
              onClick={toggleFavorite}
              aria-pressed={isFav}
              aria-label="즐겨찾기"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium active:scale-[0.98] transition ${
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

      <div className="pt-14 flex min-h-screen bg-gray-50">
        <aside className="w-64 bg-white shadow-sm border-r p-4">
          <h2 className="text-lg font-semibold mb-3">{doc?.title}</h2>
          <div className="mb-4 flex items-center text-sm text-gray-700">
            <span className="truncate">
              {doc?.location ?? "주소 정보 없음"}
            </span>
          </div>
          <NaverMapComponent address={doc?.location ?? ""} />
          <div className="mb-6 flex flex-wrap gap-2">
            {(doc?.Hashtags?.length ? doc.Hashtags : []).map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 active:scale-[0.98] transition"
              >
                {String(tag.content).startsWith("#")
                  ? tag.content
                  : `#${tag.content}`}
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
              <button
                key={sec.i}
                type="button"
                onClick={() => {
                  document
                    .getElementById(sec.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="w-full rounded-md px-2 py-1 text-left text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition"
              >
                {sec.i}. {sec.t}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-8">
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-6 md:p-8">
            <section
              id="intro"
              className="prose prose-sm max-w-none scroll-mt-16"
            >
              <h2 className="font-bold text-xl border-b border-gray-200 pb-1 mb-2">
                1. 소개
              </h2>
              {doc?.introduction?.content ? (
                <div>
                  <p className="whitespace-pre-wrap">
                    {doc.introduction.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {doc.introduction.created_by} /{" "}
                    {timeAgo(doc.introduction.created_at)}
                  </p>
                </div>
              ) : (
                <Placeholder text="소개 내용이 없습니다." />
              )}
            </section>
            <hr className="my-8 border-t-0" />
            <section
              id="feature"
              className="prose prose-sm max-w-none scroll-mt-16"
            >
              <h2 className="font-bold text-xl border-b border-gray-200 pb-1 mb-2">
                2. 특징
              </h2>
              {doc?.feature ? (
                <div>
                  <p className="whitespace-pre-wrap">{doc.feature.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {doc.feature.created_by} / {timeAgo(doc.feature.created_at)}
                  </p>
                </div>
              ) : (
                <Placeholder text="특징 정보가 없습니다." />
              )}
            </section>
            <hr className="my-8 border-t-0" />
            <section
              id="reviews"
              className="prose prose-sm max-w-none scroll-mt-16"
            >
              <h2 className="font-bold text-xl border-b border-gray-200 pb-1 mb-2">
                3. 방문객 의견
              </h2>
              {/* 리뷰 작성 박스 */}
              <div className="not-prose mb-4 bg-white p-4 rounded-md border border-gray-200">
                <form onSubmit={handlerReviewSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="작성자 이름"
                    value={review.created_by ?? ""}
                    onChange={(e) =>
                      setReview({ ...review, created_by: e.target.value })
                    }
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="리뷰 내용을 입력해주세요..."
                    value={review.content ?? ""}
                    required
                    onChange={(e) =>
                      setReview({ ...review, content: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      등록
                    </button>
                  </div>
                </form>
              </div>

              <div className="not-prose space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
                {doc?.reviews?.length ? (
                  doc.reviews
                    .slice(0, isReviewsExpanded ? doc.reviews.length : 3)
                    .map((r, i) => (
                      <div
                        key={i}
                        className="border-b border-gray-200 pb-3 last:border-b-0"
                      >
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
                          <span className="font-semibold text-gray-800">
                            {r.created_by ?? "익명"}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span>
                            {r.created_at ? timeAgo(r.created_at) : "방금 전"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{r.content}</p>
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
                      {isReviewsExpanded ? "접기 ▲" : "더보기 ▼"}
                    </button>
                  </div>
                )}
              </div>
            </section>
            <hr className="my-8 border-t-0" />
            <section
              id="more"
              className="prose prose-sm max-w-none scroll-mt-16"
            >
              <h2 className="font-bold text-xl border-b border-gray-200 pb-1 mb-2">
                4. 추가 정보
              </h2>
              {doc?.additionalInfo?.content ? (
                <div>
                  <p className="whitespace-pre-wrap">
                    {doc.additionalInfo.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {doc.additionalInfo.created_by} /{" "}
                    {timeAgo(doc.additionalInfo.created_at)}
                  </p>
                </div>
              ) : (
                <Placeholder text="추가 정보가 없습니다." />
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
