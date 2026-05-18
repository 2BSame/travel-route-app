import { Place } from "../types/place";
import { ScoredPlace } from "../types/route";
import { UserRouteInput } from "../types/userInput";
import { calculateMapDistance } from "./utils/distanceUtils";
import { calculateWalkTimeFromDistance } from "./utils/timeUtils";

export function calculatePlaceScore(
  place: Place,
  userInput: UserRouteInput,
  currentPosition: { latitude: number; longitude: number },
  remainingTime: number
): ScoredPlace {
  let score = 0;
  const reasons: string[] = [];

  // 1. 소요 시간 검증
  const distance = calculateMapDistance(currentPosition, {
    latitude: place.latitude,
    longitude: place.longitude
  });
  const walkTime = calculateWalkTimeFromDistance(distance);
  const requiredTime = walkTime + place.averageTime;

  // 남은 시간이 부족하면 점수 없이 바로 반환 (Greedy에서 걸러짐)
  if (requiredTime > remainingTime) {
    return { ...place, score: -1, reasons: ["시간 부족"] };
  }

  // 2. 카테고리 매칭 점수 (비트마스크 교집합)
  // userInput.categories가 0이면(아무것도 선택 안 함) 기본점수 부여
  if (userInput.categories === 0) {
    score += 10;
  } else if ((place.categories & userInput.categories) !== 0) {
    score += 50; // 카테고리가 일치하면 아주 큰 점수
    reasons.push("원하시는 카테고리에 맞는 장소입니다.");
  }

  // 3. 테마 매칭 점수 (비트마스크 교집합)
  if (userInput.themes === 0) {
    score += 10;
  } else if ((place.themes & userInput.themes) !== 0) {
    score += 50; // 테마가 일치하면 추가 가산점
    reasons.push("선택하신 테마 분위기와 어울립니다.");
  }

  // 4. 거리 점수 (가까울수록 기본 점수가 높음 - 최대 20점)
  // 공간 가산점(Bundle)과 별개로, 현재 위치에서 가까운 곳을 기본적으로 우대
  if (distance < 1000) { // 1km 이내
    const distanceScore = Math.floor((1000 - distance) / 50); // 50m당 1점씩 
    score += distanceScore;
    if (distanceScore > 10) reasons.push("현재 위치에서 걷기 좋은 거리에 있습니다.");
  }

  return {
    ...place,
    score,
    reasons
  };
}