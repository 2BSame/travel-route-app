export interface UserRouteInput {
  startTime: string; // 예: "09:00"
  totalAvailableTime: number; // 분 단위로 입력.
  themes: number; // 비트마스크 합 (예: themeMask.MOOD | themeMask.QUIET), input을 구현할 때, place안의 마스크를 불러올 것.
  categories: number; // 비트마스크 합
  maxPlaceCount: number;
}