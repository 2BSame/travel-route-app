import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

// ============================================================================
// 1. TYPE DEFINITIONS & MOCK DATA
// ============================================================================
interface BusSchedule {
  fromBusStopId: number;
  toBusStopId: number;
  busNumber: string;
  estimatedMinutes: number;
  departureTimes: string[];
}

interface BusStop {
  id: number;
  name: string;
  x: number;
  y: number;
}

interface Place {
  id: number;
  name: string;
  x: number;
  y: number;
  category: string;
  categoryBit: number;
  themeBit: number;
  duration: number;
  type: 'normal' | 'active' | 'target';
  description: string;
  nearestBusStopId: number;
}

interface NextBusInfo {
  busNumber: string;
  fromBusStopId: number;
  toBusStopId: number;
  departureTime: string;
  waitTime: number;
  rideTime: number;
  arrivalTime: string;
}

interface TimelinePlace extends Place {
  startTimeStr: string;
  endTimeStr: string;
  walkFromPrevMinutes: number;
}

interface RouteMapPoint {
  key: string;
  name: string;
  x: number;
  y: number;
  kind: 'bus' | 'place';
  placeType?: Place['type'];
}

interface GeneratedPlan {
  places: Place[];
  timelineRoute: TimelinePlace[];
  routeMapPoints: RouteMapPoint[];
  startStop: BusStop;
  endStop: BusStop;
  outboundBus: NextBusInfo | null;
  returnBus: NextBusInfo | null;
  selectedStartTime: string;
  selectedDurationLabel: string;
  selectedOkdongMinutes: number;
  okdongStartTime: string;
  okdongEndTime: string;
  actualEndTime: string;
  okdongUsedMinutes: number;
  okdongRemainMinutes: number;
  extraMinutes: number;
  totalMinutes: number;
  returnWalkMinutes: number;
}

const okdongMapImage = require('../../assets/images/okdong_mock_map.png');

const themeMask = {
  EMOTION: 1 << 0,
  FOOD: 1 << 1,
  NATURE: 1 << 2,
  QUIET: 1 << 3,
  CULTURE: 1 << 4
};

const categoryMask = {
  CAFE: 1 << 0,
  FOOD: 1 << 1,
  DESSERT: 1 << 2,
  BAKERY: 1 << 3,
  SHOPPING: 1 << 4,
  CONVENIENCE: 1 << 5,
  CULTURE: 1 << 6,
  NATURE: 1 << 7,
  SPORT: 1 << 8,
  EMOTION: 1 << 9
};

const THEME_BIT_MAP: Record<string, number> = {
  '감성': themeMask.EMOTION,
  '먹거리': themeMask.FOOD,
  '자연': themeMask.NATURE,
  '조용한': themeMask.QUIET,
  '문화': themeMask.CULTURE
};

const SCHOOL_STOP_ID = 0;

const OKDONG_BUS_STOPS: BusStop[] = [
  { id: 1, name: '옥동 상가거리 정류장', x: 50, y: 63 },
  { id: 2, name: '복주초 앞 정류장', x: 62, y: 84 },
  { id: 3, name: '옥동 북측 정류장', x: 22, y: 38 }
];

const SCHOOL_STOP: BusStop = { id: SCHOOL_STOP_ID, name: '경국대 정류장', x: 0, y: 0 };

const outboundDepartures = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
];

const outboundDeparturesOffset = [
  '09:15', '09:45', '10:15', '10:45', '11:15', '11:45',
  '12:15', '12:45', '13:15', '13:45', '14:15', '14:45', '15:15', '15:45', '16:15'
];

const returnDepartures = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
];

const returnDeparturesOffset = [
  '10:15', '10:45', '11:15', '11:45', '12:15', '12:45',
  '13:15', '13:45', '14:15', '14:45', '15:15', '15:45',
  '16:15', '16:45', '17:15', '17:45', '18:15', '18:45', '19:15'
];

const busSchedules: BusSchedule[] = [
  { fromBusStopId: SCHOOL_STOP_ID, toBusStopId: 1, busNumber: '110', estimatedMinutes: 18, departureTimes: outboundDepartures },
  { fromBusStopId: SCHOOL_STOP_ID, toBusStopId: 2, busNumber: '210', estimatedMinutes: 23, departureTimes: outboundDeparturesOffset },
  { fromBusStopId: SCHOOL_STOP_ID, toBusStopId: 3, busNumber: '110', estimatedMinutes: 20, departureTimes: outboundDepartures },

  { fromBusStopId: 1, toBusStopId: SCHOOL_STOP_ID, busNumber: '110', estimatedMinutes: 18, departureTimes: returnDepartures },
  { fromBusStopId: 2, toBusStopId: SCHOOL_STOP_ID, busNumber: '210', estimatedMinutes: 23, departureTimes: returnDeparturesOffset },
  { fromBusStopId: 3, toBusStopId: SCHOOL_STOP_ID, busNumber: '110', estimatedMinutes: 20, departureTimes: returnDepartures }
];

const PLACES_DATA: Place[] = [
  { id: 1, name: '스타벅스 안동점', x: 33, y: 43, category: '카페', categoryBit: categoryMask.CAFE, themeBit: themeMask.EMOTION | themeMask.QUIET, duration: 30, type: 'normal', description: '상가거리 초입에 가까워 옥동 루트의 시작 지점으로 쓰기 좋습니다.', nearestBusStopId: 3 },
  { id: 2, name: '이디야커피 안동옥동점', x: 38, y: 45, category: '카페', categoryBit: categoryMask.CAFE, themeBit: themeMask.QUIET, duration: 25, type: 'normal', description: '가볍게 음료를 마시며 다음 장소로 이동하기 좋은 카페입니다.', nearestBusStopId: 1 },
  { id: 3, name: '투썸플레이스 안동옥동점', x: 18, y: 11, category: '카페', categoryBit: categoryMask.CAFE, themeBit: themeMask.EMOTION, duration: 40, type: 'normal', description: '지도 북서쪽 상권에 위치한 여유로운 디저트 카페입니다.', nearestBusStopId: 3 },
  { id: 4, name: '컴포즈커피 옥동점', x: 44, y: 52, category: '카페', categoryBit: categoryMask.CAFE, themeBit: themeMask.QUIET, duration: 20, type: 'normal', description: '짧은 동선 중간에 넣기 좋은 가성비 카페입니다.', nearestBusStopId: 1 },
  { id: 5, name: '설빙 안동옥동점', x: 57, y: 56, category: '디저트', categoryBit: categoryMask.DESSERT, themeBit: themeMask.FOOD | themeMask.EMOTION, duration: 45, type: 'normal', description: '디저트 중심 루트에서 체류 시간을 충분히 줄 수 있는 장소입니다.', nearestBusStopId: 1 },
  { id: 6, name: '죠스떡볶이 안동옥동점', x: 41, y: 48, category: '먹거리', categoryBit: categoryMask.FOOD, themeBit: themeMask.FOOD, duration: 30, type: 'normal', description: '상가거리 중심부의 분식 장소로 먹거리 루트와 잘 맞습니다.', nearestBusStopId: 1 },
  { id: 7, name: '교촌치킨 옥동점', x: 47, y: 50, category: '먹거리', categoryBit: categoryMask.FOOD, themeBit: themeMask.FOOD, duration: 60, type: 'normal', description: '식사 시간이 긴 루트에서 메인 식사 장소로 활용할 수 있습니다.', nearestBusStopId: 1 },
  { id: 8, name: 'BBQ치킨 옥동점', x: 68, y: 60, category: '먹거리', categoryBit: categoryMask.FOOD, themeBit: themeMask.FOOD, duration: 55, type: 'normal', description: '상권 동쪽에 위치한 식사 장소로 루트 후반에 배치하기 좋습니다.', nearestBusStopId: 1 },
  { id: 9, name: '맘스터치 안동옥동점', x: 50, y: 58, category: '먹거리', categoryBit: categoryMask.FOOD, themeBit: themeMask.FOOD, duration: 30, type: 'normal', description: '짧은 식사 시간으로도 일정에 넣기 쉬운 패스트푸드 지점입니다.', nearestBusStopId: 1 },
  { id: 10, name: '롯데리아 옥동점', x: 38, y: 62, category: '먹거리', categoryBit: categoryMask.FOOD, themeBit: themeMask.FOOD, duration: 25, type: 'normal', description: '중앙 도보 동선과 가까워 빠르게 식사하기 좋은 장소입니다.', nearestBusStopId: 1 },
  { id: 11, name: '올리브영 안동옥동점', x: 66, y: 58, category: '쇼핑', categoryBit: categoryMask.SHOPPING, themeBit: themeMask.CULTURE, duration: 20, type: 'normal', description: '쇼핑과 구경 요소를 넣고 싶을 때 적합한 지점입니다.', nearestBusStopId: 1 },
  { id: 12, name: '다이소 안동옥동점', x: 74, y: 58, category: '쇼핑', categoryBit: categoryMask.SHOPPING, themeBit: themeMask.CULTURE, duration: 35, type: 'normal', description: '생활용품 구경과 쇼핑 시간을 반영하기 좋은 장소입니다.', nearestBusStopId: 1 },
  { id: 13, name: '옥동 복주1길 상가거리', x: 43, y: 47, category: '문화/상권', categoryBit: categoryMask.CULTURE, themeBit: themeMask.CULTURE | themeMask.FOOD, duration: 50, type: 'active', description: '옥동 상권의 중심 동선으로 먹거리와 구경 요소를 함께 제공합니다.', nearestBusStopId: 1 },
  { id: 14, name: '옥동 제2공원', x: 54, y: 22, category: '자연', categoryBit: categoryMask.NATURE, themeBit: themeMask.NATURE | themeMask.QUIET, duration: 30, type: 'normal', description: '상권 위쪽의 녹지 구역으로 조용한 산책 테마와 어울립니다.', nearestBusStopId: 3 },
  { id: 15, name: '중앙도서관', x: 64, y: 75, category: '문화/상권', categoryBit: categoryMask.CULTURE, themeBit: themeMask.CULTURE | themeMask.QUIET, duration: 40, type: 'normal', description: '조용한 문화 루트에서 휴식형 장소로 배치할 수 있습니다.', nearestBusStopId: 2 },
  { id: 16, name: 'GS25 옥동희망점', x: 31, y: 42, category: '편의점', categoryBit: categoryMask.CONVENIENCE, themeBit: themeMask.QUIET, duration: 15, type: 'normal', description: '동선 초반 간식이나 음료를 보충하기 좋은 편의점입니다.', nearestBusStopId: 3 },
  { id: 17, name: 'CU 옥동효성점', x: 24, y: 62, category: '편의점', categoryBit: categoryMask.CONVENIENCE, themeBit: themeMask.QUIET, duration: 10, type: 'normal', description: '서쪽 골목 동선에 배치하기 좋은 짧은 체류 장소입니다.', nearestBusStopId: 3 },
  { id: 18, name: '파리바게뜨 옥동점', x: 47, y: 45, category: '베이커리', categoryBit: categoryMask.BAKERY, themeBit: themeMask.FOOD, duration: 25, type: 'normal', description: '간식 루트에서 자연스럽게 연결되는 베이커리 장소입니다.', nearestBusStopId: 1 },
  { id: 19, name: '베스킨라빈스 옥동점', x: 36, y: 80, category: '디저트', categoryBit: categoryMask.DESSERT, themeBit: themeMask.FOOD | themeMask.EMOTION, duration: 20, type: 'normal', description: '루트 후반에 짧게 들르기 좋은 디저트 지점입니다.', nearestBusStopId: 2 },
  { id: 20, name: '할리스커피', x: 70, y: 82, category: '카페', categoryBit: categoryMask.CAFE, themeBit: themeMask.EMOTION | themeMask.QUIET, duration: 45, type: 'normal', description: '동남쪽 구역의 여유로운 카페 체류 장소입니다.', nearestBusStopId: 2 },
  { id: 21, name: '롯데시네마 안동점', x: 49, y: 70, category: '문화', categoryBit: categoryMask.CULTURE, themeBit: themeMask.CULTURE, duration: 120, type: 'target', description: '문화 테마의 긴 체류 목적지로 사용할 수 있는 장소입니다.', nearestBusStopId: 2 },
  { id: 22, name: '마라감성', x: 22, y: 48, category: '먹거리', categoryBit: categoryMask.FOOD, themeBit: themeMask.FOOD, duration: 40, type: 'normal', description: '서쪽 골목 상권의 식사 후보로 먹거리 테마와 잘 맞습니다.', nearestBusStopId: 3 },
  { id: 23, name: '옥동 감성주점 달빛한잔', x: 70, y: 49, category: '감성', categoryBit: categoryMask.EMOTION, themeBit: themeMask.EMOTION, duration: 90, type: 'normal', description: '감성 분위기 테마에서 루트의 개성을 만들어 주는 장소입니다.', nearestBusStopId: 1 },
  { id: 24, name: '바디핏 헬스장 옥동점', x: 9, y: 63, category: '스포츠', categoryBit: categoryMask.SPORT, themeBit: themeMask.CULTURE, duration: 60, type: 'normal', description: '활동형 루트에 넣을 수 있는 스포츠 지점입니다.', nearestBusStopId: 3 },
  { id: 25, name: '옥동 복주초등학교 앞 골목상권', x: 28, y: 72, category: '문화/상권', categoryBit: categoryMask.CULTURE, themeBit: themeMask.CULTURE, duration: 40, type: 'normal', description: '복주초 인근의 작은 골목 상권을 둘러보는 장소입니다.', nearestBusStopId: 2 }
];

// ============================================================================
// 2. TIME UTILS & ROUTING ALGORITHM
// ============================================================================
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function diffMinutes(fromTime: string, toTime: string): number {
  return Math.max(0, timeToMinutes(toTime) - timeToMinutes(fromTime));
}

function getBusStopName(stopId: number): string {
  if (stopId === SCHOOL_STOP_ID) return SCHOOL_STOP.name;
  return OKDONG_BUS_STOPS.find(stop => stop.id === stopId)?.name || `정류장 ${stopId}`;
}

function findNextDirectBus(fromStopId: number, toStopId: number, currentTime: string): NextBusInfo | null {
  if (fromStopId === toStopId) return null;

  const schedules = busSchedules.filter(s => s.fromBusStopId === fromStopId && s.toBusStopId === toStopId);
  if (schedules.length === 0) return null;

  const currentMins = timeToMinutes(currentTime);
  let best: NextBusInfo | null = null;

  for (const schedule of schedules) {
    for (const departureTime of schedule.departureTimes) {
      const departureMins = timeToMinutes(departureTime);
      const waitTime = departureMins - currentMins;

      if (waitTime < 0) continue;

      const candidate: NextBusInfo = {
        busNumber: schedule.busNumber,
        fromBusStopId: fromStopId,
        toBusStopId: toStopId,
        departureTime,
        waitTime,
        rideTime: schedule.estimatedMinutes,
        arrivalTime: minutesToTime(departureMins + schedule.estimatedMinutes)
      };

      if (!best || candidate.waitTime < best.waitTime) {
        best = candidate;
      }
    }
  }

  return best;
}

function getWalkMinutes(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = (a.x - b.x) * 1.1;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return Math.max(2, Math.ceil(distance * 0.45));
}

function getNearestBusStop(point: { x: number; y: number }): BusStop {
  return OKDONG_BUS_STOPS.reduce((best, stop) => {
    const bestWalk = getWalkMinutes(point, best);
    const currentWalk = getWalkMinutes(point, stop);
    return currentWalk < bestWalk ? stop : best;
  }, OKDONG_BUS_STOPS[0]);
}

function parseDurationToMinutes(durationLabel: string): number {
  const timeMap: Record<string, number> = {
    '2시간': 120,
    '3시간': 180,
    '4시간': 240,
    '반나절': 360
  };
  return timeMap[durationLabel] || 180;
}

function filterPlacePool(userTheme: string, mealOption: string): Place[] {
  return PLACES_DATA.filter(place => {
    if (mealOption === '카페만') return ['카페', '디저트', '베이커리'].includes(place.category);
    if (mealOption === '관광지만') return ['자연', '문화', '쇼핑', '문화/상권', '스포츠', '감성'].includes(place.category);
    return true;
  }).sort((a, b) => {
    const themeBit = THEME_BIT_MAP[userTheme] || 0;
    const aTheme = (a.themeBit & themeBit) !== 0 ? 1 : 0;
    const bTheme = (b.themeBit & themeBit) !== 0 ? 1 : 0;
    return bTheme - aTheme;
  });
}

function buildOkdongRoute(userTheme: string, mealOption: string, maxOkdongMinutes: number) {
  const targetThemeBit = THEME_BIT_MAP[userTheme] || 0;
  const startStop = OKDONG_BUS_STOPS[0];
  const route: Place[] = [];
  const pool = filterPlacePool(userTheme, mealOption);

  let currentPoint: { x: number; y: number } = startStop;
  let usedMinutes = 0;
  const usedPlaceIds = new Set<number>();

  while (route.length < 8) {
    let bestPlace: Place | null = null;
    let bestScore = -Infinity;
    let bestProjectedUsed = usedMinutes;

    for (const place of pool) {
      if (usedPlaceIds.has(place.id)) continue;

      const walkToPlace = getWalkMinutes(currentPoint, place);
      const endStopForThisPlace = getNearestBusStop(place);
      const returnWalkReserve = getWalkMinutes(place, endStopForThisPlace);
      const projectedUsed = usedMinutes + walkToPlace + place.duration;

      if (projectedUsed + returnWalkReserve > maxOkdongMinutes) continue;

      const distancePenalty = walkToPlace * 3;
      let score = 100 - distancePenalty;
      if ((place.themeBit & targetThemeBit) !== 0) score += 130;
      if (mealOption === '식사 포함' && place.category === '먹거리') score += 45;
      if (place.type === 'active') score += 30;
      if (place.duration <= 30) score += 12;

      if (score > bestScore) {
        bestScore = score;
        bestPlace = place;
        bestProjectedUsed = projectedUsed;
      }
    }

    if (!bestPlace) break;

    route.push(bestPlace);
    usedPlaceIds.add(bestPlace.id);
    usedMinutes = bestProjectedUsed;
    currentPoint = bestPlace;
  }

  const endStop = route.length > 0 ? getNearestBusStop(route[route.length - 1]) : startStop;
  const returnWalkMinutes = route.length > 0 ? getWalkMinutes(route[route.length - 1], endStop) : 0;
  const okdongUsedMinutes = usedMinutes + returnWalkMinutes;

  return { route, startStop, endStop, returnWalkMinutes, okdongUsedMinutes };
}

function buildGeneratedPlan(
  userTheme: string,
  mealOption: string,
  durationLabel: string,
  selectedStartTime: string
): GeneratedPlan {
  const selectedOkdongMinutes = parseDurationToMinutes(durationLabel);
  const coreRoute = buildOkdongRoute(userTheme, mealOption, selectedOkdongMinutes);
  const outboundBus = findNextDirectBus(SCHOOL_STOP_ID, coreRoute.startStop.id, selectedStartTime);
  const okdongStartTime = outboundBus?.arrivalTime || selectedStartTime;

  let currentMins = timeToMinutes(okdongStartTime);
  let currentPoint: { x: number; y: number } = coreRoute.startStop;

  const timelineRoute: TimelinePlace[] = coreRoute.route.map(place => {
    const walkFromPrevMinutes = getWalkMinutes(currentPoint, place);
    currentMins += walkFromPrevMinutes;
    const startTimeStr = minutesToTime(currentMins);
    currentMins += place.duration;
    const endTimeStr = minutesToTime(currentMins);
    currentPoint = place;

    return {
      ...place,
      startTimeStr,
      endTimeStr,
      walkFromPrevMinutes
    };
  });

  const okdongEndMins = currentMins + coreRoute.returnWalkMinutes;
  const okdongEndTime = minutesToTime(okdongEndMins);
  const returnBus = findNextDirectBus(coreRoute.endStop.id, SCHOOL_STOP_ID, okdongEndTime);
  const actualEndTime = returnBus?.arrivalTime || okdongEndTime;

  const outboundExtra = outboundBus ? outboundBus.waitTime + outboundBus.rideTime : 0;
  const returnExtra = returnBus ? returnBus.waitTime + returnBus.rideTime : 0;
  const extraMinutes = outboundExtra + returnExtra;
  const totalMinutes = diffMinutes(selectedStartTime, actualEndTime);
  const okdongUsedMinutes = diffMinutes(okdongStartTime, okdongEndTime);
  const okdongRemainMinutes = selectedOkdongMinutes - okdongUsedMinutes;

  const endPoint = coreRoute.endStop.id === coreRoute.startStop.id
    ? { ...coreRoute.endStop, x: Math.min(coreRoute.endStop.x + 3, 96), y: Math.min(coreRoute.endStop.y + 3, 96) }
    : coreRoute.endStop;

  const routeMapPoints: RouteMapPoint[] = [
    { key: `bus-start-${coreRoute.startStop.id}`, name: coreRoute.startStop.name, x: coreRoute.startStop.x, y: coreRoute.startStop.y, kind: 'bus' },
    ...timelineRoute.map(place => ({
      key: `place-${place.id}`,
      name: place.name,
      x: place.x,
      y: place.y,
      kind: 'place' as const,
      placeType: place.type
    })),
    { key: `bus-end-${coreRoute.endStop.id}`, name: coreRoute.endStop.name, x: endPoint.x, y: endPoint.y, kind: 'bus' }
  ];

  return {
    places: coreRoute.route,
    timelineRoute,
    routeMapPoints,
    startStop: coreRoute.startStop,
    endStop: coreRoute.endStop,
    outboundBus,
    returnBus,
    selectedStartTime,
    selectedDurationLabel: durationLabel,
    selectedOkdongMinutes,
    okdongStartTime,
    okdongEndTime,
    actualEndTime,
    okdongUsedMinutes,
    okdongRemainMinutes,
    extraMinutes,
    totalMinutes,
    returnWalkMinutes: coreRoute.returnWalkMinutes
  };
}

// 모바일 화면 넓이에 따른 커스텀 지도 좌표 매핑 계산
const MAP_WIDTH = Dimensions.get('window').width - 72;
const MAP_HEIGHT = 260;

function getMapCoords(percentX: number, percentY: number) {
  return {
    x: (percentX / 100) * MAP_WIDTH,
    y: (percentY / 100) * MAP_HEIGHT
  };
}

// ============================================================================
// 3. MAIN REACT NATIVE COMPONENT
// ============================================================================
export default function AndongTravelApp() {
  const [activeTab, setActiveTab] = useState<string>('대기');
  const [duration, setDuration] = useState<string>('3시간');
  const [startTime, setStartTime] = useState<string>('10:00');
  const [meal, setMeal] = useState<string>('식사 포함');
  const [theme, setTheme] = useState<string>('먹거리');
  const [selectedTag, setSelectedTag] = useState<string>('전체');
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [generatedMeal, setGeneratedMeal] = useState<string>('식사 포함');
  const [generatedTheme, setGeneratedTheme] = useState<string>('먹거리');

  const startTimes = ['09:00', '10:00', '11:00', '12:00', '13:00'];
  const durations = ['2시간', '3시간', '4시간', '반나절'];
  const meals = ['식사 포함', '카페만', '관광지만'];
  const themes = ['감성', '먹거리', '자연', '조용한', '문화'];

  const displayTime = activeTab === '입력' || activeTab === '대기'
    ? startTime
    : generatedPlan?.selectedStartTime || startTime;

  const timelineRoute = generatedPlan?.timelineRoute || [];
  const routeMapPoints = generatedPlan?.routeMapPoints || [];

  const filteredCards = useMemo(() => {
    if (selectedTag === '전체') return timelineRoute;
    if (selectedTag === '쇼핑/편의') return timelineRoute.filter(p => p.category === '쇼핑' || p.category === '편의점');
    return timelineRoute.filter(p => p.category === selectedTag);
  }, [timelineRoute, selectedTag]);

  const handleGenerateRoute = () => {
    const plan = buildGeneratedPlan(theme, meal, duration, startTime);
    setGeneratedPlan(plan);
    setGeneratedMeal(meal);
    setGeneratedTheme(theme);
    setSelectedTag('전체');
    setActiveTab('지도');
  };

  const renderEmptyState = (title: string, desc: string) => (
    <View style={styles.emptyStateBox}>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateDesc}>{desc}</Text>
      <TouchableOpacity onPress={() => setActiveTab('입력')} style={styles.emptyActionBtn}>
        <Text style={styles.emptyActionText}>조건 선택하러 가기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={activeTab === '대기' ? 'light-content' : 'dark-content'} />

      <View style={[styles.statusBarPlaceholder, { backgroundColor: activeTab === '대기' ? '#006e3f' : '#ffffff' }]}> 
        <Text style={[styles.statusBarTime, { color: activeTab === '대기' ? '#d1fae5' : '#64748b' }]}>{displayTime}</Text>
      </View>

      <View style={styles.body}>
        {activeTab === '대기' && (
          <View style={styles.splashContainer}>
            <View style={styles.splashIconBox}>
              <Text style={{ fontSize: 34 }}>🗺️</Text>
            </View>

            <Text style={styles.splashTitle}>안동 여행 루트</Text>
            <Text style={styles.splashSubtitle}>
              시간, 테마, 식사 여부를 바탕으로{`\n`}
              안동 옥동 맞춤형 이동 경로를 추천합니다.
            </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setActiveTab('입력')}
              style={styles.splashStartBtn}
            >
              <Text style={styles.splashStartText}>루트 추천 시작하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === '입력' && (
          <View style={styles.screenFrame}>
            <View style={styles.fixedHeader}>
              <Text style={styles.pageTitle}>여행 조건 선택</Text>
              <Text style={[styles.pageSubtitle, styles.fixedHeaderSubtitle]}>
                조건을 고르면 버스 시간표 기반으로 이동 가능한 추천 루트를 생성합니다.
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.selectionScrollContent}
            >
              <Text style={styles.sectionLabel}>시작 시간</Text>
              <View style={styles.gridThreeColumn}>
                {startTimes.map(item => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setStartTime(item)}
                    style={[styles.choiceBtn, startTime === item ? styles.btnSelected : styles.btnUnselected]}
                  >
                    <Text style={[styles.choiceBtnText, startTime === item ? styles.textSelected : styles.textUnselected]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>옥동 여행 시간</Text>
              <View style={styles.gridTwoColumn}>
                {durations.map(item => (
                  <TouchableOpacity 
                    key={item} 
                    onPress={() => setDuration(item)} 
                    style={[styles.choiceBtn, duration === item ? styles.btnSelected : styles.btnUnselected]}
                  >
                    <Text style={[styles.choiceBtnText, duration === item ? styles.textSelected : styles.textUnselected]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>
                  선택한 여행 시간은 옥동 도착 후부터 복귀 정류장 도착 전까지의 시간만 계산합니다. 경국대↔옥동 버스 대기·이동 시간은 추가 소요 시간으로 따로 표시됩니다.
                </Text>
              </View>

              <Text style={styles.sectionLabel}>식사 여부</Text>
              <View style={styles.rowLayout}>
                {meals.map(item => (
                  <TouchableOpacity 
                    key={item} 
                    onPress={() => setMeal(item)} 
                    style={[styles.choiceBtn, { flex: 1 }, meal === item ? styles.btnSelected : styles.btnUnselected]}
                  >
                    <Text style={[styles.choiceBtnText, meal === item ? styles.textSelected : styles.textUnselected]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>선호 테마</Text>
              <View style={styles.gridThreeColumn}>
                {themes.map(item => (
                  <TouchableOpacity 
                    key={item} 
                    onPress={() => setTheme(item)} 
                    style={[styles.choiceBtn, theme === item ? styles.btnSelected : styles.btnUnselected]}
                  >
                    <Text style={[styles.choiceBtnText, { fontSize: 12 }, theme === item ? styles.textSelected : styles.textUnselected]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.fixedBottomBox}>
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={handleGenerateRoute}
                style={[styles.submitBtn, styles.fixedSubmitBtn]}
              >
                <Text style={styles.submitBtnText}>추천 경로 생성하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === '지도' && (
          <View style={styles.screenFrame}>
            <View style={styles.fixedHeader}>
              <Text style={styles.pageTitle}>지도 경로</Text>
              <Text style={[styles.pageSubtitle, styles.fixedHeaderSubtitle]}>
                버스 정류장에서 시작하고 버스 정류장으로 종료되는 추천 루트입니다.
              </Text>
            </View>

            {!generatedPlan ? (
              renderEmptyState('아직 생성된 루트가 없습니다.', '선택 화면에서 조건을 고른 뒤 추천 경로를 먼저 생성해 주세요.')
            ) : (
              <>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.mapScrollContent}
                >
                  <View style={styles.routeSummaryBox}>
                    <View style={styles.routeSummaryItem}>
                      <Text style={styles.routeSummaryLabel}>출발 선택</Text>
                      <Text style={styles.routeSummaryValue}>{generatedPlan.selectedStartTime}</Text>
                    </View>
                    <View style={styles.routeSummaryItem}>
                      <Text style={styles.routeSummaryLabel}>옥동 시작</Text>
                      <Text style={styles.routeSummaryValue}>{generatedPlan.okdongStartTime}</Text>
                    </View>
                    <View style={styles.routeSummaryItem}>
                      <Text style={styles.routeSummaryLabel}>실제 종료</Text>
                      <Text style={styles.routeSummaryValue}>{generatedPlan.actualEndTime}</Text>
                    </View>
                  </View>

                  <View style={styles.conditionSummaryLine}>
                    <Text style={styles.conditionSummaryText}>#{generatedTheme}</Text>
                    <Text style={styles.conditionSummaryText}>#{generatedMeal}</Text>
                    <Text style={styles.conditionSummaryText}>#{generatedPlan.selectedDurationLabel}</Text>
                  </View>

                  <View style={styles.timeAnalysisBox}>
                    <View style={styles.timeAnalysisRow}>
                      <Text style={styles.timeAnalysisLabel}>선택한 옥동 여행 시간</Text>
                      <Text style={styles.timeAnalysisValue}>{generatedPlan.selectedOkdongMinutes}분</Text>
                    </View>
                    <View style={styles.timeAnalysisRow}>
                      <Text style={styles.timeAnalysisLabel}>실제 옥동 사용 시간</Text>
                      <Text style={styles.timeAnalysisValue}>{generatedPlan.okdongUsedMinutes}분</Text>
                    </View>
                    <View style={styles.timeAnalysisRow}>
                      <Text style={styles.timeAnalysisLabel}>추가 소요 시간</Text>
                      <Text style={styles.timeAnalysisValue}>{generatedPlan.extraMinutes}분</Text>
                    </View>
                    <View style={styles.timeAnalysisRow}>
                      <Text style={styles.timeAnalysisLabel}>전체 일정 소요</Text>
                      <Text style={styles.timeAnalysisValue}>{generatedPlan.totalMinutes}분</Text>
                    </View>
                    <Text style={styles.timeAnalysisDesc}>
                      추가 소요 시간은 경국대↔옥동 버스 대기 시간과 버스 탑승 시간을 합친 값입니다. 옥동 내부 도보와 장소 체류는 옥동 여행 시간에 포함됩니다.
                    </Text>
                  </View>

                  <View style={styles.mapBorderContainer}>
                    <View style={styles.mapCanvas}>
                      <Image source={okdongMapImage} style={styles.mapImage} resizeMode="stretch" />

                      <Svg width={MAP_WIDTH} height={MAP_HEIGHT} style={styles.mapOverlay}>
                        {routeMapPoints.length > 1 && (
                          <Polyline
                            points={routeMapPoints
                              .map(point => {
                                const c = getMapCoords(point.x, point.y);
                                return `${c.x},${c.y}`;
                              })
                              .join(' ')}
                            fill="none"
                            stroke="#006e3f"
                            strokeWidth={4}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={0.78}
                          />
                        )}
                      </Svg>

                      {routeMapPoints.map((point, idx) => {
                        const coords = getMapCoords(point.x, point.y);
                        const pinColor = point.kind === 'bus'
                          ? '#2563eb'
                          : point.placeType === 'active'
                            ? '#f97316'
                            : point.placeType === 'target'
                              ? '#ef4444'
                              : '#006e3f';

                        return (
                          <View
                            key={point.key}
                            style={[styles.markerAbsolute, { left: coords.x, top: coords.y }]}
                          >
                            <View style={[styles.markerBadge, { backgroundColor: pinColor }]}> 
                              <Text style={styles.markerBadgeText}>{idx + 1}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  <Text style={styles.sectionLabel}>추천 순서 및 시간 계산</Text>
                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryItemRow}>
                      <Text style={styles.summaryText}>
                        <Text style={{ color: '#2563eb', fontWeight: '900' }}>1. {generatedPlan.startStop.name}</Text>
                        <Text style={{ fontSize: 11, color: '#64748b' }}> 옥동 도착 {generatedPlan.okdongStartTime}</Text>
                      </Text>
                      {generatedPlan.outboundBus && (
                        <Text style={styles.summaryBusInfo}>
                          🚌 {getBusStopName(generatedPlan.outboundBus.fromBusStopId)}에서 {generatedPlan.outboundBus.busNumber}번 탑승 · 대기 {generatedPlan.outboundBus.waitTime}분 + 이동 {generatedPlan.outboundBus.rideTime}분
                        </Text>
                      )}
                    </View>

                    {timelineRoute.map((p, idx) => (
                      <View key={`list-${p.id}`} style={styles.summaryItemRow}>
                        <Text style={styles.summaryText}>
                          <Text style={{ color: '#006e3f', fontWeight: '800' }}>{idx + 2}. {p.name}</Text> 
                          <Text style={{ fontSize: 11, color: '#64748b' }}> ({p.startTimeStr}~{p.endTimeStr})</Text>
                        </Text>
                        <Text style={styles.summaryMoveInfo}>↳ 이전 지점에서 도보 {p.walkFromPrevMinutes}분 · 체류 {p.duration}분</Text>
                      </View>
                    ))}

                    <View style={styles.summaryItemRow}>
                      <Text style={styles.summaryText}>
                        <Text style={{ color: '#2563eb', fontWeight: '900' }}>{timelineRoute.length + 2}. {generatedPlan.endStop.name}</Text>
                        <Text style={{ fontSize: 11, color: '#64748b' }}> 옥동 종료 {generatedPlan.okdongEndTime}</Text>
                      </Text>
                      <Text style={styles.summaryMoveInfo}>↳ 마지막 장소에서 복귀 정류장까지 도보 {generatedPlan.returnWalkMinutes}분</Text>
                      {generatedPlan.returnBus && (
                        <Text style={styles.summaryBusInfo}>
                          🚌 {generatedPlan.returnBus.busNumber}번 복귀 · 대기 {generatedPlan.returnBus.waitTime}분 + 이동 {generatedPlan.returnBus.rideTime}분 · 최종 {generatedPlan.actualEndTime}
                        </Text>
                      )}
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.fixedBottomBox}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => { setSelectedTag('전체'); setActiveTab('설명'); }}
                    style={[styles.submitBtn, styles.fixedSubmitBtn]}
                  >
                    <Text style={styles.submitBtnText}>상세 타임라인 전체 보기</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {activeTab === '설명' && (
          <View style={styles.screenFrame}>
            <View style={styles.fixedHeader}>
              <Text style={styles.pageTitle}>경로 상세 설명</Text>
              <Text style={[styles.pageSubtitle, styles.fixedHeaderSubtitle]}>
                생성된 장소와 이동 순서를 상세하게 보여줍니다.
              </Text>
            </View>

            {!generatedPlan ? (
              renderEmptyState('상세 설명을 표시할 루트가 없습니다.', '먼저 선택 화면에서 루트를 만들어 주세요.')
            ) : (
              <>
                <View style={styles.fixedTagArea}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['전체', '카페', '먹거리', '자연', '쇼핑/편의'].map(tag => (
                      <TouchableOpacity 
                        key={tag} 
                        onPress={() => setSelectedTag(tag)} 
                        style={[styles.tagBadge, selectedTag === tag ? { backgroundColor: '#006e3f' } : { backgroundColor: '#f0fdf4' }]}
                      >
                        <Text style={[styles.tagBadgeText, selectedTag === tag ? { color: '#ffffff' } : { color: '#006e3f' }]}>#{tag}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.detailScrollContent}
                >
                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>출발 버스</Text>
                    <Text style={styles.cardDesc}>
                      {generatedPlan.selectedStartTime} 기준으로 경국대 정류장에서 출발합니다. {generatedPlan.outboundBus
                        ? `${generatedPlan.outboundBus.busNumber}번 버스를 ${generatedPlan.outboundBus.waitTime}분 기다린 뒤 ${generatedPlan.outboundBus.rideTime}분 이동하여 ${generatedPlan.okdongStartTime}에 ${generatedPlan.startStop.name}에 도착합니다.`
                        : '연결 가능한 버스 시간이 없어 옥동 시작 시간이 선택 시간과 동일하게 처리되었습니다.'}
                    </Text>
                  </View>

                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>시간 계산 요약</Text>
                    <Text style={styles.cardDesc}>
                      선택한 옥동 여행 시간은 {generatedPlan.selectedOkdongMinutes}분이고, 실제 옥동 내부에서 사용한 시간은 {generatedPlan.okdongUsedMinutes}분입니다. 왕복 버스 대기·이동으로 {generatedPlan.extraMinutes}분이 추가되어 전체 일정은 총 {generatedPlan.totalMinutes}분입니다.
                    </Text>
                  </View>

                  {filteredCards.length === 0 ? (
                    <Text style={styles.emptyText}>선택한 태그에 해당하는 장소가 동선에 없습니다.</Text>
                  ) : (
                    filteredCards.map((loc) => {
                      const oIdx = timelineRoute.findIndex(p => p.id === loc.id) + 2;
                      const cardBadgeColor = loc.type === 'active' ? '#f97316' : loc.type === 'target' ? '#ef4444' : '#006e3f';
                      return (
                        <View key={`card-${loc.id}`} style={styles.detailCard}>
                          <View style={{ flexDirection: 'row' }}>
                            <View style={[styles.cardIndexBadge, { backgroundColor: cardBadgeColor }]}> 
                              <Text style={styles.cardIndexText}>{oIdx}</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <View style={styles.cardHeaderRow}>
                                <Text style={styles.cardTitle}>{loc.name}</Text>
                                <View style={styles.timeLabelBadge}>
                                  <Text style={styles.timeLabelText}>{loc.startTimeStr} - {loc.endTimeStr}</Text>
                                </View>
                              </View>
                              <Text style={styles.cardSubMeta}>도보 {loc.walkFromPrevMinutes}분 후 도착 · {loc.duration}분 체류 · {loc.category}</Text>
                              <Text style={styles.cardDesc}>{loc.description}</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })
                  )}

                  <View style={styles.detailCard}>
                    <Text style={styles.detailSectionTitle}>복귀 버스</Text>
                    <Text style={styles.cardDesc}>
                      마지막 장소에서 {generatedPlan.endStop.name}까지 도보 {generatedPlan.returnWalkMinutes}분 이동하여 옥동 일정을 {generatedPlan.okdongEndTime}에 종료합니다. {generatedPlan.returnBus
                        ? `${generatedPlan.returnBus.busNumber}번 버스를 ${generatedPlan.returnBus.waitTime}분 기다린 뒤 ${generatedPlan.returnBus.rideTime}분 이동하여 ${generatedPlan.actualEndTime}에 복귀합니다.`
                        : '연결 가능한 복귀 버스 시간이 없어 옥동 종료 시간이 전체 종료 시간으로 처리되었습니다.'}
                    </Text>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        )}
      </View>

      {activeTab !== '대기' && (
        <View style={styles.navBar}>
          {[
            { id: '입력', label: '선택', icon: '⚙️' },
            { id: '지도', label: '지도', icon: '🗺️' },
            { id: '설명', label: '상세', icon: '📜' }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity 
                key={`tab-btn-${tab.id}`} 
                onPress={() => setActiveTab(tab.id)} 
                style={styles.navItem}
              >
                <Text style={{ fontSize: 18, opacity: isSelected ? 1 : 0.4 }}>{tab.icon}</Text>
                <Text style={[styles.navItemText, isSelected ? styles.navTextActive : styles.navTextInactive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

// ============================================================================
// 4. REACT NATIVE STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  statusBarPlaceholder: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusBarTime: {
    fontSize: 13,
    fontWeight: '600'
  },
  body: {
    flex: 1
  },
  screenFrame: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  fixedHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 10
  },
  fixedHeaderSubtitle: {
    marginBottom: 0
  },
  selectionScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 24
  },
  mapScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24
  },
  detailScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24
  },
  fixedBottomBox: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  fixedSubmitBtn: {
    marginTop: 0
  },
  fixedTagArea: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc'
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#006e3f',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  splashIconBox: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 12
  },
  splashSubtitle: {
    fontSize: 14,
    color: '#d1fae5',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32
  },
  splashStartBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28
  },
  splashStartText: {
    color: '#006e3f',
    fontSize: 15,
    fontWeight: '800'
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 24,
    lineHeight: 18
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 14
  },
  gridTwoColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  gridThreeColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  rowLayout: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  choiceBtn: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 10
  },
  btnSelected: {
    backgroundColor: '#006e3f',
    borderColor: '#006e3f'
  },
  btnUnselected: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0'
  },
  choiceBtnText: {
    fontSize: 14,
    fontWeight: '600'
  },
  textSelected: {
    color: '#ffffff'
  },
  textUnselected: {
    color: '#475569'
  },
  noticeBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
    fontWeight: '600'
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#006e3f',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  routeSummaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12
  },
  routeSummaryItem: {
    flex: 1,
    alignItems: 'center'
  },
  routeSummaryLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    marginBottom: 4
  },
  routeSummaryValue: {
    fontSize: 15,
    color: '#006e3f',
    fontWeight: '900'
  },
  conditionSummaryLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  conditionSummaryText: {
    fontSize: 12,
    color: '#006e3f',
    fontWeight: '800',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14
  },
  timeAnalysisBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16
  },
  timeAnalysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5
  },
  timeAnalysisLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700'
  },
  timeAnalysisValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '900'
  },
  timeAnalysisDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    marginTop: 8
  },
  mapBorderContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    padding: 12,
    marginBottom: 16
  },
  mapCanvas: {
    width: '100%',
    height: MAP_HEIGHT,
    backgroundColor: '#f4f3ee',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  mapImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0
  },
  mapOverlay: {
    position: 'absolute',
    left: 0,
    top: 0
  },
  markerAbsolute: {
    position: 'absolute',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24
  },
  markerBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  markerBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900'
  },
  summaryContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#f8fafc',
    marginBottom: 16
  },
  summaryItemRow: {
    marginBottom: 10
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  summaryBusInfo: {
    paddingLeft: 14,
    color: '#2563eb',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
    lineHeight: 15
  },
  summaryMoveInfo: {
    paddingLeft: 14,
    color: '#64748b',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500'
  },
  emptyStateBox: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8
  },
  emptyStateDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  emptyActionBtn: {
    backgroundColor: '#006e3f',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 22
  },
  emptyActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
    height: 30
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 13,
    color: '#94a3b8'
  },
  detailCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginBottom: 12
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 6
  },
  cardIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardIndexText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1
  },
  timeLabelBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  timeLabelText: {
    fontSize: 11,
    color: '#006e3f',
    fontWeight: '700'
  },
  cardSubMeta: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginVertical: 4
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17
  },
  navBar: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64
  },
  navItemText: {
    fontSize: 11,
    marginTop: 2
  },
  navTextActive: {
    color: '#006e3f',
    fontWeight: '700'
  },
  navTextInactive: {
    color: '#94a3b8',
    fontWeight: '500'
  }
});
