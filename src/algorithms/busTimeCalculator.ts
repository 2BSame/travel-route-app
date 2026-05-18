import { busSchedules } from "../data/busSchedules";
import { SelectedBus } from "../types/busSchedule";

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function findNextBus(
  fromStopId: number,
  toStopId: number,
  currentTime: string
): SelectedBus | null {
  if (fromStopId === toStopId) return null; // 이미 같은 정류장이면 탈 필요 없음

  // ==========================================================
  // 1. BFS(너비 우선 탐색)로 환승 없는 직통 버스 경로 찾기
  // ==========================================================
  const queue: { currentStop: number; busNumber: string; accumulatedTime: number }[] = [];
  const visited = new Set<string>();

  // 출발 정류장에서 탈 수 있는 모든 버스 방향을 큐에 삽입
  for (const schedule of busSchedules.filter(s => s.fromBusStopId === fromStopId)) {
    queue.push({ 
      currentStop: schedule.toBusStopId, 
      busNumber: schedule.busNumber, 
      accumulatedTime: schedule.estimatedMinutes 
    });
    visited.add(`${schedule.busNumber}-${schedule.toBusStopId}`);
  }

  let foundPath: { busNumber: string, rideTime: number } | null = null;

  while (queue.length > 0) {
    const { currentStop, busNumber, accumulatedTime } = queue.shift()!;

    // 목적지에 도달했다면 탐색 종료
    if (currentStop === toStopId) {
      foundPath = { busNumber, rideTime: accumulatedTime };
      break; 
    }

    // 현재 정류장에서 '같은 버스 번호'로 이어지는 다음 구간 탐색
    const nextEdges = busSchedules.filter(s => s.fromBusStopId === currentStop && s.busNumber === busNumber);
    
    for (const schedule of nextEdges) {
      const stateKey = `${schedule.busNumber}-${schedule.toBusStopId}`;
      if (!visited.has(stateKey)) {
        visited.add(stateKey);
        queue.push({
          currentStop: schedule.toBusStopId,
          busNumber: schedule.busNumber,
          accumulatedTime: accumulatedTime + schedule.estimatedMinutes // 구간 소요 시간 누적
        });
      }
    }
  }

  // ==========================================================
  // 2. 찾은 경로를 바탕으로 가장 빨리 탈 수 있는 시간표 계산
  // ==========================================================
  if (!foundPath) return null; // 아무리 노선을 따라가도 목적지가 안 나오면 null

  // 찾은 버스 번호의 '출발지 정류장' 시간표를 가져옴
  const startSchedules = busSchedules.filter(s => s.fromBusStopId === fromStopId && s.busNumber === foundPath!.busNumber);
  if (startSchedules.length === 0) return null;

  const route = startSchedules[0]; 
  const currentMins = timeToMinutes(currentTime);
  let minWaitTime = Infinity;
  let bestDeparture = "";

  // 가장 덜 기다리는 버스 출발 시간 찾기
  for (const departure of route.departureTimes) {
    const departureMins = timeToMinutes(departure);
    const waitTime = departureMins - currentMins;

    if (waitTime >= 0 && waitTime < minWaitTime) {
      minWaitTime = waitTime;
      bestDeparture = departure;
    }
  }

  if (!bestDeparture) return null;

  return {
    busNumber: foundPath.busNumber as "110" | "210",
    fromBusStopId: fromStopId,
    toBusStopId: toStopId,
    departureTime: bestDeparture,
    waitTime: minWaitTime,
    rideTime: foundPath.rideTime,
    arrivalTime: minutesToTime(timeToMinutes(bestDeparture) + foundPath.rideTime)
  };
}