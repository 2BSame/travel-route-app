import { SelectedBus } from "./busSchedule";
import { Place } from "./place";

/**
 * 점수와 가산점 부여 사유가 포함된 장소 구조체
 * 개편된 Place(비트마스크 number형) 규격을 그대로 상속받습니다.
 */
export interface ScoredPlace extends Place {
  score: number;
  reasons: string[];
}

/**
 * 장소와 장소 사이의 이동 경로 세그먼트
 * 모든 ID가 number로 관리되므로 from, to, path 구조도 number형으로 싱크를 맞춥니다.
 */
export interface RoutePath {
  from: number;       // 출발 장소 ID
  to: number;         // 도착 장소 ID
  path: number[];     // 이동 경로 내 거쳐가는 정류장/장소 ID 배열 (직선 이동 시 [from, to])
  distance: number;   // 두 지점 간의 직선 거리 (meter 단위)
  walkTime: number;   // 도보 소요 시간 (분 단위)
}

/**
 * 전체 추천 경로의 시간 통계 영수증
 */
export interface TimeSummary {
  totalTime: number;     // 총 소요 시간 (도보 + 체류 + 버스 탑승 + 대기)
  walkingTime: number;   // 총 도보 시간
  stayTime: number;      // 총 장소 체류 시간 (averageTime의 합산)
  busTime: number;       // 총 버스 탑승 시간
  busWaitTime: number;   // 총 버스 대기 시간
}

/**
 * UI 렌더링을 위해 프론트엔드로 넘겨줄 최종 루트 결과물 객체
 */
export interface FinalRoute {
  routeTitle: string;
  summary: string;
  startBus: SelectedBus | null;  // 출발 시 탑승할 버스 정보 (없으면 null)
  returnBus: SelectedBus | null; // 복귀 시 탑승할 버스 정보 (없으면 null)
  places: ScoredPlace[];         // 동적 공간 가산점으로 순서가 정렬된 방문 장소 배열
  paths: RoutePath[];           // 장소 간 이동 경로 정보를 담은 배열
  timeSummary: TimeSummary;      // 시간 통계 데이터
  warnings: string[];           // 예외 처리 경고 메시지 배열 (예: "시간 부족으로 일부 장소 제외")
}