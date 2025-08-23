import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";         // Edge에서 라이브러리 터지는 것 방지
export const dynamic = "force-dynamic";  // 캐시 방지

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // .env에 꼭 넣기
});

type Body = {
  title?: string;
  intro?: string;
  feature?: string;
  more?: string;
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 설정되어 있지 않습니다." },
        { status: 500 }
      );
    }

    const body: Body = await req.json().catch(() => ({} as Body));
    const source = [body.title, body.intro, body.feature, body.more]
      .filter(Boolean)
      .join("\n")
      .trim();

    // 내용이 너무 짧으면 바로 빈 배열
    if (source.replace(/\s/g, "").length < 10) {
      return NextResponse.json({ tags: [] }, { status: 200 });
    }

    const prompt = [
        "아래 작성 내용을 읽고, 내용과 가장 밀접한 해시태그 3~6개를 생성해.",
        "",
        "생성 원칙:",
        "1) 태그는 반드시 본문에 근거할 것(추측/상상 금지).",
        "2) 특히 다음 범주에서 중요한 키워드를 우선적으로 추출:",
        "   - 분위기: 조용함/아늑함/고급스러움/캐주얼/레트로/뷰/조명/음악 등",
        "   - 맛평가: 매콤/담백/불향/촉촉함/식감/간장/양념/시그니처 메뉴명 등",
        "   - 서비스: 친절/응대/피크시간/웨이팅/예약/직원/청결/위생 등",
        "   - 가격: 가성비/가심비/가격대/포션/리필/세트/할인 등",
        "   ※ 위 범주어 자체를 쓰라는 뜻이 아니라, 본문에 실제로 언급된 특징적인 표현을 추출/요약해서 태그로 만들 것.",
        "3) 위치(구/동/지명)·매장명·추천메뉴가 명시돼 있으면 태그에 포함 가능.",
        "4) 각 태그는 한국어 단어/구(1~3어절), 불필요한 조사/어미 제거, 중복/유사어 제거.",
        "5) ‘#’ 기호 없이 텍스트만 출력(클라이언트에서 #를 붙임).",
        "6) 너무 일반적인 단어만 나열하지 말고(예: 그냥 ‘분위기’, ‘맛집’만), 본문에서 드러난 구체성/차별점이 있는 표현을 우선.",
        "",
        '출력 형식(JSON 한 줄): {"tags":["태그1","태그2",...]}',
        "",
        "=== 본문 ===",
        source,
    ].join("\n");

    // Responses API (openai v4 최신)
    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      temperature: 0.2,
    });

    // SDK 버전별 안전한 파싱
    const raw =
      // 공식 SDK가 제공하는 편의 필드
      (resp as any).output_text ??
      // 구조 접근(보호적)
      (resp as any)?.output?.[0]?.content?.[0]?.text?.value ??
      "";

    // JSON 파싱
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }

    // 정제
    let tags: string[] = [];
    if (parsed?.tags && Array.isArray(parsed.tags)) {
      tags = parsed.tags
        .map((t: string) => String(t).replace(/[#,]/g, "").trim())
        .filter((t: string) => t.length >= 1 && t.length <= 12);
    }

    // 최후의 보정: 그래도 비었으면 간단 추출(빈손 방지)
    if (tags.length === 0) {
      const candidates = Array.from(
        new Set(
          source
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            .split(/\s+/)
            .filter((w) => w.length >= 2 && w.length <= 12)
        )
      ).slice(0, 6);
      tags = candidates;
    }

    return NextResponse.json({ tags }, { status: 200 });
  } catch (err: any) {
    console.error("hashtag api error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message ?? "unexpected error" },
      { status: 500 }
    );
  }
}
