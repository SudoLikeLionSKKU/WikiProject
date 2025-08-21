// src/app/edit/[page]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDetailDocument, InsertSectionRevision } from "@/lib/fetcher";
import { LocalStorage } from "@/lib/localStorage";
import type { DetailDocument } from "../../../../types/complex";
import { FavoriteHandler } from "@/lib/FavoriteHandler";
import NaverMapComponent from "@/components/common/NaverMapComponent";
import { InsertSectionRevisionDto } from "../../../../types/dto";

/* -----------------------------
   유틸
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

/* -----------------------------
   페이지
----------------------------- */
export default function Edit() {
  const { page } = useParams<{ page: string }>();
  const router = useRouter();
  const docKey = toKey(page);

  const [doc, setDoc] = useState<DetailDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 즐겨찾기
  const [isFav, setIsFav] = useState(false);

  // 편집 상태(1,2,4)
  const [editing, setEditing] = useState<{
    intro: boolean;
    feature: boolean;
    more: boolean;
  }>({ intro: false, feature: false, more: false });

  // 입력 값
  const [feature, SetFeature] = useState<InsertSectionRevisionDto>({
    content: "",
    created_by: "",
    section_id: doc?.feature?.id as number,
    document_id: Number(page),
  });

  const [more, SetMore] = useState<InsertSectionRevisionDto>({
    content: "",
    created_by: "",
    section_id: doc?.additionalInfo?.id as number,
    document_id: Number(page),
  });

  const [intro, SetIntro] = useState<InsertSectionRevisionDto>({
    content: "",
    created_by: "",
    section_id: doc?.introduction?.id as number,
    document_id: Number(page),
  });

  // 데이터 로드 (Detail과 동일)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = (await getDetailDocument(
          Number(page)
        )) as DetailDocument | null;
        if (ignore) return;
        setDoc(data);
        SetFeature({
          ...feature,
          content: data?.feature?.content,
          section_id: data?.feature?.section_id as number,
        });
        SetMore({
          ...more,
          content: data?.additionalInfo?.content,
          section_id: data?.additionalInfo?.section_id as number,
        });
        SetIntro({
          ...intro,
          content: data?.introduction?.content,
          section_id: data?.introduction?.section_id as number,
        });
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

  // 즐겨찾기 초기화 (Detail과 동일)
  useEffect(() => {
    if (!docKey) return;
    const favs = LocalStorage.GetFavorites();
    setIsFav(favs.includes(docKey));
  }, [docKey]);

  // 즐겨찾기 토글 (Detail과 동일)
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
      alert("즐겨찾기 승인요청에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  // 편집 토글 / 취소 / 승인요청 (승인요청은 지금은 로컬만)
  const toggleEdit = (key: keyof typeof editing) =>
    setEditing((prev) => ({ ...prev, [key]: true }));

  const cancelEdit = (key: keyof typeof editing) => {
    setEditing((prev) => ({ ...prev, [key]: false }));
    if (!doc) return;
    if (key === "intro") {
      SetIntro({
        ...intro,
        content: doc.introduction?.content ?? "",
        created_by: "",
      });
    } else if (key === "feature") {
      SetFeature({ ...feature, content: doc.feature?.content, created_by: "" });
    } else {
      SetMore({
        ...more,
        content: doc.additionalInfo?.content,
        created_by: "",
      });
    }
  };

  const saveEdit = async (key: keyof typeof editing) => {
    // 서버 승인요청은 아직 필요 없음. 로컬 값만 유지하고 비활성화
    setEditing((prev) => ({ ...prev, [key]: false }));
    switch (key) {
      case "feature":
        console.log(feature);
        await InsertSectionRevision(feature);
        break;
      case "intro":
        console.log(intro);
        await InsertSectionRevision(intro);
        break;
      case "more":
        console.log(more);
        await InsertSectionRevision(more);
        break;
    }
    alert("관리자의 승인 이후 요청한 내용이 등록됩니다.");
  };

  if (loading) return null;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!doc) return null;

  return (
    <>
      {/* 상단 헤더 (편집→BACK, 즐겨찾기 유지) */}
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

            {/* BACK */}
            <button
              type="button"
              onClick={() => router.push(`/detail/${page}`)}
              className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition"
              title="뒤로"
            >
              ← BACK
            </button>

            {/* 즐겨찾기 (Detail과 동일 동작) */}
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
        {/* 좌측 사이드 (Detail 동일) */}
        <aside className="w-64 bg-white shadow-sm border-r p-4">
          <h2 className="text-lg font-semibold mb-3">{doc?.title}</h2>
          <div className="mb-4 flex items-center text-sm text-gray-700">
            <span className="truncate">
              {doc?.location ?? "주소 정보 없음"}
            </span>
          </div>
          <NaverMapComponent
            address={doc?.location ?? ""}
            width={200}
            height={300}
          />
          <div className="mb-6 mt-5 flex flex-wrap gap-2">
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

        {/* 본문 (Detail 레이아웃 그대로, 1/2/4만 textarea + 버튼) */}
        <main className="flex-1 p-6 md:p-8">
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-6 md:p-8">
            {/* 1. 소개 */}
            <section
              id="intro"
              className="prose prose-sm max-w-none scroll-mt-16"
            >
              <h2 className="font-bold text-xl border-b border-gray-200 pb-1 mb-2">
                1. 소개
              </h2>

              <input
                type="text"
                value={intro.created_by ?? ""}
                placeholder="작성자"
                onChange={(e) =>
                  SetIntro({ ...intro, created_by: e.target.value })
                }
                disabled={!editing.intro}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <textarea
                value={intro.content ?? ""}
                onChange={(e) =>
                  SetIntro({ ...intro, content: e.target.value })
                }
                disabled={!editing.intro}
                className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 bg-white resize-none"
                rows={4}
              />

              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {doc?.introduction?.created_by ?? "-"} /{" "}
                  {timeAgo(doc?.introduction?.created_at)}
                </p>
                <div className="flex gap-1">
                  <button
                    disabled={editing.intro}
                    onClick={() => toggleEdit("intro")}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                  >
                    편집
                  </button>
                  <button
                    disabled={!editing.intro}
                    onClick={() => cancelEdit("intro")}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    disabled={!editing.intro}
                    onClick={() => saveEdit("intro")}
                    className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white disabled:opacity-50"
                  >
                    승인요청
                  </button>
                </div>
              </div>
            </section>

            <hr className="my-8 border-t-0" />

            {/* 2. 특징 */}
            <section
              id="feature"
              className="prose prose-sm max-w-none scroll-mt-16"
            >
              <h2 className="font-bold text-xl border-b border-gray-200 pb-1 mb-2">
                2. 특징
              </h2>
              <input
                type="text"
                value={feature.created_by ?? ""}
                placeholder="작성자"
                onChange={(e) =>
                  SetFeature({ ...feature, created_by: e.target.value })
                }
                disabled={!editing.feature}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                value={feature.content ?? ""}
                onChange={(e) =>
                  SetFeature({ ...feature, content: e.target.value })
                }
                disabled={!editing.feature}
                className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 bg-white resize-none"
                rows={4}
              />

              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {doc?.feature?.created_by ?? "-"} /{" "}
                  {timeAgo(doc?.feature?.created_at)}
                </p>
                <div className="flex gap-1">
                  <button
                    disabled={editing.feature}
                    onClick={() => toggleEdit("feature")}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                  >
                    편집
                  </button>
                  <button
                    disabled={!editing.feature}
                    onClick={() => cancelEdit("feature")}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    disabled={!editing.feature}
                    onClick={() => saveEdit("feature")}
                    className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white disabled:opacity-50"
                  >
                    승인요청
                  </button>
                </div>
              </div>
            </section>

            <hr className="my-8 border-t-0" />

            {/* 4. 추가 정보 */}
            <section
              id="more"
              className="prose prose-sm max-w-none scroll-mt-16"
            >
              <h2 className="font-bold text-xl border-b border-gray-200 pb-1 mb-2">
                3. 추가 정보
              </h2>

              <input
                type="text"
                value={more.created_by ?? ""}
                placeholder="작성자"
                onChange={(e) =>
                  SetMore({ ...more, created_by: e.target.value })
                }
                disabled={!editing.more}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <textarea
                value={more.content ?? ""}
                onChange={(e) => SetMore({ ...more, content: e.target.value })}
                disabled={!editing.more}
                className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 bg-white resize-none"
                rows={4}
              />

              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {doc?.additionalInfo?.created_by ?? "-"} /{" "}
                  {timeAgo(doc?.additionalInfo?.created_at)}
                </p>
                <div className="flex gap-1">
                  <button
                    disabled={editing.more}
                    onClick={() => toggleEdit("more")}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                  >
                    편집
                  </button>
                  <button
                    disabled={!editing.more}
                    onClick={() => cancelEdit("more")}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    disabled={!editing.more}
                    onClick={() => saveEdit("more")}
                    className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white disabled:opacity-50"
                  >
                    승인요청
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
