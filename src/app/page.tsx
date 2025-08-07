"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LocalStorage } from "@/lib/localStorage";

const seoulGuDong: Record<string, string[]> = {
  강남구: [
    "개포동",
    "논현동",
    "대치동",
    "도곡동",
    "삼성동",
    "세곡동",
    "수서동",
    "신사동",
    "압구정동",
    "역삼동",
    "율현동",
    "일원동",
    "청담동",
  ],
  강동구: [
    "강일동",
    "고덕동",
    "길동",
    "둔촌동",
    "명일동",
    "상일동",
    "성내동",
    "암사동",
    "천호동",
  ],
  강북구: ["미아동", "번동", "수유동", "우이동"],
  강서구: [
    "가양동",
    "개화동",
    "공항동",
    "과해동",
    "내발산동",
    "등촌동",
    "마곡동",
    "방화동",
    "염창동",
    "오곡동",
    "오쇠동",
    "외발산동",
    "화곡동",
  ],
  관악구: ["남현동", "봉천동", "신림동"],
  광진구: ["광장동", "구의동", "군자동", "능동", "자양동", "중곡동", "화양동"],
  구로구: [
    "가리봉동",
    "개봉동",
    "고척동",
    "구로동",
    "궁동",
    "신도림동",
    "오류동",
    "온수동",
    "천왕동",
  ],
  금천구: ["가산동", "독산동", "시흥동"],
  노원구: ["공릉동", "상계동", "월계동", "중계동", "하계동"],
  도봉구: ["도봉동", "방학동", "쌍문동", "창동"],
  동대문구: [
    "답십리동",
    "신설동",
    "용두동",
    "이문동",
    "장안동",
    "전농동",
    "제기동",
    "청량리동",
    "회기동",
    "휘경동",
  ],
  동작구: [
    "노량진동",
    "대방동",
    "동작동",
    "본동",
    "사당동",
    "상도동",
    "신대방동",
    "흑석동",
  ],
  마포구: [
    "공덕동",
    "구수동",
    "노고산동",
    "당인동",
    "대흥동",
    "도화동",
    "동교동",
    "마포동",
    "망원동",
    "상수동",
    "상암동",
    "서교동",
    "성산동",
    "신공덕동",
    "신수동",
    "아현동",
    "연남동",
    "염리동",
    "용강동",
    "중동",
    "창전동",
    "토정동",
    "하중동",
    "합정동",
  ],
  서대문구: [
    "남가좌동",
    "냉천동",
    "대신동",
    "대현동",
    "북가좌동",
    "북아현동",
    "신촌동",
    "연희동",
    "영천동",
    "옥천동",
    "창천동",
    "천연동",
    "충정로2가",
    "충정로3가",
    "합동",
    "홍은동",
    "홍제동",
  ],
  서초구: [
    "내곡동",
    "반포동",
    "방배동",
    "서초동",
    "신원동",
    "양재동",
    "우면동",
    "원지동",
    "잠원동",
  ],
  성동구: [
    "금호동1가",
    "금호동2가",
    "금호동3가",
    "금호동4가",
    "도선동",
    "마장동",
    "사근동",
    "상왕십리동",
    "성수동1가",
    "성수동2가",
    "송정동",
    "옥수동",
    "용답동",
    "응봉동",
    "하왕십리동",
    "행당동",
  ],
  성북구: [
    "길음동",
    "돈암동",
    "동선동1가",
    "동선동2가",
    "동선동3가",
    "동선동4가",
    "동선동5가",
    "동소문동1가",
    "동소문동2가",
    "동소문동3가",
    "동소문동4가",
    "동소문동5가",
    "동소문동6가",
    "동소문동7가",
    "보문동1가",
    "보문동2가",
    "보문동3가",
    "보문동4가",
    "보문동5가",
    "보문동6가",
    "보문동7가",
    "삼선동1가",
    "삼선동2가",
    "삼선동3가",
    "삼선동4가",
    "삼선동5가",
    "상월곡동",
    "성북동",
    "성북동1가",
    "석관동",
    "안암동1가",
    "안암동2가",
    "안암동3가",
    "안암동4가",
    "안암동5가",
    "월곡동",
    "장위동",
    "정릉동",
    "종암동",
    "하월곡동",
  ],
  송파구: [
    "가락동",
    "거여동",
    "마천동",
    "문정동",
    "방이동",
    "삼전동",
    "석촌동",
    "송파동",
    "신천동",
    "오금동",
    "잠실동",
    "장지동",
    "풍납동",
  ],
  양천구: ["목동", "신월동", "신정동"],
  영등포구: [
    "당산동1가",
    "당산동2가",
    "당산동3가",
    "당산동4가",
    "당산동5가",
    "당산동6가",
    "대림동",
    "도림동",
    "문래동1가",
    "문래동2가",
    "문래동3가",
    "문래동4가",
    "문래동5가",
    "문래동6가",
    "신길동",
    "양평동1가",
    "양평동2가",
    "양평동3가",
    "양평동4가",
    "양평동5가",
    "양평동6가",
    "양화동",
    "여의도동",
    "영등포동",
    "영등포동1가",
    "영등포동2가",
    "영등포동3가",
    "영등포동4가",
    "영등포동5가",
    "영등포동6가",
    "영등포동7가",
    "영등포본동",
  ],
  용산구: [
    "갈월동",
    "남영동",
    "동빙고동",
    "동자동",
    "문배동",
    "보광동",
    "서계동",
    "서빙고동",
    "신계동",
    "용문동",
    "용산동2가",
    "용산동3가",
    "용산동5가",
    "원효로1가",
    "원효로2가",
    "원효로3가",
    "원효로4가",
    "이촌동",
    "이태원동",
    "주성동",
    "청암동",
    "한강로1가",
    "한강로2가",
    "한강로3가",
    "한남동",
    "효창동",
  ],
  은평구: [
    "갈현동",
    "구산동",
    "녹번동",
    "대조동",
    "불광동",
    "수색동",
    "신사동",
    "역촌동",
    "응암동",
    "증산동",
    "진관동",
  ],
  종로구: [
    "가회동",
    "견지동",
    "경운동",
    "계동",
    "공평동",
    "관수동",
    "관철동",
    "관훈동",
    "교남동",
    "교북동",
    "구기동",
    "궁정동",
    "권농동",
    "낙원동",
    "내수동",
    "내자동",
    "누상동",
    "누하동",
    "당주동",
    "도렴동",
    "돈의동",
    "동숭동",
    "명륜1가",
    "명륜2가",
    "명륜3가",
    "명륜4가",
    "묘동",
    "무악동",
    "봉익동",
    "부암동",
    "사간동",
    "사직동",
    "삼청동",
    "서린동",
    "소격동",
    "송현동",
    "숭인동",
    "신교동",
    "신문로1가",
    "신문로2가",
    "신영동",
    "안국동",
    "연건동",
    "연지동",
    "예지동",
    "옥인동",
    "와룡동",
    "운니동",
    "원남동",
    "원서동",
    "이화동",
    "익선동",
    "인사동",
    "인의동",
    "장사동",
    "재동",
    "적선동",
    "종로1가",
    "종로2가",
    "종로3가",
    "종로4가",
    "종로5가",
    "종로6가",
    "중학동",
    "창성동",
    "창신동",
    "청운동",
    "청진동",
    "충신동",
    "통의동",
    "통인동",
    "팔판동",
    "평동",
    "평창동",
    "필운동",
    "행촌동",
    "혜화동",
    "홍지동",
    "화동",
    "효자동",
    "효제동",
  ],
  중구: [
    "광희동1가",
    "광희동2가",
    "남대문로1가",
    "남대문로2가",
    "남대문로3가",
    "남대문로4가",
    "남대문로5가",
    "남산동1가",
    "남산동2가",
    "남산동3가",
    "남창동",
    "남학동",
    "다동",
    "달동",
    "만리동1가",
    "만리동2가",
    "명동1가",
    "명동2가",
    "무교동",
    "묵정동",
    "방산동",
    "봉래동1가",
    "봉래동2가",
    "북창동",
    "산림동",
    "삼각동",
    "서소문동",
    "소공동",
    "수표동",
    "순화동",
    "신당동",
    "쌍림동",
    "예관동",
    "예장동",
    "을지로1가",
    "을지로2가",
    "을지로3가",
    "을지로4가",
    "을지로5가",
    "을지로6가",
    "의주로1가",
    "의주로2가",
    "인현동1가",
    "인현동2가",
    "입정동",
    "장교동",
    "장충동1가",
    "장충동2가",
    "저동1가",
    "저동2가",
    "정동",
    "주교동",
    "주자동",
    "중림동",
    "중앙동1가",
    "중앙동2가",
    "진남포동",
    "초동",
    "충무로1가",
    "충무로2가",
    "충무로3가",
    "충무로4가",
    "충무로5가",
    "태평로1가",
    "태평로2가",
    "필동1가",
    "필동2가",
    "필동3가",
    "황학동",
    "회현동1가",
    "회현동2가",
    "회현동3가",
  ],
  중랑구: ["망우동", "면목동", "묵동", "상봉동", "신내동", "중화동"],
};

export default function FirstPage() {
  const [selectedGu, setSelectedGu] = useState("");
  const [selectedDong, setSelectedDong] = useState("");
  const router = useRouter();

  const handleGuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGu(e.target.value);
    setSelectedDong("");
  };

  const handleDongChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDong(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGu && selectedDong) {
      LocalStorage.SetGuDong({
        gu: selectedGu,
        dong: selectedDong,
      });
      if (LocalStorage.ValidateGuDong()) {
        router.push("/main");
      }
    }
  };

  useEffect(() => {
    if (LocalStorage.ValidateGuDong()) router.push("/main");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-xl p-12 flex flex-col items-center w-[420px]">
        <div className="text-3xl font-bold text-blue-600 mb-2">동네백과</div>
        <div className="text-gray-500 mb-8 text-lg">
          우리 동네의 모든 것을 알아보세요
        </div>
        <form onSubmit={handleSearch} className="w-full flex flex-col gap-4">
          <div className="flex gap-3">
            <select
              className="w-1/2 p-3 rounded-md border border-gray-300 bg-gray-100 focus:outline-none"
              value={selectedGu}
              onChange={handleGuChange}
              required
            >
              <option value="">구를 선택하세요</option>
              {Object.keys(seoulGuDong).map((gu) => (
                <option key={gu} value={gu}>
                  {gu}
                </option>
              ))}
            </select>
            <select
              className="w-1/2 p-3 rounded-md border border-gray-300 bg-gray-100 focus:outline-none"
              value={selectedDong}
              onChange={handleDongChange}
              required
              disabled={!selectedGu}
            >
              <option value="">동을 선택하세요</option>
              {selectedGu &&
                seoulGuDong[selectedGu].map((dong) => (
                  <option key={dong} value={dong}>
                    {dong}
                  </option>
                ))}
            </select>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center w-full bg-blue-600 text-white font-semibold rounded-md py-3 mt-3 hover:bg-blue-700 transition"
            disabled={!selectedGu || !selectedDong}
          >
            <svg
              className="w-5 h-5 mr-2 opacity-70"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            검색
          </button>
        </form>
      </div>
    </div>
  );
}
