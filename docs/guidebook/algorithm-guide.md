[algorithm-guide.md](https://github.com/user-attachments/files/27852814/algorithm-guide.md)

# 알고리즘 개발 가이드북 

> 안동 여행 루트 추천 앱의 알고리즘 파트를 구현하기 위한 개발 중심 가이드북입니다.  
> 이 문서는 발표 자료가 아니라, 실제 앱 개발 과정에서 알고리즘 담당자가 참고하는 문서입니다.

---

## 1. 앱 개발 목표

이 앱은 사용자가 여행 조건을 입력하면, 안동 시내의 미리 정리된 장소 데이터 중에서 적절한 장소를 선택하고, 방문 순서와 이동 경로, 예상 소요 시간을 계산하여 추천 루트를 제공하는 앱입니다.

앱의 기본 흐름은 다음과 같습니다.

```text
사용자 입력
  ↓
조건에 맞는 장소 후보 추리기
  ↓
장소별 추천 점수 계산
  ↓
방문 순서 결정
  ↓
장소 간 이동 경로 계산
  ↓
버스 시간, 도보 시간, 체류 시간 계산
  ↓
최종 추천 루트 생성
  ↓
결과 화면과 모의지도에 표시
```

이번 프로젝트의 핵심은 실제 지도 서비스나 실시간 위치 서비스를 만드는 것이 아니라, 제한된 데이터와 모의지도를 사용해 여행 루트 추천 앱의 핵심 구조를 구현하는 것입니다.

---

## 2. 개발 범위

### 2.1 구현하는 기능

이번 앱에서 구현하는 알고리즘 기능은 다음과 같습니다.

- 사용자 입력값 처리
- 장소 데이터 필터링
- 장소별 추천 점수 계산
- Greedy 알고리즘 기반 방문 순서 결정
- Dijkstra 알고리즘 기반 장소 간 최단 경로 계산
- 110번, 210번 버스 시간표 계산
- 도보 이동 시간 계산
- 장소 체류 시간 계산
- 전체 여행 소요 시간 계산
- 시간 초과 시 장소 개수 조정
- 모의지도 UI에서 사용할 경로 데이터 생성
- UI 담당자에게 넘길 최종 route object 생성

### 2.2 구현하지 않는 기능

다음 기능은 이번 앱 개발 범위에서 제외합니다.

- 실제 GPS 추적
- 실시간 지도 API 사용
- 카카오맵, 네이버 지도, 구글맵 길찾기 연동
- 실시간 버스 위치 조회
- 실시간 버스 지연 정보 반영
- 실시간 교통량 반영
- 서버 DB 구축
- 로그인 기능
- 사용자 계정별 추천 기록 저장
- 실제 AI 모델 학습
- 딥러닝 추천 모델
- 완전한 TSP 최적화 알고리즘
- 전체 안동시의 모든 장소 자동 수집

앱은 정적 데이터 기반으로 동작합니다.

```text
정적 장소 데이터
+ 정적 버스 시간표
+ 모의지도 좌표
+ 규칙 기반 추천 점수
+ Greedy 방문 순서
+ Dijkstra 경로 계산
```

---

## 3. 전체 앱 구조에서 알고리즘의 위치

권장 폴더 구조는 다음과 같습니다.

```text
andong-route-app/
├─ README.md
├─ docs/
│  ├─ data-guide.md
│  ├─ algorithm-guide.md
│  ├─ algorithm-short-guide.md
│  └─ github-file-edit-guide.md
├─ app/
│  └─ index.tsx
├─ src/
│  ├─ screens/
│  │  ├─ HomeScreen.tsx
│  │  ├─ InputScreen.tsx
│  │  ├─ RouteResultScreen.tsx
│  │  └─ MapScreen.tsx
│  ├─ components/
│  │  ├─ MoodButton.tsx
│  │  ├─ PlaceCard.tsx
│  │  ├─ RouteSummary.tsx
│  │  ├─ MockMap.tsx
│  │  └─ BusInfoCard.tsx
│  ├─ data/
│  │  ├─ places.ts
│  │  ├─ edges.ts
│  │  ├─ busStops.ts
│  │  ├─ busTimes.ts
│  │  └─ themes.ts
│  ├─ algorithms/
│  │  ├─ filterPlaces.ts
│  │  ├─ scoreCalculator.ts
│  │  ├─ greedyRoute.ts
│  │  ├─ dijkstra.ts
│  │  ├─ busTimeCalculator.ts
│  │  ├─ walkTimeCalculator.ts
│  │  ├─ routeTimeCalculator.ts
│  │  ├─ routeValidator.ts
│  │  └─ routeMaker.ts
│  ├─ types/
│  │  ├─ place.ts
│  │  ├─ route.ts
│  │  ├─ bus.ts
│  │  └─ userInput.ts
│  └─ utils/
│     ├─ timeUtils.ts
│     ├─ distanceUtils.ts
│     └─ arrayUtils.ts
└─ package.json
```

알고리즘 담당자는 주로 다음 폴더를 사용합니다.

```text
src/algorithms/
src/types/
src/utils/
src/data/
```

UI 담당자와 직접 연결되는 부분은 `routeMaker.ts`의 반환값입니다. 따라서 알고리즘 파트는 최종적으로 UI에서 바로 사용할 수 있는 형태의 결과 객체를 만들어야 합니다.

---

## 4. 알고리즘 전체 흐름

알고리즘은 다음 순서로 실행됩니다.

```text
1. 사용자 입력 받기
2. 출발 버스 계산
3. 안동 시내 도착 시간 계산
4. 장소 후보 필터링
5. 장소별 추천 점수 계산
6. Greedy로 방문 순서 결정
7. 방문 순서에 따라 Dijkstra 경로 계산
8. 도보 시간, 체류 시간, 버스 시간 합산
9. 전체 시간이 초과되면 루트 조정
10. 최종 route object 반환
```

전체 흐름을 코드 관점으로 보면 다음과 같습니다.

```text
createRoute(userInput)
  ├─ findNextBus()
  ├─ filterPlaces()
  ├─ scorePlaces()
  ├─ makeGreedyRoute()
  ├─ createDetailedPaths()
  ├─ calculateRouteTime()
  ├─ validateRouteTime()
  └─ return finalRoute
```

---

## 5. 타입 정의

TypeScript를 사용하면 데이터 구조를 명확하게 관리할 수 있습니다. 알고리즘 파트는 데이터 형식이 중요하므로 `types` 폴더에 타입을 먼저 정리하는 것이 좋습니다.

### 5.1 장소 타입

파일 위치:

```text
src/types/place.ts
```

```ts
export type PlaceCategory =
  | "tour"
  | "food"
  | "cafe"
  | "culture"
  | "shopping"
  | "rest";

export type TimeZone =
  | "morning"
  | "lunch"
  | "afternoon"
  | "evening"
  | "night";

export interface MapPosition {
  x: number;
  y: number;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  themes: string[];
  tags: string[];
  address?: string;
  description: string;
  visitTime: number;
  recommendedTimes: TimeZone[];
  nearbyBusStopId?: string;
  mapPosition: MapPosition;
  priority?: number;
}
```

| 필드 | 설명 |
|---|---|
| `id` | 장소 고유 ID |
| `name` | 장소 이름 |
| `category` | 장소 카테고리 |
| `themes` | 장소와 관련된 대표 테마 |
| `tags` | 세부 추천 태그 |
| `address` | 실제 주소 또는 간단 위치 설명 |
| `description` | 장소 설명 |
| `visitTime` | 평균 체류 시간, 분 단위 |
| `recommendedTimes` | 추천 방문 시간대 |
| `nearbyBusStopId` | 가까운 버스 정류장 ID |
| `mapPosition` | 모의지도 위 좌표 |
| `priority` | 기본 우선순위, 선택 값 |

### 5.2 장소 연결 타입

파일 위치:

```text
src/types/route.ts
```

```ts
export interface Edge {
  from: string;
  to: string;
  distance: number;
}
```

장소 연결 데이터는 Dijkstra 알고리즘에서 사용됩니다.

```text
장소 = 노드
장소와 장소 사이의 연결 = 간선
거리 = 가중치
```

예시:

```ts
export const edges: Edge[] = [
  { from: "place_001", to: "place_002", distance: 450 },
  { from: "place_002", to: "place_003", distance: 700 },
  { from: "place_001", to: "place_004", distance: 900 }
];
```

거리 단위는 meter로 통일합니다.

### 5.3 버스 타입

파일 위치:

```text
src/types/bus.ts
```

```ts
export interface BusSchedule {
  busNumber: "110" | "210";
  from: string;
  to: string;
  departureTimes: string[];
  rideTime: number;
}

export interface SelectedBus {
  busNumber: "110" | "210";
  from: string;
  to: string;
  departureTime: string;
  waitTime: number;
  rideTime: number;
  arrivalTime: string;
}
```

버스는 경국대와 안동 시내를 오가는 구간에서만 사용합니다.

```text
경국대 → 안동 시내
안동 시내 → 경국대
```

안동 시내 내부 이동은 도보 이동으로 처리합니다.

### 5.4 사용자 입력 타입

파일 위치:

```text
src/types/userInput.ts
```

```ts
export interface UserRouteInput {
  startTime: string;
  totalAvailableTime: number;
  themes: string[];
  mealRequired: boolean;
  preferredCategories: string[];
  maxPlaceCount: number;
}
```

입력값 예시:

```ts
const userInput: UserRouteInput = {
  startTime: "09:30",
  totalAvailableTime: 360,
  themes: ["힐링", "사진"],
  mealRequired: true,
  preferredCategories: ["tour", "cafe", "food"],
  maxPlaceCount: 5
};
```

### 5.5 최종 루트 타입

파일 위치:

```text
src/types/route.ts
```

```ts
import { Place } from "./place";
import { SelectedBus } from "./bus";

export interface ScoredPlace extends Place {
  score: number;
  reasons: string[];
}

export interface RoutePath {
  from: string;
  to: string;
  path: string[];
  distance: number;
  walkTime: number;
}

export interface TimeSummary {
  totalTime: number;
  walkingTime: number;
  stayTime: number;
  busTime: number;
  busWaitTime: number;
}

export interface FinalRoute {
  routeTitle: string;
  summary: string;
  startBus: SelectedBus | null;
  returnBus: SelectedBus | null;
  places: ScoredPlace[];
  paths: RoutePath[];
  timeSummary: TimeSummary;
  warnings: string[];
}
```

최종적으로 `routeMaker.ts`는 `FinalRoute` 형태의 데이터를 반환해야 합니다.

---

## 6. 데이터 구조

알고리즘이 제대로 작동하려면 데이터 형식이 일정해야 합니다. 데이터 담당자가 작성하는 데이터는 알고리즘에서 바로 사용할 수 있어야 합니다.

### 6.1 장소 데이터 예시

파일 위치:

```text
src/data/places.ts
```

```ts
import { Place } from "../types/place";

export const places: Place[] = [
  {
    id: "place_001",
    name: "월영교",
    category: "tour",
    themes: ["힐링", "사진", "산책"],
    tags: ["야경", "경치", "산책", "사진"],
    address: "경상북도 안동시 상아동",
    description: "산책과 사진 촬영에 적합한 안동 대표 관광지입니다.",
    visitTime: 40,
    recommendedTimes: ["afternoon", "evening"],
    nearbyBusStopId: "stop_001",
    mapPosition: {
      x: 320,
      y: 210
    },
    priority: 5
  },
  {
    id: "place_002",
    name: "안동찜닭골목",
    category: "food",
    themes: ["맛집", "전통", "로컬"],
    tags: ["식사", "찜닭", "대표음식"],
    address: "경상북도 안동시 서부동",
    description: "안동 대표 음식인 찜닭을 먹을 수 있는 음식 거리입니다.",
    visitTime: 60,
    recommendedTimes: ["lunch", "evening"],
    nearbyBusStopId: "stop_002",
    mapPosition: {
      x: 410,
      y: 260
    },
    priority: 5
  }
];
```

### 6.2 장소 연결 데이터 예시

파일 위치:

```text
src/data/edges.ts
```

```ts
import { Edge } from "../types/route";

export const edges: Edge[] = [
  { from: "place_001", to: "place_002", distance: 900 },
  { from: "place_002", to: "place_003", distance: 600 },
  { from: "place_003", to: "place_004", distance: 450 },
  { from: "place_001", to: "place_004", distance: 1200 }
];
```

장소 연결은 양방향으로 사용할 가능성이 높습니다. 데이터에 한 방향만 적었다면 알고리즘에서 양방향 그래프로 변환해주는 것이 좋습니다.

예시:

```text
place_001 → place_002, 900m
place_002 → place_001, 900m
```

### 6.3 버스 시간표 데이터 예시

파일 위치:

```text
src/data/busTimes.ts
```

```ts
import { BusSchedule } from "../types/bus";

export const busTimes: BusSchedule[] = [
  {
    busNumber: "110",
    from: "gyeongguk_univ",
    to: "andong_downtown",
    departureTimes: ["09:00", "09:30", "10:00", "10:30", "11:00"],
    rideTime: 25
  },
  {
    busNumber: "210",
    from: "gyeongguk_univ",
    to: "andong_downtown",
    departureTimes: ["09:15", "09:45", "10:15", "10:45", "11:15"],
    rideTime: 30
  },
  {
    busNumber: "110",
    from: "andong_downtown",
    to: "gyeongguk_univ",
    departureTimes: ["14:00", "14:30", "15:00", "15:30", "16:00"],
    rideTime: 25
  },
  {
    busNumber: "210",
    from: "andong_downtown",
    to: "gyeongguk_univ",
    departureTimes: ["14:15", "14:45", "15:15", "15:45", "16:15"],
    rideTime: 30
  }
];
```

---

## 7. 유틸 함수

알고리즘 파일 안에 시간 계산, 거리 계산 코드를 계속 반복하면 코드가 지저분해집니다. 공통 계산은 `utils` 폴더로 분리합니다.

### 7.1 시간 유틸

파일 위치:

```text
src/utils/timeUtils.ts
```

```ts
export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function minutesToTime(totalMinutes: number): string {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function addMinutes(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

export function diffMinutes(from: string, to: string): number {
  return timeToMinutes(to) - timeToMinutes(from);
}

export function isAfterOrSame(target: string, base: string): boolean {
  return timeToMinutes(target) >= timeToMinutes(base);
}
```

사용 예시:

```ts
addMinutes("09:30", 25); // "09:55"
diffMinutes("09:30", "09:45"); // 15
```

### 7.2 거리 유틸

파일 위치:

```text
src/utils/distanceUtils.ts
```

```ts
import { MapPosition } from "../types/place";

export function calculateMapDistance(a: MapPosition, b: MapPosition): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateDistanceScore(distance: number): number {
  if (distance <= 300) return 100;
  if (distance <= 600) return 85;
  if (distance <= 1000) return 70;
  if (distance <= 1500) return 50;
  return 30;
}
```

거리 단위는 구현 방식에 따라 달라질 수 있습니다.

- `edges.ts`의 distance는 meter 기준
- `mapPosition.x`, `mapPosition.y`는 모의지도 좌표 기준

가능하면 실제 이동 계산에는 `edges.distance`를 사용하고, UI 표시에는 `mapPosition`을 사용하는 것이 좋습니다.

---

## 8. 장소 필터링

파일 위치:

```text
src/algorithms/filterPlaces.ts
```

### 8.1 역할

장소 필터링은 추천 후보가 될 수 없는 장소를 제거하는 단계입니다.

이 단계에서는 너무 엄격하게 필터링하면 추천 결과가 부족해질 수 있습니다. 따라서 필터링은 최소 조건만 확인하고, 세부적인 우선순위는 추천 점수 계산에서 처리하는 것이 좋습니다.

### 8.2 필터링 기준

필수 필터링 기준:

- `id`가 있는가?
- `name`이 있는가?
- `category`가 있는가?
- `visitTime`이 있는가?
- `mapPosition`이 있는가?
- 사용자의 전체 가능 시간보다 체류 시간이 너무 길지 않은가?

선택 필터링 기준:

- 사용자 선호 카테고리에 포함되는가?
- 사용자 테마와 조금이라도 관련이 있는가?

### 8.3 구현 예시

```ts
import { Place } from "../types/place";
import { UserRouteInput } from "../types/userInput";

export function filterPlaces(
  places: Place[],
  userInput: UserRouteInput
): Place[] {
  return places.filter((place) => {
    const hasRequiredData =
      Boolean(place.id) &&
      Boolean(place.name) &&
      Boolean(place.category) &&
      Boolean(place.visitTime) &&
      Boolean(place.mapPosition);

    if (!hasRequiredData) return false;

    const timePossible = place.visitTime <= userInput.totalAvailableTime;
    if (!timePossible) return false;

    const categoryMatched =
      userInput.preferredCategories.length === 0 ||
      userInput.preferredCategories.includes(place.category);

    const themeMatched =
      userInput.themes.length === 0 ||
      place.themes.some((theme) => userInput.themes.includes(theme)) ||
      place.tags.some((tag) => userInput.themes.includes(tag));

    return categoryMatched || themeMatched;
  });
}
```

### 8.4 필터링 주의점

필터링 단계에서 `categoryMatched && themeMatched`로 처리하면 조건이 너무 강해질 수 있습니다.

예를 들어 사용자가 `힐링` 테마를 골랐지만 음식점에는 `힐링` 태그가 없을 수 있습니다. 이 경우 음식점이 전부 제외되어 식사 장소가 추천되지 않는 문제가 생길 수 있습니다.

따라서 필터링에서는 `categoryMatched || themeMatched`를 사용하고, 정확한 우선순위는 점수 계산에서 처리하는 것이 안전합니다.

---

## 9. 추천 점수 계산

파일 위치:

```text
src/algorithms/scoreCalculator.ts
```

### 9.1 역할

추천 점수 계산은 후보 장소들 사이의 우선순위를 정하는 단계입니다.

이번 앱은 실제 AI 학습 모델을 사용하지 않으므로 규칙 기반 점수 계산을 사용합니다. 사용자의 입력값과 장소 데이터가 얼마나 잘 맞는지 계산해 점수로 표현합니다.

### 9.2 점수 요소

추천 점수는 다음 요소로 구성합니다.

| 요소 | 설명 | 예시 비중 |
|---|---|---:|
| 테마 점수 | 사용자 테마와 장소 테마/태그 일치도 | 35% |
| 카테고리 점수 | 선호 카테고리와 장소 카테고리 일치 여부 | 20% |
| 거리 점수 | 현재 위치에서 가까운 정도 | 20% |
| 시간 점수 | 남은 시간 안에 방문 가능한 정도 | 15% |
| 식사 보정 점수 | 식사 필요 시 음식점 우선 반영 | 10% |

기본 공식:

```text
추천점수 = 테마점수 × 0.35
        + 카테고리점수 × 0.20
        + 거리점수 × 0.20
        + 시간점수 × 0.15
        + 식사보정점수 × 0.10
```

### 9.3 테마 점수 계산

```ts
function getThemeScore(
  placeThemes: string[],
  placeTags: string[],
  userThemes: string[]
): number {
  if (userThemes.length === 0) return 70;

  const matchedThemes = placeThemes.filter((theme) => userThemes.includes(theme));
  const matchedTags = placeTags.filter((tag) => userThemes.includes(tag));

  const matchCount = matchedThemes.length + matchedTags.length;

  if (matchCount >= 3) return 100;
  if (matchCount === 2) return 85;
  if (matchCount === 1) return 70;
  return 40;
}
```

### 9.4 카테고리 점수 계산

```ts
function getCategoryScore(
  placeCategory: string,
  preferredCategories: string[]
): number {
  if (preferredCategories.length === 0) return 70;
  return preferredCategories.includes(placeCategory) ? 100 : 50;
}
```

### 9.5 시간 점수 계산

```ts
function getTimeScore(visitTime: number, remainingTime: number): number {
  if (visitTime <= remainingTime * 0.4) return 100;
  if (visitTime <= remainingTime * 0.6) return 80;
  if (visitTime <= remainingTime) return 60;
  return 0;
}
```

### 9.6 식사 보정 점수 계산

```ts
function getMealScore(placeCategory: string, mealRequired: boolean): number {
  if (!mealRequired) return 70;
  return placeCategory === "food" ? 100 : 50;
}
```

### 9.7 추천 점수 전체 구현 예시

```ts
import { Place, MapPosition } from "../types/place";
import { UserRouteInput } from "../types/userInput";
import { ScoredPlace } from "../types/route";
import {
  calculateMapDistance,
  calculateDistanceScore
} from "../utils/distanceUtils";

export function calculatePlaceScore(
  place: Place,
  userInput: UserRouteInput,
  currentPosition: MapPosition,
  remainingTime: number
): ScoredPlace {
  const distance = calculateMapDistance(place.mapPosition, currentPosition);

  const themeScore = getThemeScore(place.themes, place.tags, userInput.themes);
  const categoryScore = getCategoryScore(place.category, userInput.preferredCategories);
  const distanceScore = calculateDistanceScore(distance);
  const timeScore = getTimeScore(place.visitTime, remainingTime);
  const mealScore = getMealScore(place.category, userInput.mealRequired);

  const score =
    themeScore * 0.35 +
    categoryScore * 0.2 +
    distanceScore * 0.2 +
    timeScore * 0.15 +
    mealScore * 0.1;

  const reasons = makeRecommendReasons({
    place,
    userInput,
    themeScore,
    categoryScore,
    distanceScore,
    timeScore,
    mealScore
  });

  return {
    ...place,
    score: Math.round(score),
    reasons
  };
}
```

### 9.8 추천 이유 생성

추천 이유는 결과 화면에서 사용자에게 보여줄 수 있습니다.

```ts
function makeRecommendReasons(params: {
  place: Place;
  userInput: UserRouteInput;
  themeScore: number;
  categoryScore: number;
  distanceScore: number;
  timeScore: number;
  mealScore: number;
}): string[] {
  const reasons: string[] = [];
  const { place, userInput, themeScore, categoryScore, distanceScore, mealScore } = params;

  if (themeScore >= 70) {
    reasons.push("선택한 여행 테마와 잘 맞습니다.");
  }

  if (categoryScore >= 100) {
    reasons.push("선호한 장소 카테고리에 포함됩니다.");
  }

  if (distanceScore >= 85) {
    reasons.push("현재 위치에서 비교적 가까운 장소입니다.");
  }

  if (userInput.mealRequired && place.category === "food" && mealScore >= 100) {
    reasons.push("식사 장소로 포함하기 적합합니다.");
  }

  if (place.priority && place.priority >= 5) {
    reasons.push("기본 추천 우선순위가 높은 장소입니다.");
  }

  return reasons.slice(0, 3);
}
```

추천 이유는 너무 길면 UI에서 보기 어렵기 때문에 2~3개 정도만 보여주는 것이 좋습니다.

---

## 10. Greedy 방문 순서 결정

파일 위치:

```text
src/algorithms/greedyRoute.ts
```

### 10.1 역할

Greedy 알고리즘은 현재 위치에서 가장 적절한 다음 장소를 하나씩 선택하는 방식입니다.

이 앱에서는 완전한 최적 경로보다 구현 가능성과 앱 동작의 안정성을 우선합니다. 따라서 복잡한 전체 최적화 대신 Greedy 방식으로 방문 순서를 결정합니다.

### 10.2 선택 기준

다음 장소를 고를 때 고려할 기준은 다음과 같습니다.

- 추천 점수가 높은가?
- 현재 위치에서 너무 멀지 않은가?
- 남은 시간 안에 방문 가능한가?
- 이미 방문한 장소가 아닌가?
- 식사가 필요한 경우 음식점이 포함되는가?
- 같은 카테고리만 계속 반복되지 않는가?

### 10.3 기본 흐름

```text
1. 현재 위치를 안동 시내 시작 지점으로 설정한다.
2. 후보 장소들에 점수를 부여한다.
3. 남은 시간 안에 갈 수 있는 장소만 남긴다.
4. 가장 점수가 높은 장소를 선택한다.
5. 선택한 장소를 route 배열에 추가한다.
6. 현재 위치를 선택한 장소 위치로 바꾼다.
7. 남은 시간을 줄인다.
8. 선택한 장소를 후보에서 제거한다.
9. 최대 방문 장소 수에 도달하거나 후보가 없으면 종료한다.
```

### 10.4 구현 예시

```ts
import { Place, MapPosition } from "../types/place";
import { UserRouteInput } from "../types/userInput";
import { ScoredPlace } from "../types/route";
import { calculatePlaceScore } from "./scoreCalculator";
import { calculateMapDistance } from "../utils/distanceUtils";
import { calculateWalkTimeFromDistance } from "./walkTimeCalculator";

export function makeGreedyRoute(
  candidatePlaces: Place[],
  userInput: UserRouteInput,
  startPosition: MapPosition
): ScoredPlace[] {
  const route: ScoredPlace[] = [];
  let currentPosition = startPosition;
  let remainingTime = userInput.totalAvailableTime;
  let unvisited = [...candidatePlaces];

  while (unvisited.length > 0 && route.length < userInput.maxPlaceCount) {
    const scoredPlaces = unvisited.map((place) => {
      const scoredPlace = calculatePlaceScore(
        place,
        userInput,
        currentPosition,
        remainingTime
      );

      const distance = calculateMapDistance(currentPosition, place.mapPosition);
      const walkTime = calculateWalkTimeFromDistance(distance);
      const requiredTime = walkTime + place.visitTime;

      return {
        ...scoredPlace,
        walkTime,
        requiredTime
      };
    });

    const possiblePlaces = scoredPlaces.filter((place) => {
      return place.requiredTime <= remainingTime;
    });

    if (possiblePlaces.length === 0) break;

    possiblePlaces.sort((a, b) => b.score - a.score);

    const nextPlace = possiblePlaces[0];

    route.push(nextPlace);
    remainingTime -= nextPlace.requiredTime;
    currentPosition = nextPlace.mapPosition;
    unvisited = unvisited.filter((place) => place.id !== nextPlace.id);
  }

  return route;
}
```

위 코드는 기본 구조를 보여주는 예시입니다. 실제 구현에서는 `walkTime`과 `requiredTime`을 타입에 포함할지, 내부 계산용으로만 사용할지 정해야 합니다.

### 10.5 Greedy 보정 로직

단순히 점수가 높은 장소만 선택하면 경로가 비효율적일 수 있습니다. 그래서 선택 점수에 보정값을 넣을 수 있습니다.

```text
최종 선택 점수 = 추천 점수 - 거리 패널티 + 다양성 보정 + 식사 보정
```

거리 패널티:

```ts
function getDistancePenalty(distance: number): number {
  if (distance <= 300) return 0;
  if (distance <= 700) return 5;
  if (distance <= 1200) return 10;
  return 20;
}
```

카테고리 반복 방지:

```ts
function getDiversityBonus(route: ScoredPlace[], nextPlace: Place): number {
  const lastPlace = route[route.length - 1];

  if (!lastPlace) return 0;
  if (lastPlace.category === nextPlace.category) return -10;

  return 5;
}
```

식사 장소 포함 보정:

```ts
function getMealRouteBonus(
  route: ScoredPlace[],
  nextPlace: Place,
  mealRequired: boolean
): number {
  if (!mealRequired) return 0;

  const alreadyHasFood = route.some((place) => place.category === "food");

  if (!alreadyHasFood && nextPlace.category === "food") return 15;
  return 0;
}
```

---

## 11. Dijkstra 최단 경로 계산

파일 위치:

```text
src/algorithms/dijkstra.ts
```

### 11.1 역할

Greedy 알고리즘이 방문할 장소의 순서를 정하면, Dijkstra 알고리즘은 그 장소들 사이의 최단 이동 경로를 계산합니다.

예시:

```text
방문 순서:
월영교 → 안동찜닭골목 → 카페 → 문화거리
```

Dijkstra가 계산하는 구간:

```text
월영교 → 안동찜닭골목
안동찜닭골목 → 카페
카페 → 문화거리
```

### 11.2 그래프 변환

`edges.ts`는 배열 형태이지만 Dijkstra에서는 그래프 형태가 더 편합니다.

```ts
import { Edge } from "../types/route";

export type Graph = Record<string, { to: string; distance: number }[]>;

export function buildGraph(edges: Edge[]): Graph {
  const graph: Graph = {};

  for (const edge of edges) {
    if (!graph[edge.from]) graph[edge.from] = [];
    if (!graph[edge.to]) graph[edge.to] = [];

    graph[edge.from].push({ to: edge.to, distance: edge.distance });
    graph[edge.to].push({ to: edge.from, distance: edge.distance });
  }

  return graph;
}
```

이렇게 하면 장소 연결을 양방향으로 사용할 수 있습니다.

### 11.3 Dijkstra 구현 예시

```ts
export interface DijkstraResult {
  path: string[];
  distance: number;
}

export function dijkstra(
  graph: Graph,
  startId: string,
  endId: string
): DijkstraResult | null {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>(Object.keys(graph));

  for (const node of unvisited) {
    distances[node] = Infinity;
    previous[node] = null;
  }

  distances[startId] = 0;

  while (unvisited.size > 0) {
    let current: string | null = null;

    for (const node of unvisited) {
      if (current === null || distances[node] < distances[current]) {
        current = node;
      }
    }

    if (current === null) break;
    if (distances[current] === Infinity) break;
    if (current === endId) break;

    unvisited.delete(current);

    const neighbors = graph[current] || [];

    for (const neighbor of neighbors) {
      const newDistance = distances[current] + neighbor.distance;

      if (newDistance < distances[neighbor.to]) {
        distances[neighbor.to] = newDistance;
        previous[neighbor.to] = current;
      }
    }
  }

  if (distances[endId] === Infinity) {
    return null;
  }

  const path: string[] = [];
  let current: string | null = endId;

  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  return {
    path,
    distance: distances[endId]
  };
}
```

### 11.4 방문 순서 전체에 Dijkstra 적용

파일 위치:

```text
src/algorithms/createDetailedPaths.ts
```

```ts
import { ScoredPlace, RoutePath, Edge } from "../types/route";
import { buildGraph, dijkstra } from "./dijkstra";
import { calculateWalkTimeFromDistance } from "./walkTimeCalculator";

export function createDetailedPaths(
  route: ScoredPlace[],
  edges: Edge[]
): RoutePath[] {
  const graph = buildGraph(edges);
  const paths: RoutePath[] = [];

  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i].id;
    const to = route[i + 1].id;

    const result = dijkstra(graph, from, to);

    if (!result) {
      continue;
    }

    paths.push({
      from,
      to,
      path: result.path,
      distance: result.distance,
      walkTime: calculateWalkTimeFromDistance(result.distance)
    });
  }

  return paths;
}
```

### 11.5 연결이 끊긴 경우 처리

Dijkstra 결과가 `null`이면 두 장소 사이의 연결이 없다는 뜻입니다.

처리 방식은 다음 중 하나를 선택합니다.

1. 해당 경로를 제외한다.
2. 해당 장소를 루트에서 제거하고 다시 경로를 계산한다.
3. 모의지도 좌표 기반 직선 거리로 임시 연결한다.

추천 방식은 2번입니다. 다만 개발 시간이 부족하면 1번 또는 3번을 사용해도 됩니다.

---

## 12. 도보 시간 계산

파일 위치:

```text
src/algorithms/walkTimeCalculator.ts
```

도보 시간은 거리 기반으로 계산합니다.

기본 기준:

```text
도보 속도 = 75m/min
도보 시간 = 거리 / 75
```

구현 예시:

```ts
const WALK_SPEED_METER_PER_MINUTE = 75;

export function calculateWalkTimeFromDistance(distance: number): number {
  return Math.ceil(distance / WALK_SPEED_METER_PER_MINUTE);
}
```

예시:

```text
거리 750m → 10분
거리 900m → 12분
거리 1200m → 16분
```

모의지도 좌표를 거리처럼 사용하는 경우에는 보정값이 필요할 수 있습니다.

```ts
const MAP_DISTANCE_SCALE = 5;

export function calculateWalkTimeFromMapDistance(mapDistance: number): number {
  const estimatedMeter = mapDistance * MAP_DISTANCE_SCALE;
  return Math.ceil(estimatedMeter / WALK_SPEED_METER_PER_MINUTE);
}
```

가능하면 실제 이동 시간 계산은 `edges.distance`를 기준으로 하고, 모의지도 좌표는 화면 표시용으로만 쓰는 것이 좋습니다.

---

## 13. 버스 시간 계산

파일 위치:

```text
src/algorithms/busTimeCalculator.ts
```

### 13.1 역할

버스 시간 계산은 사용자의 출발 시간 이후에 탈 수 있는 가장 가까운 버스를 선택하는 기능입니다.

버스는 다음 두 구간에서만 사용합니다.

```text
경국대 → 안동 시내
안동 시내 → 경국대
```

안동 시내 내부 이동은 도보로 처리합니다.

### 13.2 버스 선택 기준

예시:

```text
사용자 출발 시간: 09:30
110번: 09:20, 09:50, 10:20
210번: 09:40, 10:10

선택 결과:
210번 09:40
대기 시간 10분
```

선택 기준:

```text
현재 시간 이후에 출발하는 버스 중 대기 시간이 가장 짧은 버스
```

### 13.3 구현 예시

```ts
import { BusSchedule, SelectedBus } from "../types/bus";
import { addMinutes, diffMinutes, isAfterOrSame } from "../utils/timeUtils";

export function findNextBus(
  busSchedules: BusSchedule[],
  currentTime: string,
  from: string,
  to: string
): SelectedBus | null {
  const possibleBuses: SelectedBus[] = [];

  for (const bus of busSchedules) {
    if (bus.from !== from || bus.to !== to) continue;

    for (const departureTime of bus.departureTimes) {
      if (isAfterOrSame(departureTime, currentTime)) {
        const waitTime = diffMinutes(currentTime, departureTime);
        const arrivalTime = addMinutes(departureTime, bus.rideTime);

        possibleBuses.push({
          busNumber: bus.busNumber,
          from,
          to,
          departureTime,
          waitTime,
          rideTime: bus.rideTime,
          arrivalTime
        });
      }
    }
  }

  possibleBuses.sort((a, b) => a.waitTime - b.waitTime);

  return possibleBuses[0] || null;
}
```

### 13.4 버스가 없는 경우

현재 시간 이후에 버스가 없다면 `null`을 반환합니다.

이 경우 최종 route object의 `warnings`에 메시지를 넣습니다.

```ts
warnings.push("해당 시간 이후 이용 가능한 버스가 없습니다.");
```

앱에서는 다음처럼 처리할 수 있습니다.

- 루트 생성 실패 화면 표시
- 출발 시간을 앞당겨 달라는 안내 표시
- 버스 정보 없이 장소 추천만 보여주기

이번 프로젝트에서는 버스 시간표 데이터를 충분히 넣어 이 상황이 자주 발생하지 않게 하는 것이 좋습니다.

---

## 14. 전체 시간 계산

파일 위치:

```text
src/algorithms/routeTimeCalculator.ts
```

### 14.1 계산 요소

전체 시간은 다음 요소의 합입니다.

```text
전체 시간 = 출발 버스 대기 시간
        + 출발 버스 이동 시간
        + 장소 간 도보 이동 시간
        + 장소별 체류 시간
        + 복귀 버스 대기 시간
        + 복귀 버스 이동 시간
```

### 14.2 구현 예시

```ts
import { SelectedBus } from "../types/bus";
import { RoutePath, ScoredPlace, TimeSummary } from "../types/route";

export function calculateRouteTime(
  startBus: SelectedBus | null,
  returnBus: SelectedBus | null,
  places: ScoredPlace[],
  paths: RoutePath[]
): TimeSummary {
  const busWaitTime =
    (startBus?.waitTime || 0) +
    (returnBus?.waitTime || 0);

  const busTime =
    (startBus?.rideTime || 0) +
    (returnBus?.rideTime || 0);

  const walkingTime = paths.reduce((sum, path) => sum + path.walkTime, 0);

  const stayTime = places.reduce((sum, place) => sum + place.visitTime, 0);

  const totalTime = busWaitTime + busTime + walkingTime + stayTime;

  return {
    totalTime,
    walkingTime,
    stayTime,
    busTime,
    busWaitTime
  };
}
```

### 14.3 시간 초과 처리

사용자가 입력한 전체 가능 시간을 넘으면 루트를 조정해야 합니다.

기본 방식:

```text
전체 시간이 초과됨
  ↓
가장 점수가 낮은 장소 제거
  ↓
경로 다시 계산
  ↓
시간 다시 계산
  ↓
시간 안에 들어올 때까지 반복
```

구현 예시:

```ts
export function trimRouteByTime(
  places: ScoredPlace[],
  totalAvailableTime: number,
  calculateTime: (places: ScoredPlace[]) => number
): ScoredPlace[] {
  let result = [...places];

  while (result.length > 1) {
    const totalTime = calculateTime(result);

    if (totalTime <= totalAvailableTime) {
      return result;
    }

    result.sort((a, b) => a.score - b.score);
    result.shift();

    result.sort((a, b) => b.score - a.score);
  }

  return result;
}
```

주의할 점은 단순히 점수가 낮은 장소를 제거하면 경로 순서가 꼬일 수 있다는 것입니다. 장소를 제거한 뒤에는 Dijkstra 경로와 전체 시간을 다시 계산해야 합니다.

---

## 15. 최종 루트 생성

파일 위치:

```text
src/algorithms/routeMaker.ts
```

### 15.1 역할

`routeMaker.ts`는 알고리즘 전체 흐름을 하나로 연결하는 핵심 파일입니다.

UI 담당자는 보통 이 함수 하나만 호출하면 됩니다.

```ts
const route = createRoute(userInput);
```

### 15.2 기본 구조

```ts
import { places } from "../data/places";
import { edges } from "../data/edges";
import { busTimes } from "../data/busTimes";
import { UserRouteInput } from "../types/userInput";
import { FinalRoute } from "../types/route";
import { filterPlaces } from "./filterPlaces";
import { makeGreedyRoute } from "./greedyRoute";
import { createDetailedPaths } from "./createDetailedPaths";
import { findNextBus } from "./busTimeCalculator";
import { calculateRouteTime } from "./routeTimeCalculator";

const DOWNTOWN_START_POSITION = {
  x: 300,
  y: 250
};

export function createRoute(userInput: UserRouteInput): FinalRoute {
  const warnings: string[] = [];

  const startBus = findNextBus(
    busTimes,
    userInput.startTime,
    "gyeongguk_univ",
    "andong_downtown"
  );

  if (!startBus) {
    warnings.push("출발 시간 이후 이용 가능한 시내행 버스가 없습니다.");
  }

  const filteredPlaces = filterPlaces(places, userInput);

  if (filteredPlaces.length === 0) {
    return {
      routeTitle: "추천 가능한 장소가 없습니다",
      summary: "조건에 맞는 장소가 부족합니다.",
      startBus,
      returnBus: null,
      places: [],
      paths: [],
      timeSummary: {
        totalTime: 0,
        walkingTime: 0,
        stayTime: 0,
        busTime: startBus?.rideTime || 0,
        busWaitTime: startBus?.waitTime || 0
      },
      warnings: ["조건에 맞는 장소가 없습니다."]
    };
  }

  const visitOrder = makeGreedyRoute(
    filteredPlaces,
    userInput,
    DOWNTOWN_START_POSITION
  );

  const detailedPaths = createDetailedPaths(visitOrder, edges);

  const estimatedEndTime = calculateEstimatedEndTime(
    userInput.startTime,
    startBus,
    visitOrder,
    detailedPaths
  );

  const returnBus = findNextBus(
    busTimes,
    estimatedEndTime,
    "andong_downtown",
    "gyeongguk_univ"
  );

  if (!returnBus) {
    warnings.push("복귀 시간 이후 이용 가능한 경국대행 버스가 없습니다.");
  }

  const timeSummary = calculateRouteTime(
    startBus,
    returnBus,
    visitOrder,
    detailedPaths
  );

  return {
    routeTitle: makeRouteTitle(userInput),
    summary: makeRouteSummary(visitOrder),
    startBus,
    returnBus,
    places: visitOrder,
    paths: detailedPaths,
    timeSummary,
    warnings
  };
}
```

### 15.3 예상 종료 시간 계산

복귀 버스를 찾으려면 시내 루트가 끝나는 예상 시간이 필요합니다.

```ts
import { SelectedBus } from "../types/bus";
import { RoutePath, ScoredPlace } from "../types/route";
import { addMinutes } from "../utils/timeUtils";

function calculateEstimatedEndTime(
  startTime: string,
  startBus: SelectedBus | null,
  places: ScoredPlace[],
  paths: RoutePath[]
): string {
  let currentTime = startTime;

  if (startBus) {
    currentTime = addMinutes(currentTime, startBus.waitTime + startBus.rideTime);
  }

  for (let i = 0; i < places.length; i++) {
    const path = paths[i - 1];

    if (path) {
      currentTime = addMinutes(currentTime, path.walkTime);
    }

    currentTime = addMinutes(currentTime, places[i].visitTime);
  }

  return currentTime;
}
```

### 15.4 루트 제목 생성

```ts
function makeRouteTitle(userInput: UserRouteInput): string {
  if (userInput.themes.length > 0) {
    return `${userInput.themes.join(" · ")} 여행 루트`;
  }

  return "안동 추천 여행 루트";
}
```

### 15.5 루트 요약 생성

```ts
function makeRouteSummary(places: ScoredPlace[]): string {
  if (places.length === 0) {
    return "추천된 장소가 없습니다.";
  }

  const placeNames = places.map((place) => place.name).join(" → ");

  return `${placeNames} 순서로 이동하는 추천 루트입니다.`;
}
```

---

## 16. 최종 반환 데이터 예시

`createRoute()`가 반환해야 하는 데이터 예시는 다음과 같습니다.

```json
{
  "routeTitle": "힐링 · 사진 여행 루트",
  "summary": "월영교 → 안동찜닭골목 → 카페 순서로 이동하는 추천 루트입니다.",
  "startBus": {
    "busNumber": "210",
    "from": "gyeongguk_univ",
    "to": "andong_downtown",
    "departureTime": "09:40",
    "waitTime": 10,
    "rideTime": 30,
    "arrivalTime": "10:10"
  },
  "returnBus": {
    "busNumber": "110",
    "from": "andong_downtown",
    "to": "gyeongguk_univ",
    "departureTime": "14:30",
    "waitTime": 8,
    "rideTime": 25,
    "arrivalTime": "14:55"
  },
  "places": [
    {
      "id": "place_001",
      "name": "월영교",
      "category": "tour",
      "themes": ["힐링", "사진", "산책"],
      "tags": ["야경", "경치", "산책", "사진"],
      "description": "산책과 사진 촬영에 적합한 안동 대표 관광지입니다.",
      "visitTime": 40,
      "recommendedTimes": ["afternoon", "evening"],
      "nearbyBusStopId": "stop_001",
      "mapPosition": {
        "x": 320,
        "y": 210
      },
      "score": 87,
      "reasons": [
        "선택한 여행 테마와 잘 맞습니다.",
        "현재 위치에서 비교적 가까운 장소입니다."
      ]
    }
  ],
  "paths": [
    {
      "from": "place_001",
      "to": "place_002",
      "path": ["place_001", "place_004", "place_002"],
      "distance": 900,
      "walkTime": 12
    }
  ],
  "timeSummary": {
    "totalTime": 285,
    "walkingTime": 55,
    "stayTime": 160,
    "busTime": 55,
    "busWaitTime": 18
  },
  "warnings": []
}
```

UI 담당자는 이 데이터로 다음을 표시할 수 있습니다.

- 추천 루트 제목
- 추천 루트 요약
- 탑승 버스 정보
- 복귀 버스 정보
- 장소 카드 목록
- 장소별 추천 이유
- 모의지도 위 장소 점
- 모의지도 위 경로 선
- 전체 예상 소요 시간

---

## 17. UI와 연결하는 방식

알고리즘은 화면을 직접 그리지 않습니다. 알고리즘은 데이터만 반환하고, UI는 그 데이터를 받아 화면에 표시합니다.

### 17.1 입력 화면에서 호출

예시 파일:

```text
src/screens/InputScreen.tsx
```

```tsx
import { createRoute } from "../algorithms/routeMaker";

function handleCreateRoute() {
  const userInput = {
    startTime: "09:30",
    totalAvailableTime: 360,
    themes: selectedThemes,
    mealRequired,
    preferredCategories: selectedCategories,
    maxPlaceCount: 5
  };

  const route = createRoute(userInput);

  navigation.navigate("RouteResult", {
    route
  });
}
```

### 17.2 결과 화면에서 표시

예시 파일:

```text
src/screens/RouteResultScreen.tsx
```

```tsx
function RouteResultScreen({ route }) {
  return (
    <View>
      <Text>{route.routeTitle}</Text>
      <Text>{route.summary}</Text>

      <Text>전체 예상 시간: {route.timeSummary.totalTime}분</Text>

      {route.places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </View>
  );
}
```

### 17.3 모의지도에서 경로 표시

모의지도는 실제 지도 API를 사용하지 않고, 이미지 위에 좌표를 찍는 방식으로 구현합니다.

알고리즘에서 필요한 데이터:

```text
place.mapPosition.x
place.mapPosition.y
paths[].path
```

`paths[].path`에는 장소 ID 배열이 들어있습니다. UI에서는 이 ID를 `places` 데이터와 매칭해서 좌표를 찾은 뒤 선을 그립니다.

예시:

```ts
function getPathPositions(pathIds: string[], allPlaces: Place[]) {
  return pathIds
    .map((id) => allPlaces.find((place) => place.id === id))
    .filter(Boolean)
    .map((place) => place!.mapPosition);
}
```

---

## 18. 예외 처리

알고리즘은 정상 상황만 가정하면 안 됩니다. 데이터 누락, 후보 부족, 시간 부족, 버스 없음, 경로 없음 같은 상황을 처리해야 합니다.

### 18.1 후보 장소가 없는 경우

상황:

```text
사용자 조건에 맞는 장소가 없음
```

처리:

```ts
return {
  routeTitle: "추천 가능한 장소가 없습니다",
  places: [],
  paths: [],
  warnings: ["조건에 맞는 장소가 부족합니다."]
};
```

추가 개선:

- 테마 조건 완화
- 카테고리 조건 완화
- 기본 추천 장소 사용

### 18.2 시간이 부족한 경우

상황:

```text
추천된 장소를 모두 방문하면 사용자의 가능 시간을 초과함
```

처리:

```text
1. 점수가 낮은 장소 제거
2. 이동 시간이 긴 장소 제거
3. 최대 방문 장소 수 줄이기
4. 다시 시간 계산
```

### 18.3 버스가 없는 경우

상황:

```text
출발 시간 이후 이용 가능한 버스가 없음
```

처리:

```ts
warnings.push("해당 시간 이후 이용 가능한 버스가 없습니다.");
```

앱에서는 경고 메시지를 보여줍니다.

### 18.4 장소 연결이 없는 경우

상황:

```text
Dijkstra 결과가 null
```

처리:

```text
1. 해당 장소 제거
2. 다른 장소로 대체
3. 임시 직선 경로로 표시
```

추천은 1번 또는 2번입니다.

### 18.5 식사 장소가 포함되지 않은 경우

상황:

```text
mealRequired가 true인데 food 카테고리 장소가 없음
```

처리:

```text
1. food 카테고리 장소를 강제로 후보에 추가
2. food 장소에 보정 점수 부여
3. 그래도 없으면 warnings에 추가
```

예시:

```ts
const hasFood = route.some((place) => place.category === "food");

if (userInput.mealRequired && !hasFood) {
  warnings.push("조건에 맞는 식사 장소가 부족해 식사 장소가 포함되지 않았습니다.");
}
```

---

## 19. 데이터 검증

알고리즘 구현 전에 데이터가 올바른지 확인하는 함수가 있으면 좋습니다.

파일 위치:

```text
src/algorithms/routeValidator.ts
```

### 19.1 장소 데이터 검증

```ts
import { Place } from "../types/place";

export function validatePlaces(places: Place[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const place of places) {
    if (!place.id) errors.push("id가 없는 장소가 있습니다.");
    if (!place.name) errors.push(`${place.id}: name이 없습니다.`);
    if (!place.category) errors.push(`${place.id}: category가 없습니다.`);
    if (!place.visitTime) errors.push(`${place.id}: visitTime이 없습니다.`);
    if (!place.mapPosition) errors.push(`${place.id}: mapPosition이 없습니다.`);

    if (ids.has(place.id)) {
      errors.push(`${place.id}: 중복된 장소 ID입니다.`);
    }

    ids.add(place.id);
  }

  return errors;
}
```

### 19.2 경로 데이터 검증

```ts
import { Place } from "../types/place";
import { Edge } from "../types/route";

export function validateEdges(places: Place[], edges: Edge[]): string[] {
  const errors: string[] = [];
  const placeIds = new Set(places.map((place) => place.id));

  for (const edge of edges) {
    if (!placeIds.has(edge.from)) {
      errors.push(`${edge.from}: 존재하지 않는 출발 장소 ID입니다.`);
    }

    if (!placeIds.has(edge.to)) {
      errors.push(`${edge.to}: 존재하지 않는 도착 장소 ID입니다.`);
    }

    if (edge.distance <= 0) {
      errors.push(`${edge.from} → ${edge.to}: distance가 올바르지 않습니다.`);
    }
  }

  return errors;
}
```

이 검증 함수는 개발 중에만 사용해도 충분합니다.

---

## 20. 테스트 시나리오

알고리즘은 기능별로 테스트해야 합니다.

### 20.1 장소 필터링 테스트

입력:

```ts
const userInput = {
  startTime: "09:30",
  totalAvailableTime: 360,
  themes: ["힐링", "사진"],
  mealRequired: false,
  preferredCategories: ["tour", "cafe"],
  maxPlaceCount: 5
};
```

확인할 것:

```text
- tour 또는 cafe 장소가 포함되는가?
- 힐링 또는 사진 테마 장소가 포함되는가?
- 필수 데이터가 없는 장소는 제외되는가?
```

### 20.2 추천 점수 테스트

확인할 것:

```text
- 사용자 테마와 일치하는 장소의 점수가 높은가?
- 음식점은 mealRequired가 true일 때 점수가 올라가는가?
- 너무 먼 장소는 거리 점수가 낮아지는가?
- 추천 이유가 1개 이상 생성되는가?
```

### 20.3 Greedy 테스트

확인할 것:

```text
- 최대 방문 장소 수를 넘지 않는가?
- 이미 방문한 장소가 다시 나오지 않는가?
- 남은 시간을 초과하는 장소가 제외되는가?
- 식사가 필요한 경우 food 장소가 포함되는가?
```

### 20.4 Dijkstra 테스트

예시 그래프:

```text
A --100-- B --100-- C
A --300-- C
```

A에서 C까지 최단 경로는 다음이어야 합니다.

```text
A → B → C
거리 200
```

확인할 것:

```text
- 직접 경로보다 짧은 우회 경로를 찾는가?
- 연결이 없으면 null을 반환하는가?
- path 배열이 올바른 순서로 반환되는가?
```

### 20.5 버스 시간 테스트

입력:

```text
현재 시간: 09:30
110번: 09:20, 09:50
210번: 09:40, 10:10
```

기대 결과:

```text
210번 09:40 선택
대기 시간 10분
```

### 20.6 전체 루트 테스트

입력:

```ts
const userInput = {
  startTime: "09:30",
  totalAvailableTime: 360,
  themes: ["힐링", "사진"],
  mealRequired: true,
  preferredCategories: ["tour", "food", "cafe"],
  maxPlaceCount: 5
};
```

확인할 것:

```text
- 최종 routeTitle이 생성되는가?
- places 배열이 비어 있지 않은가?
- paths 배열이 생성되는가?
- timeSummary.totalTime이 계산되는가?
- startBus와 returnBus가 포함되는가?
- warnings가 필요할 때만 생성되는가?
```

---

## 21. 구현 순서

알고리즘 담당자는 다음 순서로 구현하는 것이 좋습니다.

### 21.1 1단계: 타입과 데이터 확인

먼저 타입과 데이터 구조를 정리합니다.

작업 파일:

```text
src/types/place.ts
src/types/route.ts
src/types/bus.ts
src/types/userInput.ts
src/data/places.ts
src/data/edges.ts
src/data/busTimes.ts
```

목표:

```text
앱에서 사용할 데이터 구조 확정
```

### 21.2 2단계: 유틸 함수 구현

작업 파일:

```text
src/utils/timeUtils.ts
src/utils/distanceUtils.ts
```

목표:

```text
시간 계산과 거리 계산을 공통 함수로 분리
```

### 21.3 3단계: 장소 필터링 구현

작업 파일:

```text
src/algorithms/filterPlaces.ts
```

목표:

```text
사용자 조건에 맞는 후보 장소 추리기
```

### 21.4 4단계: 추천 점수 구현

작업 파일:

```text
src/algorithms/scoreCalculator.ts
```

목표:

```text
장소별 추천 점수와 추천 이유 생성
```

### 21.5 5단계: Greedy 구현

작업 파일:

```text
src/algorithms/greedyRoute.ts
```

목표:

```text
방문 장소 순서 결정
```

### 21.6 6단계: Dijkstra 구현

작업 파일:

```text
src/algorithms/dijkstra.ts
```

목표:

```text
장소 간 최단 경로 계산
```

### 21.7 7단계: 버스와 시간 계산 구현

작업 파일:

```text
src/algorithms/busTimeCalculator.ts
src/algorithms/walkTimeCalculator.ts
src/algorithms/routeTimeCalculator.ts
```

목표:

```text
버스 대기/이동 시간, 도보 시간, 체류 시간 합산
```

### 21.8 8단계: routeMaker 연결

작업 파일:

```text
src/algorithms/routeMaker.ts
```

목표:

```text
UI에서 호출할 최종 createRoute 함수 완성
```

### 21.9 9단계: UI 연결 확인

작업 파일:

```text
src/screens/InputScreen.tsx
src/screens/RouteResultScreen.tsx
src/components/MockMap.tsx
```

목표:

```text
입력값 → 알고리즘 → 결과 화면 → 모의지도 표시 흐름 확인
```

---

## 22. GitHub 작업 규칙

알고리즘 담당자는 다음 규칙을 지키는 것이 좋습니다.

### 22.1 수정 위치

알고리즘 담당자가 주로 수정하는 위치:

```text
src/algorithms/
src/types/
src/utils/
```

데이터가 필요할 때 확인하는 위치:

```text
src/data/
```

문서를 수정할 때 위치:

```text
docs/algorithm-guide.md
```

### 22.2 브랜치 이름 예시

```text
feature/algorithm-filter
feature/algorithm-score
feature/algorithm-greedy
feature/algorithm-dijkstra
feature/algorithm-route-maker
fix/algorithm-time-error
```

### 22.3 커밋 메시지 예시

```text
feat: 장소 필터링 알고리즘 추가
feat: 추천 점수 계산 함수 추가
feat: Greedy 기반 방문 순서 생성 기능 추가
feat: Dijkstra 최단 경로 계산 기능 추가
feat: 버스 시간표 기반 다음 버스 선택 기능 추가
fix: 시간 계산 오류 수정
refactor: 알고리즘 타입 구조 정리
```

### 22.4 Pull Request 내용 예시

```md
## 작업 내용
- 장소 필터링 함수 구현
- 사용자 테마와 카테고리 기준 후보 장소 추출
- 필수 데이터 누락 장소 제외 처리

## 확인한 내용
- 조건에 맞는 장소가 정상적으로 반환됨
- 빈 배열 상황에서 오류가 발생하지 않음

## 관련 파일
- src/algorithms/filterPlaces.ts
- src/types/place.ts
```

---

## 23. 알고리즘 담당자 체크리스트

### 데이터 관련

- [ ] 장소 ID가 중복되지 않는지 확인했다.
- [ ] 모든 장소에 `mapPosition`이 있다.
- [ ] 모든 장소에 `visitTime`이 있다.
- [ ] 모든 장소의 `category`가 정해져 있다.
- [ ] `edges.ts`의 from/to가 실제 장소 ID와 일치한다.
- [ ] 버스 시간표의 시간 형식이 `HH:mm`으로 통일되어 있다.

### 기능 구현 관련

- [ ] `filterPlaces.ts` 구현 완료
- [ ] `scoreCalculator.ts` 구현 완료
- [ ] `greedyRoute.ts` 구현 완료
- [ ] `dijkstra.ts` 구현 완료
- [ ] `busTimeCalculator.ts` 구현 완료
- [ ] `walkTimeCalculator.ts` 구현 완료
- [ ] `routeTimeCalculator.ts` 구현 완료
- [ ] `routeMaker.ts` 구현 완료

### 예외 처리 관련

- [ ] 후보 장소가 없을 때 오류가 발생하지 않는다.
- [ ] 버스가 없을 때 `warnings`가 생성된다.
- [ ] Dijkstra 경로가 없을 때 앱이 멈추지 않는다.
- [ ] 전체 시간이 초과될 때 장소를 줄일 수 있다.
- [ ] 식사 필요 조건인데 음식점이 없을 때 경고를 표시한다.

### UI 연결 관련

- [ ] `createRoute()`가 정상적으로 호출된다.
- [ ] 결과 화면에서 장소 목록이 표시된다.
- [ ] 추천 이유가 표시된다.
- [ ] 전체 시간이 표시된다.
- [ ] 모의지도에서 장소 좌표가 표시된다.
- [ ] 모의지도에서 경로 선을 그릴 수 있는 데이터가 반환된다.

---

## 24. 최소 구현 버전

시간이 부족할 경우에는 다음 기능만 먼저 구현해도 앱의 핵심 흐름은 만들 수 있습니다.

```text
1. places 데이터 준비
2. filterPlaces 구현
3. scoreCalculator 구현
4. 점수 높은 순으로 장소 3~5개 선택
5. 선택된 장소를 순서대로 표시
6. 전체 체류 시간만 계산
```

그 다음 순서로 기능을 추가합니다.

```text
7. Greedy로 방문 순서 개선
8. Dijkstra로 경로 계산 추가
9. 버스 시간 계산 추가
10. 전체 시간 계산 추가
11. 모의지도 경로 표시 연결
```

처음부터 모든 알고리즘을 완벽하게 만들려고 하지 말고, 먼저 결과가 화면에 보이는 최소 버전을 만든 뒤 점진적으로 개선하는 것이 좋습니다.

---

## 25. 최종 개발 목표

알고리즘 파트의 최종 목표는 다음 함수 하나를 안정적으로 완성하는 것입니다.

```ts
createRoute(userInput): FinalRoute
```

이 함수는 다음 일을 모두 처리해야 합니다.

```text
1. 사용자 입력을 받는다.
2. 출발 버스를 계산한다.
3. 장소 후보를 필터링한다.
4. 장소별 추천 점수를 계산한다.
5. Greedy로 방문 순서를 정한다.
6. Dijkstra로 장소 간 최단 경로를 계산한다.
7. 도보 시간, 체류 시간, 버스 시간을 합산한다.
8. 복귀 버스를 계산한다.
9. 예외 상황을 warnings에 담는다.
10. UI에서 바로 사용할 수 있는 FinalRoute 객체를 반환한다.
```

최종적으로 UI 담당자는 알고리즘 내부 구현을 몰라도 됩니다. `createRoute()`만 호출하면 추천 루트 결과를 받을 수 있어야 합니다.

---

## 26. 핵심 요약

알고리즘 파트는 다음 구조로 이해하면 됩니다.

```text
filterPlaces
= 갈 수 있는 장소 후보를 추린다.

scoreCalculator
= 후보 장소에 추천 점수를 매긴다.

greedyRoute
= 점수와 위치를 기준으로 방문 순서를 정한다.

dijkstra
= 장소와 장소 사이의 최단 경로를 찾는다.

busTimeCalculator
= 출발/복귀 버스를 고른다.

routeTimeCalculator
= 전체 시간을 계산한다.

routeMaker
= 위 기능을 모두 연결해 최종 루트를 만든다.
```

가장 중요한 개발 기준은 다음입니다.

```text
알고리즘은 화면을 직접 만들지 않는다.
알고리즘은 UI가 사용할 수 있는 데이터를 반환한다.
```

따라서 알고리즘 담당자는 최종 결과 객체의 구조를 안정적으로 만드는 데 집중해야 합니다.
