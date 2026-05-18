export interface UserRouteInput {
  startTime: string; // 예: "09:00"
  totalAvailableTime: number; // 분 단위
  themes: number; // 비트마스크
  categories: number; // 비트마스크
  mealRequired: boolean;
  maxPlaceCount: number;
  startBusStopId: number; // 출발할 정류장 ID
  endBusStopId: number;   // 최종적으로 돌아올 정류장 ID
}