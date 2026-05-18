import { categoryMask, themeMask } from "../types/place";
import { UserRouteInput } from "../types/userInput";
import { createRoute } from "./routeMaker";

// 1. 가상의 사용자 입력(UI에서 넘어온다고 가정)
const mockUserInput: UserRouteInput = {
  startTime: "10:00", // 오전 10시 출발
  totalAvailableTime: 900,      // 총 15시간(900분)
  themes: themeMask.MOOD | themeMask.FOOD, // 분위기 & 먹거리 테마
  categories: categoryMask.FOOD, // 먹거리 카테고리
  mealRequired: true,  // 식사를 우선할 것
  maxPlaceCount: 5, //5개 방문
  startBusStopId: 1,            // 터미널에서 출발
  endBusStopId: 3               // 시내(교보생명)에서 종료
};

console.log("========================================");
console.log("테스트 시작");
console.log("========================================\n");

try {
  //메인 알고리즘 실행.
  const result = createRoute(mockUserInput);

  // 3. 결과를 보기 좋게(JSON 포맷) 터미널에 출력
  console.log(JSON.stringify(result, null, 2));
  
} catch (error) {
  console.error("에러 발생:", error);
}