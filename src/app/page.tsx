"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LocalStorage } from "@/lib/localStorage";
import { NaverMap } from "@/lib/NaverMap";
import { Location } from "../../types/basic";
import { seoulGuDong } from "../../types/seoulGuDong";

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGu && selectedDong) {
      LocalStorage.SetGuDong({
        gu: selectedGu,
        dong: selectedDong,
      });
      const result = await LocalStorage.ValidateGuDong();
      if (result) {
        router.push("/main");
      } else {
        alert("동네 인증에 실패했습니다.");
      }
    }
  };

  useEffect(() => {
    const checkValidation = async () => {
      if (await LocalStorage.ValidateGuDong()) {
        router.push("/main");
      } else {
        const lc: Location | null = await NaverMap.GetAddress();
        if (lc) {
          setSelectedDong(lc.dong);
          setSelectedGu(lc.gu);
        }
      }
    };
    checkValidation();
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
            동네 인증하기
          </button>
        </form>
      </div>
    </div>
  );
}
