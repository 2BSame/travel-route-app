import { SelectedBus } from "../types/busSchedule";
import { RoutePath, ScoredPlace, TimeSummary } from "../types/route";

export function calculateTotalTimeSummary(
  places: ScoredPlace[],
  paths: RoutePath[],
  startBus: SelectedBus | null,
  returnBus: SelectedBus | null
): TimeSummary {
  // 1. 체류 시간 합산
  const stayTime = places.reduce((acc, place) => acc + place.averageTime, 0);

  // 2. 이동 시간 및 버스 대기 시간 초기화
  let walkingTime = 0;
  let busTime = 0;
  let busWaitTime = 0;

  // 3. 구간별 이동 경로(paths) 정산
  for (const path of paths) {
    if (path.bus) {
      // 버스를 탔다면 버스 탑승 시간과 대기 시간 누적
      busTime += path.bus.rideTime;
      busWaitTime += path.bus.waitTime;
    } else {
      // 버스를 안 탔다면 도보 시간 누적
      walkingTime += path.walkTime;
    }
  }

  // 4. 출발/복귀 버스 시간 추가 정산
  if (startBus) {
    busTime += startBus.rideTime;
    busWaitTime += startBus.waitTime;
  }
  if (returnBus) {
    busTime += returnBus.rideTime;
    busWaitTime += returnBus.waitTime;
  }

  const totalTime = stayTime + walkingTime + busTime + busWaitTime;

  return { totalTime, walkingTime, stayTime, busTime, busWaitTime };
}