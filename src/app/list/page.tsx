// src/app/list/page.tsx
import Link from "next/link";
import Card from "@/components/list/card";
import { getListDocuments } from "@/lib/fetcher";
import { ListDocument } from "..//..//..//types/complex";

export default async function ListPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  // 쿼리에서 category 원문
  const raw = searchParams?.category ?? "";

  // API 호출용 카테고리 ID (숫자만 허용되는 경우 대비)
  const parsed = Number(raw);
  const categoryId = Number.isFinite(parsed) && raw !== "" ? parsed : 1; // 기본값 1

  // ID → 이름 역매핑 (프로젝트 실제 ID로 맞춰주세요)
  const CATEGORY_NAME_BY_ID: Record<number, string> = {
    2: "의료",
    3: "맛집",
    4: "카페",
    5: "주거",
  };

  // 표시용 카테고리명 (문자 쿼리 우선, 없으면 ID 역매핑)
  const categoryName =
    (raw && isNaN(Number(raw)) ? raw : CATEGORY_NAME_BY_ID[categoryId]) || "";

  // 제목/설명
  const headerTitle = categoryName ? `${categoryName} 카테고리` : "카테고리";

  const headerDescMap: Record<string, string> = {
    카페: "우리 동네에서 조용히 공부하기 좋은 카페를 찾아보세요.",
    맛집: "우리 동네에서 든든하고 맛있는 밥집을 찾아보세요.",
    의료: "우리 동네의 병원·약국 등 의료 정보를 확인해보세요.",
    주거: "우리 동네의 주거/부동산 정보를 찾아보세요.",
  };
  const headerDesc =
    headerDescMap[categoryName] ?? "우리 동네의 유용한 정보를 확인해보세요.";

  // 실제 데이터 연동
  let docs: ListDocument[] = [];
  try {
    const res = await getListDocuments(categoryId); // ✅ getListDocuments만 사용
    docs = Array.isArray(res) ? res : [];
  } catch {
    docs = [];
  }

  // 디자인 확인용 더미 (데이터 없을 때만) — Hashtags는 content 필드 사용
  const now = new Date().toISOString();
  const fallbacks: ListDocument[] = [
    {
      id: 1,
      // @ts-ignore
      title: "성대 커피",
      Hashtags: [
        { id: 0, document_id: 1, content: "조용한", created_at: now } as any,
        { id: 0, document_id: 1, content: "콘센트많음", created_at: now } as any,
        { id: 0, document_id: 1, content: "스터디카페", created_at: now } as any,
      ],
      introduction: {
        id: 0,
        document_id: 1,
        content: "조용한 분위기로 좋고 편안한 자리가 많습니다. 공부할 때 가기 좋아요.",
        created_at: now,
      },
      created_at: now,
      created_by: "user",
      updated_at: now,
      deleted_at: null as any,
      category_id: categoryId,
    } as unknown as ListDocument,
    {
      id: 2,
      // @ts-ignore
      title: "명륜 밥집",
      Hashtags: [
        { id: 0, document_id: 2, content: "성대맛집", created_at: now } as any,
        { id: 0, document_id: 2, content: "가성비", created_at: now } as any,
        { id: 0, document_id: 2, content: "혼밥", created_at: now } as any,
      ],
      introduction: {
        id: 0,
        document_id: 2,
        content: "성균관대 근처에 위치해 가성비 있게 식사를 할 수 있는 맛집입니다.",
        created_at: now,
      },
      created_at: now,
      created_by: "user",
      updated_at: now,
      deleted_at: null as any,
      category_id: categoryId,
    } as unknown as ListDocument,
    {
      id: 3,
      // @ts-ignore
      title: "성균 약국",
      Hashtags: [
        { id: 0, document_id: 3, content: "친절함", created_at: now } as any,
        { id: 0, document_id: 3, content: "야간운영", created_at: now } as any,
      ],
      introduction: {
        id: 0,
        document_id: 3,
        content: "처방 설명을 친절하게 해주고, 다양한 약들이 구비되어 있어요.",
        created_at: now,
      },
      created_at: now,
      created_by: "user",
      updated_at: now,
      deleted_at: null as any,
      category_id: categoryId,
    } as unknown as ListDocument,
  ];

  const list = docs.length > 0 ? docs : fallbacks;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {/* ✅ 리스트 페이지 전용 상단 바(메인 영향 없음) */}
      <div className="mb-6 border-b border-gray-200 bg-white">
        <div className="px-0 py-3">
          <Link
            href="/"
            className="text-lg font-bold text-gray-900 hover:text-blue-600"
            aria-label="메인으로"
          >
            동네백과
          </Link>
        </div>
      </div>

      {/* 카테고리 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{headerTitle}</h1>
        <p className="mt-1 text-sm text-gray-600">{headerDesc}</p>

        {/* 버튼(클릭 가능, 동작 없음) */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            검색하기
          </button>
          <button
            type="button"
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            지도 보기
          </button>
        </div>

        {/* 해시태그(클릭 가능, 동작 없음) */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {["조용한카페", "운동시설옆", "디카페인", "스터디카페", "피트니스"].map((t) => (
            <button
              key={t}
              type="button"
              className="rounded-full border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`해시태그 ${t}`}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((doc, idx) => (
          <Card
            key={(doc as any)?.id ?? `placeholder-${idx}`}
            doc={doc}
            indexText={`${idx + 1}.`}
            detailHref={`/detail/${(doc as any)?.id ?? idx + 1}`}
          />
        ))}
      </section>

    </main>
  );
}
