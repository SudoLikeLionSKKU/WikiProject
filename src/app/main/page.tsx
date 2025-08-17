"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "next/link";
import { LocalStorage } from "@/lib/localStorage";
import {
  getListDocuments,
  getPopularDocuments,
  createDocument,
  getDetailDocument,
} from "@/lib/fetcher";
import { ListDocument, DocumentType } from "../../../types/complex";

/* 상대시간 유틸 */
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

/* 최신 시점 고르기 */
function pickLatestISO(
  ...dates: Array<string | null | undefined>
): string | null {
  const ts = dates
    .filter(Boolean)
    .map((d) => new Date(d as string).getTime())
    .filter((n) => !Number.isNaN(n));
  if (ts.length === 0) return null;
  return new Date(Math.max(...ts)).toISOString();
}

/* editedAt(수정 기준 시점) 포함 로컬 타입 */
type WithEdited<T> = T & { editedAt: string | null };

export default function Home() {
  const router = useRouter();

  // 문서 리스트 상태(수정시점 포함)
  const [recentDocs, setRecentDocs] = useState<WithEdited<ListDocument>[]>([]);
  const [popularDocs, setPopularDocs] = useState<WithEdited<DocumentType>[]>(
    []
  );

  useEffect(() => {
    (async (): Promise<void> => {
      const result: boolean = await LocalStorage.ValidateGuDong();
      if (!result) {
        router.push("/");
        return;
      }

      // 원래대로 가져오기
      const 최근문서 = (await getListDocuments(4, "식당")) || [];
      console.log(최근문서);
      const 인기문서 = (await getPopularDocuments(2)) || [];

      // 각 항목의 최신 수정시점 계산 (detail 조회로 최신 섹션 리비전 포함)
      const recentWithEdited: WithEdited<ListDocument>[] = await Promise.all(
        최근문서.map(async (doc) => {
          const detail = await getDetailDocument(doc.id);
          const editedAt = pickLatestISO(
            detail?.introduction?.created_at,
            detail?.feature?.created_at,
            detail?.additionalInfo?.created_at,
            detail?.created_at ?? doc.created_at
          );
          return { ...doc, editedAt };
        })
      );

      const popularWithEdited: WithEdited<DocumentType>[] = await Promise.all(
        인기문서.map(async (doc) => {
          const detail = await getDetailDocument(doc.id);
          const editedAt = pickLatestISO(
            detail?.introduction?.created_at,
            detail?.feature?.created_at,
            detail?.additionalInfo?.created_at,
            detail?.created_at ?? doc.created_at
          );
          return { ...doc, editedAt };
        })
      );

      setRecentDocs(recentWithEdited);
      setPopularDocs(popularWithEdited);
    })();
  }, [router]);

  // 상세 페이지로 이동
  const goDetail = (id: number) => {
    router.push(`/detail/${id}`);
  };

  const goCategory = (category: string) => {
    router.push(`/list?category=${category}`);
  };

  // ✅ 문서 작성 페이지로 이동
  const goCreate = () => {
    router.push("/create");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <div className="text-xl font-bold text-gray-900">동네백과</div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-3">
        {/* Left Section */}
        <div className="space-y-8 md:col-span-2">
          {/* Welcome Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">환영합니다!</h2>
            <p className="mb-4 text-gray-700">
              동네백과 웹사이트에 오신 것을 환영합니다. 저희는 여러분의 필요를
              충족시키기 위해 다양한 콘텐츠와 서비스를 제공할 것입니다.
            </p>
            <ul className="mb-4 space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">▪</span>
                자유로운 정보활용을 위한 다양한 콘텐츠 제공
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">▪</span>
                문서 작성을 통해 유용한 정보 공유
              </li>
            </ul>
          </div>

          {/* Recent Documents */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">최근 문서</h2>
            <ul className="space-y-3">
              {recentDocs.length === 0 && (
                <li className="text-gray-500">불러온 문서가 없습니다.</li>
              )}
              {recentDocs.map((doc) => (
                <li key={doc.id} className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="mr-2 h-5 w-5 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.25 10.125H12M12 21.75v-3C12 16.5 10.5 15 9 15H5.25A2.25 2.25 0 0 1 3 12.75V11.25A2.25 2.25 0 0 1 5.25 9H9a2.25 2.25 0 0 1 2.25 2.25v1.5c0 1.625 1.5 3 3 3h1.5m-4.5 5.25h-4.5"
                    />
                  </svg>
                  {/* router.push 사용 */}
                  <button
                    type="button"
                    onClick={() => goDetail(doc.id)}
                    className="text-left text-blue-600 hover:underline"
                  >
                    {doc.title} - {doc.created_by}
                    {doc.editedAt ? ` - ${timeAgo(doc.editedAt)}` : ""}
                  </button>
                </li>
              ))}
            </ul>

            {/* ✅ 문서 작성하기 버튼: /create로 이동 */}
            <button
              onClick={goCreate}
              className="mt-4 flex items-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="mr-2 h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.672a.75.75 0 01-.937-.937l.672-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
              문서 작성하기
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="space-y-8">
          {/* Featured (Popular) Documents */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">주요 문서</h2>
            <ul className="space-y-3">
              {popularDocs.length === 0 && (
                <li className="text-gray-500">불러온 문서가 없습니다.</li>
              )}
              {popularDocs.map((doc) => (
                <li key={doc.id} className="text-gray-700">
                  {/* router.push 사용 */}
                  <button
                    type="button"
                    onClick={() => goDetail(doc.id)}
                    className="text-left text-gray-700 hover:underline"
                  >
                    {doc.title} - {doc.created_by}
                    {doc.editedAt ? ` - ${timeAgo(doc.editedAt)}` : ""}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">카테고리</h2>
            <ul className="space-y-3">
              {["식당", "카페", "의료", "주거", "문화", "공원"].map((item) => (
                <li key={item}>
                  <span className="mr-2 text-blue-600">▪</span>
                  <button
                    type="button"
                    onClick={() => goCategory(item)}
                    className="text-left text-gray-700 hover:underline"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
