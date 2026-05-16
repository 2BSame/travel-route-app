# 데이터 작성 가이드북

> 팀프로젝트 데이터 담당자를 위한 GitHub 공유용 문서입니다.
> 이 문서는 앱에서 사용할 **장소 데이터**, **버스정류장 데이터**, **버스 시간표 데이터**를 어떤 형식으로 작성해야 하는지 설명합니다.

---

## 문서 사용 방법

이 문서는 GitHub 저장소에 올려서 데이터 담당 팀원이 참고하는 용도로 사용합니다.

추천 파일 위치:

```text
docs/data-guide.md
```

또는 프로젝트 루트에 바로 둘 경우:

```text
DATA_GUIDE.md
```

데이터 담당자는 이 문서를 보면서 아래 파일에 데이터를 입력하면 됩니다.

```text
src/data/places.ts
src/data/busStops.ts
src/data/busSchedules.ts
```

관련 타입 파일은 아래와 같습니다.

```text
src/types/place.ts
src/types/busStop.ts
src/types/busSchedule.ts
```

---

## 목차

```text
1. 데이터 파트의 역할
2. 데이터 작성 순서
3. 카테고리와 테마 기준
4. 장소 데이터 작성법
5. 버스정류장 데이터 작성법
6. 버스 시간표 데이터 작성법
7. 데이터끼리 연결되는 방식
8. 1차 테스트용 데이터 기준
9. 최종 데이터 확장 기준
10. 자주 나는 실수
11. 최종 체크리스트
12. 팀원에게 공유할 작업 완료 메시지 예시
```

---

# 1. 데이터 파트의 역할

데이터 파트는 앱의 기초 재료를 만드는 역할입니다.

앱은 데이터가 있어야 추천 루트를 만들 수 있습니다.

예를 들어 사용자가 `감성` 테마를 선택하면 앱은 장소 데이터 중에서 `감성` 테마가 들어간 장소를 찾습니다.

```text
사용자 선택: 감성
→ places.ts에서 감성 테마 장소 검색
→ 추천 루트 생성
→ 화면에 장소 카드와 지도 마커 표시
```

따라서 데이터 담당자는 장소마다 아래 정보를 정확하게 입력해야 합니다.

```text
장소 이름
장소 카테고리
장소 테마
평균 체류 시간
GPS 좌표
가장 가까운 버스정류장
장소 설명
```

---

# 2. 데이터 담당자가 작성해야 하는 파일

데이터 담당자가 직접 작성하거나 수정할 파일은 아래 3개입니다.

```text
src/data/places.ts
src/data/busStops.ts
src/data/busSchedules.ts
```

각 파일의 역할은 다음과 같습니다.

| 파일                | 역할            |
| ----------------- | ------------- |
| `places.ts`       | 추천 장소 데이터 저장  |
| `busStops.ts`     | 버스정류장 데이터 저장  |
| `busSchedules.ts` | 버스 시간표 데이터 저장 |

---

# 3. 데이터 작성 순서

처음부터 모든 데이터를 완성하려고 하면 오류가 많이 생길 수 있습니다.

따라서 반드시 작은 데이터로 먼저 테스트합니다.

```text
1단계: 카테고리와 테마 기준 정하기
2단계: 장소 5개 먼저 작성하기
3단계: 버스정류장 3개 작성하기
4단계: 버스 시간표 2개 작성하기
5단계: 앱에서 정상 작동하는지 확인하기
6단계: 장소를 25개 내외로 확장하기
```

처음 목표는 완성된 데이터가 아니라 **앱이 작동하는 최소 데이터**를 만드는 것입니다.

---

# 4. 카테고리와 테마 기준

## 4.1 카테고리란?

카테고리는 장소의 종류입니다.

예시:

```text
관광지
식당
카페
문화
산책
```

장소 하나는 여러 카테고리를 가질 수 있습니다.

예시:

```text
월영교 → 관광지, 산책
안동찜닭거리 → 식당, 문화
맘모스제과 → 카페, 식당
```

코드에서는 배열로 작성합니다.

```typescript
categories: ["관광지", "산책"]
```

---

## 4.2 테마란?

테마는 사용자가 원하는 여행 분위기나 목적입니다.

예시:

```text
감성
맛집
역사
자연
전통
```

장소 하나는 여러 테마를 가질 수 있습니다.

예시:

```text
월영교 → 감성, 자연
안동찜닭거리 → 맛집, 전통
맘모스제과 → 맛집, 감성
```

코드에서는 배열로 작성합니다.

```typescript
themes: ["감성", "자연"]
```

---

## 4.3 카테고리와 테마의 차이

카테고리는 **장소의 종류**이고, 테마는 **여행 느낌**입니다.

예시:

```text
장소: 안동찜닭거리
카테고리: 식당, 문화
테마: 맛집, 전통
```

```text
장소: 월영교
카테고리: 관광지, 산책
테마: 감성, 자연
```

카테고리와 테마를 헷갈리면 필터링 결과가 이상하게 나올 수 있으므로 주의합니다.

---

# 5. 장소 데이터 작성법

장소 데이터는 `src/data/places.ts`에 작성합니다.

장소 하나는 아래 형식을 따릅니다.

```typescript
{
  id: 1,
  name: "월영교",
  categories: ["관광지", "산책"],
  themes: ["감성", "자연"],
  averageTime: 40,
  latitude: 36.5761,
  longitude: 128.7656,
  nearestBusStopId: 1,
  description: "안동의 대표적인 야경 명소입니다."
}
```

---

## 5.1 장소 데이터 항목 설명

| 항목                 | 의미            | 작성 예시                  | 주의사항                  |
| ------------------ | ------------- | ---------------------- | --------------------- |
| `id`               | 장소 고유 번호      | `id: 1`                | 중복되면 안 됨              |
| `name`             | 장소 이름         | `name: "월영교"`          | 실제 장소 이름 사용           |
| `categories`       | 장소 종류         | `["관광지", "산책"]`        | 반드시 배열 사용             |
| `themes`           | 여행 테마         | `["감성", "자연"]`         | 반드시 배열 사용             |
| `averageTime`      | 평균 체류 시간      | `40`                   | 분 단위, 숫자만 입력          |
| `latitude`         | 위도            | `36.5761`              | 숫자로 입력                |
| `longitude`        | 경도            | `128.7656`             | 숫자로 입력                |
| `nearestBusStopId` | 가장 가까운 정류장 ID | `1`                    | `busStops.ts`의 id와 연결 |
| `description`      | 장소 설명         | `"안동의 대표적인 야경 명소입니다."` | 1~2문장 권장              |

---

## 5.2 id 작성법

`id`는 장소의 고유 번호입니다.

```typescript
id: 1
```

작성 규칙:

```text
- 1부터 순서대로 작성합니다.
- 장소마다 id가 중복되면 안 됩니다.
- 숫자로 작성합니다.
- 따옴표를 붙이지 않습니다.
```

좋은 예시:

```typescript
id: 1
```

나쁜 예시:

```typescript
id: "1"
id: 1번
```

---

## 5.3 name 작성법

`name`은 장소 이름입니다.

```typescript
name: "월영교"
```

작성 규칙:

```text
- 사용자가 화면에서 볼 이름을 적습니다.
- 실제 지도나 검색 결과에 나오는 이름을 사용합니다.
- 너무 긴 설명형 이름은 피합니다.
```

좋은 예시:

```typescript
name: "월영교"
name: "안동찜닭거리"
name: "맘모스제과"
```

나쁜 예시:

```typescript
name: "안동에 있는 유명한 다리"
name: "찜닭 먹는 곳"
```

---

## 5.4 categories 작성법

`categories`는 장소의 종류입니다.

```typescript
categories: ["관광지", "산책"]
```

작성 규칙:

```text
- 반드시 배열 [ ] 로 작성합니다.
- 여러 개를 넣을 수 있습니다.
- 문자열은 큰따옴표로 감쌉니다.
- 여러 개를 넣을 때는 쉼표로 구분합니다.
```

좋은 예시:

```typescript
categories: ["관광지", "산책"]
categories: ["식당", "문화"]
categories: ["카페"]
```

나쁜 예시:

```typescript
category: "관광지"
categories: "관광지"
categories: [관광지, 산책]
```

주의:

```text
category가 아니라 categories입니다.
```

---

## 5.5 themes 작성법

`themes`는 장소의 여행 분위기 또는 추천 기준입니다.

```typescript
themes: ["감성", "자연"]
```

작성 규칙:

```text
- 반드시 배열 [ ] 로 작성합니다.
- 여러 개를 넣을 수 있습니다.
- 문자열은 큰따옴표로 감쌉니다.
- 여러 개를 넣을 때는 쉼표로 구분합니다.
```

좋은 예시:

```typescript
themes: ["감성", "자연"]
themes: ["맛집", "전통"]
themes: ["역사", "전통"]
```

나쁜 예시:

```typescript
theme: "감성"
themes: "감성"
themes: [감성, 자연]
```

---

## 5.6 averageTime 작성법

`averageTime`은 그 장소에서 머무는 예상 시간입니다.

단위는 **분**입니다.

```typescript
averageTime: 40
```

작성 기준 예시:

```text
카페: 30~50분
식당: 50~70분
짧은 관광지: 30~40분
큰 관광지: 60~90분
산책 장소: 30~60분
```

좋은 예시:

```typescript
averageTime: 40
averageTime: 60
averageTime: 90
```

나쁜 예시:

```typescript
averageTime: "40분"
averageTime: "약 1시간"
averageTime: 1시간
```

---

## 5.7 latitude, longitude 작성법

`latitude`와 `longitude`는 장소의 GPS 좌표입니다.

```typescript
latitude: 36.5761,
longitude: 128.7656
```

뜻:

```text
latitude = 위도
longitude = 경도
```

작성 방법:

```text
1. 네이버지도, 카카오맵, 구글지도 등에서 장소를 찾습니다.
2. 장소의 좌표를 확인합니다.
3. 위도와 경도를 숫자로 입력합니다.
```

좋은 예시:

```typescript
latitude: 36.5761,
longitude: 128.7656
```

나쁜 예시:

```typescript
latitude: "36.5761"
longitude: "128.7656"
latitude: 36도
```

주의:

```text
- 따옴표 없이 숫자로 작성합니다.
- 위도와 경도를 반대로 넣지 않습니다.
- 좌표가 크게 틀리면 모의 지도에서 마커 위치가 이상하게 나옵니다.
```

---

## 5.8 nearestBusStopId 작성법

`nearestBusStopId`는 해당 장소에서 가장 가까운 버스정류장의 번호입니다.

```typescript
nearestBusStopId: 1
```

이 값은 `src/data/busStops.ts`의 `id`와 연결됩니다.

예시:

```typescript
// busStops.ts
{
  id: 1,
  name: "월영교 근처 정류장",
  latitude: 36.5758,
  longitude: 128.7649
}
```

```typescript
// places.ts
{
  id: 1,
  name: "월영교",
  nearestBusStopId: 1
}
```

뜻:

```text
월영교의 가장 가까운 정류장은 id가 1인 정류장입니다.
```

주의:

```text
- nearestBusStopId에 적은 숫자는 busStops.ts에 반드시 있어야 합니다.
- 없는 정류장 번호를 넣으면 알고리즘에서 출발/도착 정류장을 찾지 못합니다.
```

---

## 5.9 description 작성법

`description`은 장소 설명입니다.

```typescript
description: "안동의 대표적인 야경 명소입니다."
```

작성 규칙:

```text
- 너무 길게 쓰지 않습니다.
- 1~2문장 정도로 작성합니다.
- 화면 카드에 표시될 설명이라고 생각하면 됩니다.
```

좋은 예시:

```typescript
description: "안동의 대표적인 야경 명소입니다."
description: "안동 대표 음식인 찜닭을 먹을 수 있는 거리입니다."
```

나쁜 예시:

```typescript
description: "좋음"
description: "블로그 글 전체 복사"
```

---

# 6. places.ts 전체 예시

아래 예시는 `src/data/places.ts`에 작성할 수 있는 기본 형태입니다.

```typescript
import { Place } from "../types/place";

export const places: Place[] = [
  {
    id: 1,
    name: "월영교",
    categories: ["관광지", "산책"],
    themes: ["감성", "자연"],
    averageTime: 40,
    latitude: 36.5761,
    longitude: 128.7656,
    nearestBusStopId: 1,
    description: "안동의 대표적인 야경 명소입니다."
  },
  {
    id: 2,
    name: "안동찜닭거리",
    categories: ["식당", "문화"],
    themes: ["맛집", "전통"],
    averageTime: 60,
    latitude: 36.5652,
    longitude: 128.7283,
    nearestBusStopId: 2,
    description: "안동 대표 음식인 찜닭을 먹을 수 있는 거리입니다."
  },
  {
    id: 3,
    name: "맘모스제과",
    categories: ["카페", "식당"],
    themes: ["맛집", "감성"],
    averageTime: 30,
    latitude: 36.5645,
    longitude: 128.7291,
    nearestBusStopId: 2,
    description: "안동에서 유명한 베이커리 장소입니다."
  }
];
```

장소를 추가할 때는 배열 안에 객체를 하나 더 추가하면 됩니다.

```typescript
{
  id: 4,
  name: "새 장소 이름",
  categories: ["관광지"],
  themes: ["역사", "전통"],
  averageTime: 50,
  latitude: 36.0000,
  longitude: 128.0000,
  nearestBusStopId: 3,
  description: "장소 설명입니다."
}
```

---

# 7. 버스정류장 데이터 작성법

버스정류장 데이터는 `src/data/busStops.ts`에 작성합니다.

버스정류장 하나는 아래 형식을 따릅니다.

```typescript
{
  id: 1,
  name: "월영교 근처 정류장",
  latitude: 36.5758,
  longitude: 128.7649
}
```

각 항목의 의미는 다음과 같습니다.

| 항목          | 의미        | 작성 예시                | 주의사항                 |
| ----------- | --------- | -------------------- | -------------------- |
| `id`        | 정류장 고유 번호 | `id: 1`              | 중복되면 안 됨             |
| `name`      | 정류장 이름    | `name: "월영교 근처 정류장"` | 실제 이름 또는 임시 이름 사용 가능 |
| `latitude`  | 정류장 위도    | `36.5758`            | 숫자로 입력               |
| `longitude` | 정류장 경도    | `128.7649`           | 숫자로 입력               |

---

## 7.1 busStops.ts 전체 예시

```typescript
import { BusStop } from "../types/busStop";

export const busStops: BusStop[] = [
  {
    id: 1,
    name: "월영교 근처 정류장",
    latitude: 36.5758,
    longitude: 128.7649
  },
  {
    id: 2,
    name: "안동시내 정류장",
    latitude: 36.5648,
    longitude: 128.7287
  },
  {
    id: 3,
    name: "문화의거리 정류장",
    latitude: 36.5639,
    longitude: 128.7301
  }
];
```

---

# 8. 버스 시간표 데이터 작성법

버스 시간표 데이터는 `src/data/busSchedules.ts`에 작성합니다.

처음부터 실제 시간표를 완벽하게 반영할 필요는 없습니다. 발표용 프로토타입에서는 아래 정보만 있어도 됩니다.

```text
버스 번호
출발 정류장
도착 정류장
출발 시간 목록
예상 이동 시간
```

버스 시간표 하나는 아래 형식을 따릅니다.

```typescript
{
  id: 1,
  busNumber: "110",
  fromBusStopId: 1,
  toBusStopId: 2,
  departureTimes: ["09:00", "09:30", "10:00"],
  estimatedMinutes: 15
}
```

---

## 8.1 버스 시간표 항목 설명

| 항목                 | 의미        | 작성 예시                | 주의사항                  |
| ------------------ | --------- | -------------------- | --------------------- |
| `id`               | 시간표 고유 번호 | `id: 1`              | 중복되면 안 됨              |
| `busNumber`        | 버스 번호     | `"110"`              | 문자열로 작성               |
| `fromBusStopId`    | 출발 정류장 ID | `1`                  | `busStops.ts`의 id와 연결 |
| `toBusStopId`      | 도착 정류장 ID | `2`                  | `busStops.ts`의 id와 연결 |
| `departureTimes`   | 출발 시간 목록  | `["09:00", "09:30"]` | 배열, HH:MM 형식          |
| `estimatedMinutes` | 예상 이동 시간  | `15`                 | 분 단위, 숫자              |

---

## 8.2 busSchedules.ts 전체 예시

```typescript
import { BusSchedule } from "../types/busSchedule";

export const busSchedules: BusSchedule[] = [
  {
    id: 1,
    busNumber: "110",
    fromBusStopId: 1,
    toBusStopId: 2,
    departureTimes: ["09:00", "09:30", "10:00", "10:30", "11:00"],
    estimatedMinutes: 15
  },
  {
    id: 2,
    busNumber: "210",
    fromBusStopId: 2,
    toBusStopId: 3,
    departureTimes: ["09:10", "09:40", "10:10", "10:40", "11:10"],
    estimatedMinutes: 12
  }
];
```

---

# 9. 데이터끼리 연결되는 방식

데이터 담당자가 가장 주의해야 하는 부분은 **id 연결**입니다.

---

## 9.1 장소와 버스정류장 연결

`places.ts`에서 아래처럼 작성했다면,

```typescript
nearestBusStopId: 2
```

`busStops.ts`에 반드시 `id: 2`인 정류장이 있어야 합니다.

```typescript
{
  id: 2,
  name: "안동시내 정류장",
  latitude: 36.5648,
  longitude: 128.7287
}
```

---

## 9.2 버스 시간표와 버스정류장 연결

`busSchedules.ts`에서 아래처럼 작성했다면,

```typescript
fromBusStopId: 1,
toBusStopId: 2
```

`busStops.ts`에 반드시 `id: 1`, `id: 2`인 정류장이 있어야 합니다.

```text
id 1 정류장 → id 2 정류장으로 가는 버스 시간표
```

---

# 10. 장소 선정 기준

장소를 고를 곳은 데이터 담당자가 결정합니다.

다만 추천 루트 앱이므로 장소가 한 종류에만 몰리면 안 됩니다.

권장 구성:

```text
관광지: 7~8개
식당: 6~7개
카페: 4~5개
문화/역사 장소: 3~4개
산책/자연 장소: 3~4개
총 25개 내외
```

장소를 고를 때 고려할 기준:

```text
1. 프로젝트 범위 안에 있는 장소인가?
2. 지도에 표시하기 쉬운 위치인가?
3. 버스정류장과 연결하기 쉬운가?
4. 테마를 붙이기 쉬운가?
5. 사용자가 실제로 갈 만한 장소인가?
```

---

# 11. 데이터 작성표

코드로 바로 작성하기 어렵다면 먼저 아래 표처럼 정리한 뒤 코드로 옮기면 됩니다.

| id | name   | categories | themes | averageTime | latitude | longitude | nearestBusStopId | description                  |
| -- | ------ | ---------- | ------ | ----------: | -------: | --------: | ---------------: | ---------------------------- |
| 1  | 월영교    | 관광지, 산책    | 감성, 자연 |          40 |  36.5761 |  128.7656 |                1 | 안동의 대표적인 야경 명소입니다.           |
| 2  | 안동찜닭거리 | 식당, 문화     | 맛집, 전통 |          60 |  36.5652 |  128.7283 |                2 | 안동 대표 음식인 찜닭을 먹을 수 있는 거리입니다. |
| 3  | 맘모스제과  | 카페, 식당     | 맛집, 감성 |          30 |  36.5645 |  128.7291 |                2 | 안동에서 유명한 베이커리 장소입니다.         |

이 표를 먼저 만들고 이후 TypeScript 코드 형식으로 옮기면 실수가 줄어듭니다.

---

# 12. 1차 테스트용 데이터 기준

처음에는 아래 정도만 작성합니다.

```text
장소 5개
정류장 3개
버스 시간표 2개
```

1차 테스트 장소 예시:

```text
1. 월영교
2. 안동찜닭거리
3. 맘모스제과
4. 문화의 거리
5. 전통문화콘텐츠박물관
```

정상 작동 기준:

```text
- 앱에서 장소 데이터 import 가능
- 루트 만들기 버튼을 눌렀을 때 추천 결과가 나옴
- 장소 카드가 화면에 표시됨
- 모의 지도에 마커가 표시됨
- 출발/도착 정류장 이름이 표시됨
```

---

# 13. 장소 25개로 확장할 때 주의할 점

5개 장소로 테스트가 성공하면 장소를 25개 내외로 확장합니다.

확장할 때 주의할 점:

```text
1. id가 중복되지 않는지 확인합니다.
2. categories에 오타가 없는지 확인합니다.
3. themes에 오타가 없는지 확인합니다.
4. latitude와 longitude가 반대로 들어가지 않았는지 확인합니다.
5. nearestBusStopId가 실제 busStops.ts에 존재하는지 확인합니다.
6. averageTime이 문자열이 아니라 숫자인지 확인합니다.
7. 장소와 장소 사이에 쉼표가 있는지 확인합니다.
8. cost 항목을 추가하지 않았는지 확인합니다.
```

---

# 14. 자주 나는 실수

## 14.1 쉼표 누락

나쁜 예시:

```typescript
{
  id: 1,
  name: "월영교"
  categories: ["관광지", "산책"]
}
```

좋은 예시:

```typescript
{
  id: 1,
  name: "월영교",
  categories: ["관광지", "산책"]
}
```

---

## 14.2 categories를 문자열로 작성

나쁜 예시:

```typescript
categories: "관광지"
```

좋은 예시:

```typescript
categories: ["관광지"]
```

---

## 14.3 themes를 문자열로 작성

나쁜 예시:

```typescript
themes: "감성"
```

좋은 예시:

```typescript
themes: ["감성"]
```

---

## 14.4 averageTime을 문자열로 작성

나쁜 예시:

```typescript
averageTime: "40분"
```

좋은 예시:

```typescript
averageTime: 40
```

---

## 14.5 존재하지 않는 정류장 id 사용

나쁜 예시:

```typescript
nearestBusStopId: 99
```

`busStops.ts`에 `id: 99`가 없으면 오류가 납니다.

좋은 예시:

```typescript
nearestBusStopId: 2
```

그리고 `busStops.ts`에 아래 데이터가 있어야 합니다.

```typescript
{
  id: 2,
  name: "안동시내 정류장",
  latitude: 36.5648,
  longitude: 128.7287
}
```

---

# 15. 최종 체크리스트

## 15.1 장소 데이터 체크리스트

```text
□ 장소가 5개 이상 작성되었는가?
□ 최종적으로 25개 내외까지 확장할 수 있는가?
□ 모든 장소의 id가 중복되지 않는가?
□ 모든 장소에 name이 있는가?
□ 모든 장소에 categories 배열이 있는가?
□ 모든 장소에 themes 배열이 있는가?
□ 모든 장소에 averageTime이 숫자로 들어갔는가?
□ 모든 장소에 latitude가 숫자로 들어갔는가?
□ 모든 장소에 longitude가 숫자로 들어갔는가?
□ 모든 장소에 nearestBusStopId가 있는가?
□ 모든 장소에 description이 있는가?
□ cost 항목이 들어가 있지 않은가?
```

## 15.2 버스정류장 데이터 체크리스트

```text
□ 정류장이 3개 이상 작성되었는가?
□ 모든 정류장의 id가 중복되지 않는가?
□ 모든 정류장에 name이 있는가?
□ 모든 정류장에 latitude와 longitude가 있는가?
□ places.ts의 nearestBusStopId가 busStops.ts의 id와 연결되는가?
```

## 15.3 버스 시간표 데이터 체크리스트

```text
□ 버스 시간표가 2개 이상 작성되었는가?
□ busNumber가 문자열로 작성되었는가?
□ fromBusStopId가 실제 정류장 id와 연결되는가?
□ toBusStopId가 실제 정류장 id와 연결되는가?
□ departureTimes가 배열로 작성되었는가?
□ departureTimes가 "09:00" 같은 형식으로 작성되었는가?
□ estimatedMinutes가 숫자로 작성되었는가?
```

---

# 16. GitHub 작업 규칙

데이터 담당자가 GitHub에 올릴 때는 아래 규칙을 지킵니다.

## 16.1 커밋 메시지 예시

```text
feat: 장소 데이터 5개 추가
feat: 버스정류장 데이터 추가
feat: 버스 시간표 데이터 추가
fix: 장소 좌표 수정
fix: nearestBusStopId 연결 오류 수정
docs: 데이터 작성 가이드북 추가
```

## 16.2 Pull Request 설명 예시

```text
## 작업 내용
- 장소 데이터 5개 추가
- 버스정류장 데이터 3개 추가
- 버스 시간표 데이터 2개 추가

## 확인한 내용
- 장소 id 중복 없음
- nearestBusStopId가 busStops.ts의 id와 연결됨
- cost 항목 제거 완료
- categories, themes 배열 형식 확인

## 추가 확인 필요
- 실제 GPS 좌표 정확도 확인 필요
- 버스 시간표는 임시 데이터이므로 추후 수정 가능
```

---

# 17. 팀원에게 공유할 작업 완료 메시지 예시

데이터 담당자가 1차 데이터를 작성한 뒤 팀원에게 아래처럼 공유하면 됩니다.

```text
장소 데이터 5개 작성했습니다.
사용 카테고리는 관광지, 식당, 카페, 문화, 산책입니다.
사용 테마는 감성, 맛집, 역사, 자연, 전통입니다.
버스정류장은 3개 작성했고, 버스 시간표는 2개 작성했습니다.
좌표는 일단 임시로 넣었고, 이후 정확한 좌표로 수정할 예정입니다.
nearestBusStopId 연결은 확인했습니다.
```

---

# 18. 최종 핵심 정리

데이터 담당자가 반드시 기억해야 할 핵심은 다음과 같습니다.

```text
장소 하나 = 객체 하나
장소 여러 개 = 객체 배열
카테고리 = categories 배열
테마 = themes 배열
비용 = 사용하지 않음
체류 시간 = averageTime 숫자
좌표 = latitude, longitude 숫자
가까운 정류장 = nearestBusStopId로 연결
버스 시간표 = fromBusStopId와 toBusStopId로 정류장 연결
```

가장 먼저 할 일은 아래 3가지입니다.

```text
1. 장소 5개만 먼저 작성한다.
2. 그 장소들과 연결되는 정류장 3개를 작성한다.
3. 정류장 사이의 버스 시간표 2개를 작성한다.
```

이후 앱이 정상 작동하면 장소를 25개 내외로 확장합니다.

