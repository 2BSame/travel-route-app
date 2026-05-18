# 알고리즘 사용법
> 알고리즘 파트 담당이 작성함, 알고리즘의 사용 방법 서술.

# types/userInput.ts
> algorithms/routeMaker.ts 에 값을 넘겨주기 위한 Input 값의 집합
```typescript
export interface UserRouteInput {
  startTime: string; // 여행 시작 시간, "HH:MM" 단위
  totalAvailableTime: number; //  여행 총 시간, 분 단위
  themes: number; // 비트마스크(후술)
  categories: number; // 비트마스크
  mealRequired: boolean; // 식사 여부, true면 식사가 최우선 1순위
  maxPlaceCount: number; // 장소 갯수
  startBusStopId: number; // 출발할 정류장 ID, data/busStop을 참조할것.
  endBusStopId: number;   // 최종적으로 돌아올 정류장 ID, 위와 동일.
}
```
해당 Input에서는 types/place.ts 안의 categoryMask와 themeMask 비트마스크를 사용함.

```typescript
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
```
만약 카테고리에서 관광지를 원한다면,
```typescript
categories: categoryMask.TOUR,
```
로 입력, 만약 카테고리에서 관광지와 문화를 원한다면,
```typescript
categories: categoryMask.TOUR | categoryMask.CULTURE,
```
로 입력, 테마 마스크 역시 동일한 방법으로 사용함.

아니면 UI 구현 단계에서 입력값을 받고, 직접 이진수를 계산해서 입력하여도 무관함
```
(예시: 관광지(1(0000 0001)) + 카페(4(0000 0010)) = 관광지 & 카페(5(0000 0011)))
```
다만, 알고리즘 내부에서는 비트마스크로 동작함을 주의해줄것.

# algorithms/routeMaker.ts
> 실제 경로를 리턴하는 부분임, 앞서 선술한 userInput의 UserRouteInput 형태로 입력 받음.

algorithms/TestAlgorithm.ts 를 읽어보면 이해가 쉬울 것임, 
```typescript
const mockUserInput: UserRouteInput = {
  startTime: "10:00", // 오전 10시 출발
  totalAvailableTime: 900,      // 총 15시간(900분)
  themes: themeMask.MOOD | themeMask.FOOD, // 분위기 & 먹거리 테마
  categories: themeMask.FOOD, // 먹거리 카테고리
  mealRequired: true,  // 식사를 우선할 것
  maxPlaceCount: 5, //5개 방문
  startBusStopId: 1,            // 터미널에서 출발
  endBusStopId: 3               // 시내(교보생명)에서 종료
};

// --- 중략 ---

try {
  //메인 알고리즘 실행.
  const result = createRoute(mockUserInput);

  // 3. 결과를 보기 좋게(JSON 포맷) 터미널에 출력
  console.log(JSON.stringify(result, null, 2));
  
} catch (error) {
  console.error("에러 발생:", error);
}
```
algorithms/TestAlgorithm.ts 의 일부분을 발췌함

userInput의 UserRouteInput을 작성해서 createRoute로 입력, 리턴값이 json 형태로 나옴, 아래는 리턴되는 값의 목록.

```json
// 1. 버스 정보 규격
export interface SelectedBus {
  busNumber: string; //버스 번호
  fromBusStopId: number; //출발 정류장, data/busStop 참조
  toBusStopId: number; //도착 정류장, data/busStop 참조
  departureTime: string; // 버스 도착 시간, "HH:MM" 단위
  waitTime: number;       // 버스 대기 시간, 분 단위
  rideTime: number;       // 버스 탑승 시간, 분 단위
  arrivalTime: string;   // 목적지 도착 시간, "HH:MM" 단위
}

// 2. 방문 장소 규격 (기본 데이터 + 알고리즘 결과 점수 및 사유)
export interface ScoredPlace {
  id: number; // 장소 번호
  name: string; // 장소 이름
  categories: number;     // 비트마스크 정수
  themes: number;         // 비트마스크 정수
  averageTime: number;    // 평균 체류 시간, 분 단위
  latitude: number; // 위도
  longitude: number; // 경도
  nearestBusStopId: number; // 가까운 버스 정류장 id, 참고로 알고리즘 실제 연산에서는 사용하지 않았음.
  description: string; // 장소 설명
  score: number;          // 알고리즘이 최종 연산한 점수
  reasons: string[];      // 장소 사유 배열
}

// 3. 장소 간 이동 경로 규격
export interface RoutePath {
  from: number;           // 출발 장소 ID
  to: number;             // 도착 장소 ID
  path: number[];         // 이동 경로 내 장소 ID 배열 (예: [from, to])
  distance: number;       // 두 지점 간 거리 (미터 단위)
  walkTime: number;       // 도보 소요 시간 (분) -> 버스 매칭 시 0
  bus: SelectedBus | null; // 버스를 타야 하는 경우 버스 객체, 도보 이동이면 null
}

// 4. 소요 시간 정산 통계 규격
export interface TimeSummary {
  totalTime: number;      // 총 소요 시간 (아래 4개 항목의 총합)
  walkingTime: number;    // 총 도보 시간 (분)
  stayTime: number;       // 총 장소 체류 시간 (분)
  busTime: number;        // 총 버스 탑승 이동 시간 (분)
  busWaitTime: number;    // 총 버스 대기 시간 (분)
}

// 5. 🔥 createRoute 함수가 최종 반환하는 메인 객체
export interface FinalRoute {
  routeTitle: string;     // 경로 제목 (UI 상단 노출용)
  summary: string;        // 경로 요약 설명
  startBus: SelectedBus | null;  // 출발지 -> 1번째 장소 버스 (없으면 null)
  returnBus: SelectedBus | null; // 마지막 장소 -> 도착지 버스 (없으면 null)
  places: ScoredPlace[];         // 방문할 장소 리스트 (순서대로 정렬됨)
  paths: RoutePath[];            // 장소 사이사이의 이동 정보
  timeSummary: TimeSummary;      // 시간 통계 영수증
  warnings: string[];            // 예외 경고 메시지 배열 (오류 발생시 여기에 리턴됨.)
}
```

아래는 algorithms/TestAlgorithms.ts 의 실행 결과.
```json
{
  startTime: '10:00',
  totalAvailableTime: 900,
  themes: 3,
  categories: 2,
  mealRequired: true,
  maxPlaceCount: 5,
  startBusStopId: 1,
  endBusStopId: 3
}
{
  "routeTitle": "안동 취향 저격 묶음 여행",
  "summary": "선택하신 조건에 맞춰 총 5개의 장소를 최적의 동선으로 묶었습니다.",
  "startBus": {
    "busNumber": "110",
    "fromBusStopId": 1,
    "toBusStopId": 4,
    "departureTime": "10:00",
    "waitTime": 0,
    "rideTime": 7,
    "arrivalTime": "10:07"
  },
  "returnBus": {
    "busNumber": "110",
    "fromBusStopId": 4,
    "toBusStopId": 3,
    "departureTime": "14:20",
    "waitTime": 10,
    "rideTime": 9,
    "arrivalTime": "14:29"
  },
  "places": [
    {
      "id": 3,
      "name": "죠스떡볶이 안동옥동점",
      "categories": 2,
      "themes": 2,
      "averageTime": 45,
      "latitude": 36.5669166,
      "longitude": 128.6993119,
      "nearestBusStopId": 4,
      "description": "매콤달콤한 떡볶이 전문 맛집.",
      "score": 1100,
      "reasons": [
        "원하시는 카테고리에 맞는 장소입니다.",
        "선택하신 테마 분위기와 어울립니다.",
        "식사가 포함된 일정을 위해 최우선으로 배정되었습니다."
      ]
    },
    {
      "id": 5,
      "name": "옥동 제3공원",
      "categories": 1,
      "themes": 13,
      "averageTime": 60,
      "latitude": 36.5649069,
      "longitude": 128.699857,
      "nearestBusStopId": 4,
      "description": "지역 주민이 자주 찾는 공원.",
      "score": 125,
      "reasons": [
        "선택하신 테마 분위기와 어울립니다.",
        "같은 동네(정류장 권역)에 있어 이동이 매우 효율적입니다.",
        "이전 방문지들과 가까워 도보 이동이 편리합니다."
      ]
    },
    {
      "id": 1,
      "name": "스타벅스 안동옥동점",
      "categories": 4,
      "themes": 9,
      "averageTime": 40,
      "latitude": 36.5635224,
      "longitude": 128.7021133,
      "nearestBusStopId": 4,
      "description": "옥동 상권 중심의 인기 커피 전문점.",
      "score": 200,
      "reasons": [
        "선택하신 테마 분위기와 어울립니다.",
        "같은 동네(정류장 권역)에 있어 이동이 매우 효율적입니다.",
        "이전 방문지들과 가까워 도보 이동이 편리합니다.",
        "관광 후 쉬어가기 좋은 최적의 코스입니다."
      ]
    },
    {
      "id": 2,
      "name": "이디야커피 안동옥동점",
      "categories": 4,
      "themes": 9,
      "averageTime": 35,
      "latitude": 36.5637313,
      "longitude": 128.7034833,
      "nearestBusStopId": 4,
      "description": "가성비 좋은 커피 전문점.",
      "score": 275,
      "reasons": [
        "선택하신 테마 분위기와 어울립니다.",
        "같은 동네(정류장 권역)에 있어 이동이 매우 효율적입니다.",
        "이전 방문지들과 가까워 도보 이동이 편리합니다.",
        "관광 후 쉬어가기 좋은 최적의 코스입니다."
      ]
    },
    {
      "id": 4,
      "name": "옥동 복주1길 상가거리",
      "categories": 9,
      "themes": 17,
      "averageTime": 50,
      "latitude": 36.5635642,
      "longitude": 128.7018351,
      "nearestBusStopId": 4,
      "description": "옥동 대표 상가 산책거리.",
      "score": 335,
      "reasons": [
        "선택하신 테마 분위기와 어울립니다.",
        "같은 동네(정류장 권역)에 있어 이동이 매우 효율적입니다.",
        "이전 방문지들과 가까워 도보 이동이 편리합니다."
      ]
    }
  ],
  "paths": [
    {
      "from": 3,
      "to": 5,
      "path": [
        3,
        5
      ],
      "distance": 229,
      "walkTime": 4,
      "bus": null
    },
    {
      "from": 5,
      "to": 1,
      "path": [
        5,
        1
      ],
      "distance": 254,
      "walkTime": 4,
      "bus": null
    },
    {
      "from": 1,
      "to": 2,
      "path": [
        1,
        2
      ],
      "distance": 125,
      "walkTime": 2,
      "bus": null
    },
    {
      "from": 2,
      "to": 4,
      "path": [
        2,
        4
      ],
      "distance": 148,
      "walkTime": 3,
      "bus": null
    }
  ],
  "timeSummary": {
    "totalTime": 269,
    "walkingTime": 13,
    "stayTime": 230,
    "busTime": 16,
    "busWaitTime": 10
  },
  "warnings": []
}
```

---
이후 UI담당자가 실제로 구현해야 할 부분을 정리해 주기 바람.