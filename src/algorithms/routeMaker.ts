import { busStops } from "../data/busStop";
import { places } from "../data/places";
import { FinalRoute, RoutePath, ScoredPlace } from "../types/route";
import { UserRouteInput } from "../types/userInput";
import { findNextBus } from "./busTimeCalculator";
import { makeGreedyRoute } from "./greedyRoute";
import { calculateTotalTimeSummary } from "./routeTimeCalculator";
import { calculateMapDistance } from "./utils/distanceUtils";
import { calculateWalkTimeFromDistance } from "./utils/timeUtils";

const TERMINAL_STOP_ID = 1;

// 시간 계산 헬퍼 함수들
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function createRoute(userInput: UserRouteInput): FinalRoute {
  console.log("최적 경로 탐색 시작", userInput);
  const warnings: string[] = [];

  // 0. 출발 정류장 좌표 확보
  const startStop = busStops.find(stop => stop.id === userInput.startBusStopId);
  if (!startStop) throw new Error("유효하지 않은 출발 정류장 ID입니다.");
  const startPosition = { latitude: startStop.latitude, longitude: startStop.longitude };

  // 1. 전체 데이터를 넘겨서 취향 우선 후 빈자리 채우기 유도
  const selectedRoute: ScoredPlace[] = makeGreedyRoute(places, userInput, startPosition);

  if (selectedRoute.length < userInput.maxPlaceCount) {
    warnings.push("남은 시간이 부족하여 원하시는 장소 개수를 모두 채우지 못했습니다.");
  }

  // 실시간 타임라인 시뮬레이션 시작
  let currentMins = timeToMinutes(userInput.startTime);
  let startBus = null;
  let returnBus = null;
  const paths: RoutePath[] = [];

  if (selectedRoute.length > 0) {
    const firstPlace = selectedRoute[0];

    // [출발지 -> 첫 장소 버스 조회]
    startBus = findNextBus(userInput.startBusStopId, firstPlace.nearestBusStopId, minutesToTime(currentMins));
    if (startBus) {
      currentMins += (startBus.waitTime + startBus.rideTime); // 버스 타느라 흘러간 시간 누적
    }

    // 장소 순회 및 구간별 이동
    for (let i = 0; i < selectedRoute.length; i++) {
      const currentPlace = selectedRoute[i];
      
      // 장소에서 체류하는 시간 누적
      currentMins += currentPlace.averageTime;

      // 다음 목적지가 남아있다면 이동 수단 결정
      if (i < selectedRoute.length - 1) {
        const nextPlace = selectedRoute[i + 1];
        
        // 두 지점 간 거리 및 기본 도보 시간 계산
        const distance = calculateMapDistance(
          { latitude: currentPlace.latitude, longitude: currentPlace.longitude },
          { latitude: nextPlace.latitude, longitude: nextPlace.longitude }
        );
        const walkTime = calculateWalkTimeFromDistance(distance);

        let intermediateBus = null;
        let finalWalkTime = walkTime;

        // 거리가 1km 이상이거나 걸어서 15분 이상 걸리면 버스 탑승을 시도.
        if (distance >= 1000 || walkTime >= 15) {
          // 현재 흘러간 시간을 기준으로 다음 버스 시간표 조회
          intermediateBus = findNextBus(
            currentPlace.nearestBusStopId,
            nextPlace.nearestBusStopId,
            minutesToTime(currentMins)
          );

          if (intermediateBus) {
            finalWalkTime = 0; // 버스를 탔으므로 도보 시간은 리셋
            currentMins += (intermediateBus.waitTime + intermediateBus.rideTime); // 버스 시간 누적
          } else {
            // 버스가 안 오면 걸어감
            currentMins += walkTime;
          }
        } else {
          // 가까운 거리는 걸어감
          currentMins += walkTime;
        }

        // 구간 경로 영수증 발행
        paths.push({
          from: currentPlace.id,
          to: nextPlace.id,
          path: [currentPlace.id, nextPlace.id],
          distance,
          walkTime: finalWalkTime,
          bus: intermediateBus
        });
      }
    }

    // [마지막 장소 -> 최종 도착 정류장 복귀 버스 조회]
    const lastPlace = selectedRoute[selectedRoute.length - 1];
    returnBus = findNextBus(lastPlace.nearestBusStopId, userInput.endBusStopId, minutesToTime(currentMins));
    if (!returnBus) {
      warnings.push("일정 종료 후 도착 정류장으로 돌아오는 버스가 끊겼거나 없습니다.");
    }
  }

  // 5. 총 소요 시간 정산
  const timeSummary = calculateTotalTimeSummary(selectedRoute, paths, startBus, returnBus);

  return {
    routeTitle: "안동 취향 저격 묶음 여행",
    summary: `선택하신 조건에 맞춰 총 ${selectedRoute.length}개의 장소를 최적의 동선으로 묶었습니다.`,
    startBus,
    returnBus,
    places: selectedRoute,
    paths,
    timeSummary,
    warnings
  };
}