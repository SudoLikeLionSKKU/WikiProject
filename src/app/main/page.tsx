"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Link from "next/link";
import { LocalStorage } from "@/lib/localStorage";
import { NaverMap } from "@/lib/NaverMap";
import {
  getListDocuments,
  getPopularDocuments,
  createDocument,
  getDetailDocument,
} from "@/lib/fetcher";
import { DetailDocument } from "../../../types/complex";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async (): Promise<void> => {
      const result: boolean = await LocalStorage.ValidateGuDong();
      if (!result) {
        router.push("/");
        return;
      }
      const 최근문서 = await getListDocuments(4, "카페");
      console.log(최근문서);
      const 인기문서 = await getPopularDocuments(2);
      console.log(인기문서);
      const 제순식당 = await getDetailDocument(5);
      console.log(제순식당);
      // const data = await createDocument({
      //   doc_created_by: "문태주",
      //   doc_dong: "명륜3가",
      //   doc_gu: "종로구",
      //   doc_title: "구내식당",
      //   doc_location: "혜화 어딘가 도로명 주소",
      //   intro_content: "구내식당은 제육을 파는 식당입니다",
      //   additional_info_content: "추가정보는 이곳에",
      //   feature_content: "특징은 이곳에",
      //   hashtags_content: ["학식"],
      //   doc_category: "식당",
      // });
      // console.log("fetch결과", data);
    })();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <div className="text-xl font-bold text-gray-900">동네백과</div>
          <nav className="hidden space-x-6 md:flex">
            <Link
              href="#"
              className="font-semibold text-gray-900 hover:text-blue-600"
            >
              대문
            </Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600">
              임의 문서
            </Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600">
              카테고리
            </Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600">
              기여
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="검색"
              className="rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </div>
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

          {/* Recent Documents Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">최근 문서</h2>
            <ul className="space-y-3">
              <li className="flex items-center text-blue-600 hover:underline">
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
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.25 10.125H12M12 21.75v-3C12 16.5 10.5 15 9 15H5.25A2.25 2.25 0 0 1 3 12.75V11.25A2.25 2.25 0 0 1 5.25 9H9a2.25 2.25 0 0 1 2.25 2.25v1.5c0 1.625 1.5 3 3 3h1.5m-4.5 5.25h-4.5"
                  />
                </svg>
                <Link href="#">성균 약국 - 6분 전</Link>
              </li>
              <li className="flex items-center text-blue-600 hover:underline">
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
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.25 10.125H12M12 21.75v-3C12 16.5 10.5 15 9 15H5.25A2.25 2.25 0 0 1 3 12.75V11.25A2.25 2.25 0 0 1 5.25 9H9a2.25 2.25 0 0 1 2.25 2.25v1.5c0 1.625 1.5 3 3 3h1.5m-4.5 5.25h-4.5"
                  />
                </svg>
                <Link href="#">혜화 병원 - 4분 전</Link>
              </li>
              <li className="flex items-center text-blue-600 hover:underline">
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
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.25 10.125H12M12 21.75v-3C12 16.5 10.5 15 9 15H5.25A2.25 2.25 0 0 1 3 12.75V11.25A2.25 2.25 0 0 1 5.25 9H9a2.25 2.25 0 0 1 2.25 2.25v1.5c0 1.625 1.5 3 3 3h1.5m-4.5 5.25h-4.5"
                  />
                </svg>
                <Link href="#">성대 카페 - 2시간 전</Link>
              </li>
              <li className="flex items-center text-blue-600 hover:underline">
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
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.25 10.125H12M12 21.75v-3C12 16.5 10.5 15 9 15H5.25A2.25 2.25 0 0 1 3 12.75V11.25A2.25 2.25 0 0 1 5.25 9H9a2.25 2.25 0 0 1 2.25 2.25v1.5c0 1.625 1.5 3 3 3h1.5m-4.5 5.25h-4.5"
                  />
                </svg>
                <Link href="#">명륜 식당 - 2시간 전</Link>
              </li>
            </ul>
            <button className="mt-4 flex items-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
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
          {/* Featured Documents */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">주요 문서</h2>
            <ul className="space-y-3">
              <li className="text-gray-700">
                혜화 병원 매우 친절한 진료로 추천
              </li>
              <li className="text-gray-700">
                성대 카페 이번 여름 신상 음료 후기
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">카테고리</h2>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700">
                <span className="mr-2 text-blue-600">▪</span>
                의료
              </li>
              <li className="flex items-center text-gray-700">
                <span className="mr-2 text-blue-600">▪</span>
                카페
              </li>
              <li className="flex items-center text-gray-700">
                <span className="mr-2 text-blue-600">▪</span>
                맛집
              </li>
              <li className="flex items-center text-gray-700">
                <span className="mr-2 text-blue-600">▪</span>
                주거
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
