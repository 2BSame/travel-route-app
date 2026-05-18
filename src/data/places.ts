import { Place, categoryMask, themeMask } from "../types/place";

export const places: Place[] = [
  {
    id: 1,
    name: "스타벅스 안동옥동점",
    categories: categoryMask.CAFE,
    themes: themeMask.MOOD | themeMask.QUIET,
    averageTime: 40,
    latitude: 36.5635224,
    longitude: 128.7021133,
    nearestBusStopId: 4,
    description: "옥동 상권 중심의 인기 커피 전문점."
  },
  {
    id: 2,
    name: "이디야커피 안동옥동점",
    categories: categoryMask.CAFE,
    themes: themeMask.MOOD | themeMask.QUIET,
    averageTime: 35,
    latitude: 36.5637313,
    longitude: 128.7034833,
    nearestBusStopId: 4,
    description: "가성비 좋은 커피 전문점."
  },
  {
    id: 3,
    name: "죠스떡볶이 안동옥동점",
    categories: categoryMask.FOOD,
    themes: themeMask.FOOD,
    averageTime: 45,
    latitude: 36.5669166,
    longitude: 128.6993119,
    nearestBusStopId: 4,
    description: "매콤달콤한 떡볶이 전문 맛집."
  },
  {
    id: 4,
    name: "옥동 복주1길 상가거리",
    categories: categoryMask.TOUR | categoryMask.CULTURE,
    themes: themeMask.MOOD | themeMask.CULTURE,
    averageTime: 50,
    latitude: 36.5635642,
    longitude: 128.7018351,
    nearestBusStopId: 4,
    description: "옥동 대표 상가 산책거리."
  },
  {
    id: 5,
    name: "옥동 제3공원",
    categories: categoryMask.TOUR,
    themes: themeMask.MOOD | themeMask.NATURE | themeMask.QUIET,
    averageTime: 60,
    latitude: 36.5649069,
    longitude: 128.699857,
    nearestBusStopId: 4,
    description: "지역 주민이 자주 찾는 공원."
  },
  {
    id: 6,
    name: "월영교",
    categories: categoryMask.TOUR,
    themes: themeMask.MOOD,
    averageTime: 50,
    latitude: 36.5770183,
    longitude: 128.7603195,
    nearestBusStopId: 6,
    description: "낙동강을 가로지르는 아름다운 다리."
  },
  {
    id: 7,
    name: "안동구시장",
    categories: categoryMask.FOOD,
    themes: themeMask.FOOD | themeMask.CULTURE,
    averageTime: 45,
    latitude: 36.5658373,
    longitude: 128.7289235,
    nearestBusStopId: 3,
    description: "안동의 대표 시장."
  },
  {
    id: 8,
    name: "안동시립박물관",
    categories: categoryMask.TOUR | categoryMask.CULTURE,
    themes: themeMask.MOOD | themeMask.QUIET | themeMask.CULTURE,
    averageTime: 70,
    latitude: 36.5792982,
    longitude: 128.7667861,
    nearestBusStopId: 6,
    description: "안동의 민속 문화를 전시하는 박물관."
  },
  {
    id: 9,
    name: "문화의 거리",
    categories: categoryMask.TOUR | categoryMask.CULTURE,
    themes: themeMask.MOOD | themeMask.FOOD | themeMask.CULTURE,
    averageTime: 45,
    latitude: 36.5646977,
    longitude: 128.7309763,
    nearestBusStopId: 3,
    description: "안동의 전통 문화를 체험할 수 있는 거리."
  }
  ];
