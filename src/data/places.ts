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
    name: "투썸플레이스 안동옥동점",
    categories: categoryMask.CAFE,
    themes: themeMask.MOOD,
    averageTime: 40,
    latitude: 36.5639102,
    longitude: 128.7018431,
    nearestBusStopId: 4,
    description: "디저트가 유명한 카페."
  },
  {
    id: 4,
    name: "컴포즈커피 옥동점",
    categories: categoryMask.CAFE,
    themes: themeMask.QUIET,
    averageTime: 30,
    latitude: 36.5639321,
    longitude: 128.7036541,
    nearestBusStopId: 3,
    description: "저가 커피 전문점."
  },
  {
    id: 5,
    name: "설빙 안동옥동점",
    categories: categoryMask.CAFE,
    themes: themeMask.MOOD,
    averageTime: 40,
    latitude: 36.5632991,
    longitude: 128.7017642,
    nearestBusStopId: 4,
    description: "빙수 디저트 카페."
  },
  {
    id: 6,
    name: "죠스떡볶이 안동옥동점",
    categories: categoryMask.FOOD,
    themes: themeMask.FOOD,
    averageTime: 45,
    latitude: 36.5669166,
    longitude: 128.6993119,
    nearestBusStopId: 4,
    description: "매콤달콤한 떡볶이 전문점."
  },
  {
    id: 7,
    name: "교촌치킨 옥동점",
    categories: categoryMask.FOOD,
    themes: themeMask.FOOD,
    averageTime: 60,
    latitude: 36.5643321,
    longitude: 128.7025522,
    nearestBusStopId: 3,
    description: "인기 치킨 프랜차이즈."
  },
  {
    id: 8,
    name: "BBQ치킨 옥동점",
    categories: categoryMask.FOOD,
    themes: themeMask.FOOD,
    averageTime: 60,
    latitude: 36.5644411,
    longitude: 128.7028733,
    nearestBusStopId: 3,
    description: "프라이드 치킨 전문점."
  },
  {
    id: 9,
    name: "맘스터치 안동옥동점",
    categories: categoryMask.FOOD,
    themes: themeMask.FOOD,
    averageTime: 45,
    latitude: 36.5634111,
    longitude: 128.7034877,
    nearestBusStopId: 3,
    description: "학생들이 많이 찾는 햄버거 전문점."
  },
  {
    id: 10,
    name: "롯데리아 옥동점",
    categories: categoryMask.FOOD,
    themes: themeMask.FOOD,
    averageTime: 40,
    latitude: 36.5635121,
    longitude: 128.7029011,
    nearestBusStopId: 4,
    description: "패스트푸드 체인점."
  },
  {
    id: 11,
    name: "올리브영 안동옥동점",
    categories: categoryMask.CULTURE,
    themes: themeMask.CULTURE,
    averageTime: 25,
    latitude: 36.5637001,
    longitude: 128.7024412,
    nearestBusStopId: 4,
    description: "뷰티 및 생활용품 매장."
  },
  {
    id: 12,
    name: "다이소 안동옥동점",
    categories: categoryMask.CULTURE,
    themes: themeMask.CULTURE,
    averageTime: 30,
    latitude: 36.5631822,
    longitude: 128.7032141,
    nearestBusStopId: 3,
    description: "생활 잡화 전문점."
  },
  {
    id: 13,
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
    id: 14,
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
    id: 15,
    name: "옥동 중앙공원",
    categories: categoryMask.TOUR,
    themes: themeMask.NATURE | themeMask.QUIET,
    averageTime: 50,
    latitude: 36.5651122,
    longitude: 128.7040011,
    nearestBusStopId: 2,
    description: "산책과 운동하기 좋은 공원."
  },
  {
    id: 16,
    name: "GS25 옥동중앙점",
    categories: categoryMask.CULTURE,
    themes: themeMask.CULTURE,
    averageTime: 10,
    latitude: 36.5636111,
    longitude: 128.7031321,
    nearestBusStopId: 3,
    description: "24시간 편의점."
  },
  {
    id: 17,
    name: "CU 옥동한빛점",
    categories: categoryMask.CULTURE,
    themes: themeMask.CULTURE,
    averageTime: 10,
    latitude: 36.5640011,
    longitude: 128.7042211,
    nearestBusStopId: 2,
    description: "주택가 인근 편의점."
  },
  {
    id: 18,
    name: "파리바게뜨 옥동점",
    categories: categoryMask.CAFE,
    themes: themeMask.QUIET,
    averageTime: 20,
    latitude: 36.5637711,
    longitude: 128.7015521,
    nearestBusStopId: 4,
    description: "베이커리 전문점."
  },
  {
    id: 19,
    name: "배스킨라빈스 옥동점",
    categories: categoryMask.CAFE,
    themes: themeMask.MOOD,
    averageTime: 25,
    latitude: 36.5633122,
    longitude: 128.7021322,
    nearestBusStopId: 4,
    description: "아이스크림 전문점."
  },
  {
    id: 20,
    name: "할리스커피 옥동점",
    categories: categoryMask.CAFE,
    themes: themeMask.MOOD | themeMask.QUIET,
    averageTime: 40,
    latitude: 36.5640121,
    longitude: 128.7019734,
    nearestBusStopId: 4,
    description: "넓은 좌석이 특징인 카페."
  },
  {
    id: 21,
    name: "메가박스 안동점",
    categories: categoryMask.CULTURE,
    themes: themeMask.MOOD | themeMask.CULTURE,
    averageTime: 120,
    latitude: 36.5632444,
    longitude: 128.7009821,
    nearestBusStopId: 5,
    description: "옥동 멀티플렉스 영화관."
  },
  {
    id: 22,
    name: "옥동 마라탕 홍궁",
    categories: categoryMask.FOOD,
    themes: themeMask.FOOD,
    averageTime: 60,
    latitude: 36.5634411,
    longitude: 128.7024412,
    nearestBusStopId: 4,
    description: "중국식 마라탕 전문점."
  },
  {
    id: 23,
    name: "옥동 감성주점 달빛",
    categories: categoryMask.FOOD,
    themes: themeMask.MOOD,
    averageTime: 90,
    latitude: 36.5627219,
    longitude: 128.7019982,
    nearestBusStopId: 4,
    description: "분위기 좋은 술집."
  },
  {
    id: 24,
    name: "바디핏 헬스장 옥동점",
    categories: categoryMask.CULTURE,
    themes: themeMask.CULTURE,
    averageTime: 90,
    latitude: 36.5642221,
    longitude: 128.7039211,
    nearestBusStopId: 3,
    description: "24시간 운영 피트니스 센터."
  },
  {
    id: 25,
    name: "옥동 복주초등학교 앞 골목상권",
    categories: categoryMask.TOUR,
    themes: themeMask.MOOD,
    averageTime: 30,
    latitude: 36.5652012,
    longitude: 128.7012213,
    nearestBusStopId: 4,
    description: "학생·주민 중심 소규모 상권."
  }
];
