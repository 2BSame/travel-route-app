//두 위경도 좌표 간의 직선 거리를 미터 단위로 반환, Haversine 공식
export function calculateMapDistance(
  pos1: { latitude: number; longitude: number },
  pos2: { latitude: number; longitude: number }
): number {
  const R = 6371e3; // 지구의 반지름 미터
  const toRadian = Math.PI / 180;

  const lat1 = pos1.latitude * toRadian;
  const lat2 = pos2.latitude * toRadian;
  const deltaLat = (pos2.latitude - pos1.latitude) * toRadian;
  const deltaLon = (pos2.longitude - pos1.longitude) * toRadian;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  
  return Math.round(distance); // 소수점 버리고 정수로 반환
}