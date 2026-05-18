
//이동 거리를 입력받아 예상 도보 소요 시간 계산
export function calculateWalkTimeFromDistance(distanceMeters: number): number {
  const WALK_SPEED_METERS_PER_MINUTE = 67; //도보 속도는 시속 4km/h로 가정.
  
  // 거리가 0이거나 잘못된 값이면 0분 반환
  if (!distanceMeters || distanceMeters <= 0) return 0;

  //올림 처리
  return Math.ceil(distanceMeters / WALK_SPEED_METERS_PER_MINUTE);
}