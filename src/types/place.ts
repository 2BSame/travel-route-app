export type Place = {
  id: number;
  name: string;
  categories: number;
  themes: number;
  averageTime: number;
  latitude: number;
  longitude: number;
  nearestBusStopId: number;
  description: string;
};


//알고리즘 구현에 있어 카테고리와 테마가 문자열인것은 부적절하다 판단, 비트마스크로 변경함.
export const categoryMask = {
  TOUR: 1 << 0, //관광지
  FOOD: 1 << 1, //먹거리
  CAFE: 1 << 2, //카페
  CULTURE: 1 << 3, //문화
} as const

export const themeMask = {
  MOOD: 1 << 0, //감성
  FOOD: 1 << 1, //먹거리
  NATURE: 1 << 2, //자연
  QUIET: 1 << 3, //조용한
  CULTURE: 1 << 4, //문화
} as const