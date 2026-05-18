import { Place, categoryMask } from "../types/place";
import { ScoredPlace } from "../types/route";
import { UserRouteInput } from "../types/userInput";
import { calculatePlaceScore } from "./scoreCalculator";
import { calculateMapDistance } from "./utils/distanceUtils";
import { calculateWalkTimeFromDistance } from "./utils/timeUtils";

// 400 이내를 묶음 처리
const BUNDLE_RADIUS = 400; 

export function makeGreedyRoute(
  candidatePlaces: Place[],
  userInput: UserRouteInput,
  startPosition: { latitude: number; longitude: number }
): ScoredPlace[] {
  const route: ScoredPlace[] = [];
  let currentPosition = startPosition;
  let remainingTime = userInput.totalAvailableTime;

  // 1. 식사 해결 여부 트래커 (밥을 안 먹어도 되거나, 이미 해결했으면 true)
  let mealSatisfied = !userInput.mealRequired;

  // 2. 모든 후보 장소에 대해 초기(Base) 점수와 예상 소요 시간 세팅
  let unvisited = candidatePlaces.map((place) => {
    const scoredPlace = calculatePlaceScore(place, userInput, currentPosition, remainingTime);
    const distance = calculateMapDistance(currentPosition, { 
      latitude: place.latitude, 
      longitude: place.longitude 
    });
    const walkTime = calculateWalkTimeFromDistance(distance);
    
    return {
      ...scoredPlace,
      requiredTime: walkTime + place.averageTime, // 이동 시간 + 체류 시간
    };
  });

  // 점수가 0 미만인 곳(시간 초과 등)은 1차로 걸러냄
  unvisited = unvisited.filter(p => p.score >= 0);

  // 3. 최대 개수에 도달하거나 남은 시간이 부족할 때까지 반복 탐색
  while (unvisited.length > 0 && route.length < userInput.maxPlaceCount) {
    // 현재 남은 시간 안에 방문을 마칠 수 있는 곳만 필터링
    const possiblePlaces = unvisited.filter(p => p.requiredTime <= remainingTime);
    if (possiblePlaces.length === 0) break; // 더 이상 갈 곳이 없으면 종료

    // 식사 여부에 따른 가중치 계산
    let currentPossible = possiblePlaces.map(p => {
      // 밥을 꼭 먹어야 하는데 아직 안 먹었고, 이 장소가 FOOD면
      if (!mealSatisfied && (p.categories & categoryMask.FOOD) !== 0) {
        return {
          ...p,
          score: p.score + 1000, // 가장 높은 가중치 부여, 1등 고정
          reasons: [...p.reasons, "식사가 포함된 일정을 위해 최우선으로 배정되었습니다."]
        };
      }
      return p;
    });

    // 점수 내림차순 정렬 후 1등 장소를 다음 방문지로 채택
    currentPossible.sort((a, b) => b.score - a.score);
    const nextPlace = currentPossible[0];

    // 방금 고른 장소가 FOOD였다면 식사 완료 처리
    if ((nextPlace.categories & categoryMask.FOOD) !== 0) {
      mealSatisfied = true; 
    }

    // 선택된 장소를 최종 경로에 추가
    const { requiredTime, ...scoredPlaceToPush } = nextPlace;
    route.push(scoredPlaceToPush as ScoredPlace);

    // 상태 업데이트: 시간 차감 및 내 위치 이동
    remainingTime -= nextPlace.requiredTime;
    currentPosition = { latitude: nextPlace.latitude, longitude: nextPlace.longitude };

    // 방금 방문한 장소는 대기열에서 제거
    unvisited = possiblePlaces.filter(p => p.id !== nextPlace.id);

    // 근처 방문
    unvisited = unvisited.map(place => {
      let bundleBonus = 0;
      let newReasons = [...place.reasons];

      // 같은 정류장 권역 우대 보너스 (다른 정류장을 갔다가 다시 오는걸 방지)
      // 방금 방문한 곳과 버스 정류장이 같다면(동네가 같다면) 취향 점수보다 높은 점수를 부여해 왔다 갔다를 방지.
      if (nextPlace.nearestBusStopId === place.nearestBusStopId) {
        bundleBonus += 60; 
        const lockdownReason = "같은 동네(정류장 권역)에 있어 이동이 매우 효율적입니다.";
        if (!newReasons.includes(lockdownReason)) {
          newReasons.push(lockdownReason);
        }
      }

      //  설정값 거리 이내 거리 가산점
      const distanceToNext = calculateMapDistance(currentPosition, { 
        latitude: place.latitude, 
        longitude: place.longitude 
      });
      
      if (distanceToNext <= BUNDLE_RADIUS) {
        bundleBonus += 15; 
        
        const spatialReason = "이전 방문지들과 가까워 도보 이동이 편리합니다.";
        if (!newReasons.includes(spatialReason)) {
          newReasons.push(spatialReason);
        }

        // 카테고리 시너지 가산점
        const isNextTour = (nextPlace.categories & categoryMask.TOUR) !== 0;
        const isPlaceRest = (place.categories & (categoryMask.CAFE | categoryMask.FOOD)) !== 0;
        
        if (isNextTour && isPlaceRest) {
          bundleBonus += 15;
          const synergyReason = "관광 후 쉬어가기 좋은 최적의 코스입니다.";
          if (!newReasons.includes(synergyReason)) {
            newReasons.push(synergyReason);
          }
        }
      }

      return {
        ...place,
        score: place.score + bundleBonus,
        reasons: newReasons
      };
    });
  }

  return route;
}