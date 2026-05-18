# UI 파트 가이드북

> 대상: UI 담당 팀원  
> 목적: 현재 GitHub 프로젝트의 데이터/알고리즘 구조에 맞춰 **3개 화면으로 동작하는 여행 루트 앱 UI**를 구현한다.  
> 기준 프로젝트: `travel-route-app` / Expo + React Native + TypeScript

---

## 0. UI 담당자가 먼저 이해해야 할 핵심

이 프로젝트의 UI는 “예쁜 화면”만 만드는 역할이 아니라, 데이터 파트와 알고리즘 파트가 만든 결과를 사용자가 이해할 수 있게 보여주는 역할이다.

현재 프로젝트 흐름은 아래처럼 이해하면 된다.

```text
사용자 조건 선택
        ↓
UserRouteInput 생성
        ↓
createRoute(userInput) 실행
        ↓
FinalRoute 결과 반환
        ↓
지도 화면 + 경로 상세 설명 화면에 표시
```

UI 담당자는 복잡한 알고리즘 내부를 직접 수정할 필요는 없다. 대신 아래 두 가지를 정확히 연결해야 한다.

1. 사용자가 선택한 값을 `UserRouteInput` 형태로 만든다.
2. `createRoute()`가 반환한 `FinalRoute`를 화면에 보기 좋게 표시한다.

---

## 1. 추천 화면 구성

이번 프로젝트에서는 화면을 너무 많이 만들지 말고 **3개 화면**으로 구성하는 것을 추천한다.

| 화면 | 이름 | 핵심 역할 |
|---|---|---|
| 1페이지 | 여행 조건 선택 화면 | 시간, 식사 여부, 테마, 카테고리 선택 |
| 2페이지 | 모의지도 경로 화면 | 지도 이미지 위에 장소 마커와 경로선 표시 |
| 3페이지 | 경로 상세 설명 화면 | 추천 이유, 예상 시간, 이동 방식, 경고 표시 |

이 방식의 장점은 다음과 같다.

- 발표할 때 설명 흐름이 쉽다.
- 실제 지도 API를 완성하지 않아도 앱처럼 보인다.
- 알고리즘 결과가 눈에 보이므로 프로젝트 완성도가 높아 보인다.
- UI 담당자가 맡아야 할 범위가 명확해진다.

---

## 2. 예시 화면 미리보기

아래 이미지는 실제 구현 방향을 설명하기 위한 예시 화면이다. GitHub에 올릴 때는 이 문서와 함께 `docs/images` 폴더도 같이 올리면 이미지가 자동으로 표시된다.

### 1페이지: 여행 조건 선택 화면

![여행 조건 선택 화면](docs/images/ui_screen_01_input.png)

### 2페이지: 모의지도 경로 화면

![모의지도 경로 화면](docs/images/ui_screen_01_input.png)

### 3페이지: 경로 상세 설명 화면

![경로 상세 설명 화면](docs/images/ui_screen_01_input.png)

---

## 3. 참고한 UI 방향

이 프로젝트는 완성형 상용 앱이 아니라 수업용 팀 프로젝트이므로, 모든 기능을 실제 서비스처럼 구현하려고 하기보다 **지도 앱처럼 보이는 시각화 + 여행 앱처럼 이해되는 카드 UI**를 목표로 한다.

참고 방향은 다음과 같다.

| 참고 분야 | 가져올 점 | 프로젝트 적용 방식 |
|---|---|---|
| 지도 앱 UI | 지도 중심, 마커, 경로선, 하단 정보 카드 | 2페이지 모의지도 화면 |
| 여행/맛집 앱 UI | 장소 카드, 태그, 추천 이유 | 3페이지 상세 설명 화면 |
| 모바일 앱 기본 UI | 큰 제목, 둥근 카드, 명확한 버튼 | 전체 화면 공통 디자인 |
| Material Design | 모바일 하단 내비게이션, 카드 구조 | 화면 전환과 정보 카드 구성 |
| Apple HIG | 탭/내비게이션을 단순하게 유지 | 3개 화면 구조 유지 |

참고 문서:

- Material Design Navigation bar: https://m3.material.io/components/navigation-bar/overview
- Material Design Cards: https://m3.material.io/components/cards
- Apple Human Interface Guidelines - Tab Bars: https://developer.apple.com/design/human-interface-guidelines/tab-bars
- React Native ImageBackground: https://reactnative.dev/docs/imagebackground
- React Native Pressable: https://reactnative.dev/docs/pressable
- Expo Router Tabs: https://docs.expo.dev/router/advanced/tabs/

---

## 4. 현재 프로젝트에서 UI가 사용해야 하는 데이터 구조

### 4-1. 사용자 입력값: `UserRouteInput`

현재 알고리즘은 아래 형태의 입력값을 받는다.

```ts
export interface UserRouteInput {
  startTime: string;          // 예: "09:00"
  totalAvailableTime: number; // 분 단위
  themes: number;             // 비트마스크
  categories: number;         // 비트마스크
  mealRequired: boolean;
  maxPlaceCount: number;
  startBusStopId: number;
  endBusStopId: number;
}
```

UI 화면에서 사용자가 직접 선택하게 할 항목은 아래 정도면 충분하다.

| UI 항목 | 실제 코드 값 | 예시 |
|---|---|---|
| 출발 시간 | `startTime` | `"09:00"` |
| 여행 가능 시간 | `totalAvailableTime` | `180` |
| 테마 | `themes` | 감성, 먹거리, 자연, 조용한, 문화 |
| 카테고리 | `categories` | 관광지, 먹거리, 카페, 문화 |
| 식사 여부 | `mealRequired` | true / false |
| 방문 장소 수 | `maxPlaceCount` | 3 |
| 출발 정류장 | `startBusStopId` | 경국대 정류장 ID |
| 도착 정류장 | `endBusStopId` | 경국대 정류장 ID |

주의할 점은 `themes`와 `categories`가 문자열이 아니라 **비트마스크 숫자값**이라는 점이다. 따라서 UI에서 버튼을 눌렀을 때 문자열을 그대로 저장하지 말고, `themeMask.MOOD` 같은 값을 저장해야 한다.

---

### 4-2. 장소 데이터: `Place`

현재 장소 데이터는 아래 구조를 가진다.

```ts
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
```

UI에서 장소 카드에 보여줄 수 있는 값은 다음과 같다.

| 표시 항목 | 사용할 데이터 |
|---|---|
| 장소 이름 | `place.name` |
| 장소 설명 | `place.description` |
| 예상 체류 시간 | `place.averageTime` |
| 카테고리 | `place.categories`를 텍스트로 변환 |
| 테마 | `place.themes`를 텍스트로 변환 |
| 지도 마커 위치 | `place.latitude`, `place.longitude` |
| 가까운 정류장 | `place.nearestBusStopId` |

---

### 4-3. 최종 경로 결과: `FinalRoute`

`createRoute(userInput)`를 실행하면 아래 형태의 결과가 나온다.

```ts
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

UI에서는 이 값을 아래처럼 사용하면 된다.

| 화면 | 사용할 값 |
|---|---|
| 지도 화면 | `route.places`, `route.paths` |
| 경로 설명 화면 | `route.routeTitle`, `route.summary`, `route.places` |
| 시간 요약 | `route.timeSummary.totalTime`, `walkingTime`, `stayTime`, `busTime` |
| 버스 안내 | `route.startBus`, `route.returnBus` |
| 경고 카드 | `route.warnings` |

---

## 5. 기존 UI 코드에서 주의할 점

현재 저장소의 기존 UI 예시 코드에는 예전 데이터 구조를 사용하는 부분이 있다. 따라서 그대로 사용하면 오류가 날 수 있다.

예를 들어 기존 `PlaceCard.tsx`에서는 아래 같은 값을 사용하고 있다.

```ts
place.category
place.moodTags
place.avgCost
place.stayMinutes
```

하지만 현재 `Place` 타입에는 위 값들이 없다. 현재는 아래 값을 사용해야 한다.

```ts
place.categories
place.themes
place.averageTime
place.description
```

또한 기존 화면에서 `filterPlacesByMood`를 사용하고 있다면, 현재 알고리즘 구조와 맞지 않을 수 있다. UI는 장소를 직접 필터링하기보다 아래 흐름을 따르는 것이 좋다.

```ts
const route = createRoute(userInput);
setFinalRoute(route);
```

즉, UI 담당자는 **직접 장소를 고르지 말고 알고리즘 결과를 받아서 보여주는 역할**에 집중한다.

---

## 6. 화면별 상세 설계

## 6-1. 1페이지: 여행 조건 선택 화면

### 목적

사용자가 여행 조건을 고르는 화면이다. 이 화면에서 선택된 값이 `UserRouteInput`으로 변환된다.

### 반드시 들어가면 좋은 요소

| 요소 | 설명 |
|---|---|
| 앱 제목 | 여행 루트 추천 앱 |
| 안내 문구 | 경국대 출발, 안동 시내 루트 추천 안내 |
| 여행 시간 선택 | 2시간, 3시간, 4시간, 반나절 |
| 식사 여부 | 식사 포함 / 식사 제외 |
| 카테고리 선택 | 관광지, 먹거리, 카페, 문화 |
| 테마 선택 | 감성, 먹거리, 자연, 조용한, 문화 |
| 추천 경로 생성 버튼 | 누르면 `createRoute()` 실행 |

### UI 작성 방향

- 선택지는 버튼 형태로 만든다.
- 선택된 버튼은 색을 다르게 표시한다.
- 너무 많은 입력을 한 화면에 넣지 않는다.
- 출발 정류장과 도착 정류장은 기본값으로 숨겨도 된다.

### 기본값 추천

| 값 | 추천 기본값 |
|---|---|
| 출발 시간 | `"09:00"` |
| 여행 시간 | `180`분 |
| 방문 장소 수 | `3` |
| 출발 정류장 | `7`번, 국립경국대 |
| 도착 정류장 | `7`번, 국립경국대 |

---

## 6-2. 2페이지: 모의지도 경로 화면

### 목적

추천된 장소들이 지도 위에서 어떤 순서로 이어지는지 보여주는 화면이다. 프로젝트에서 시각적으로 가장 중요한 화면이다.

### 반드시 들어가면 좋은 요소

| 요소 | 설명 |
|---|---|
| 모의지도 이미지 | 안동 시내 지도 이미지 또는 직접 그린 단순 지도 |
| 장소 마커 | `route.places`를 순서대로 표시 |
| 경로선 | 방문 순서를 선으로 연결 |
| 현재 위치 표시 | 발표용으로 선택된 장소나 현재 진행 지점을 강조 |
| 하단 카드 | 경로 제목, 장소 목록, 상세 설명 버튼 |

### 구현 방식

실제 지도 API를 사용하지 않아도 된다. 발표용 프로젝트라면 아래 방식이 더 안전하다.

```text
지도 이미지 준비
   ↓
ImageBackground 또는 View 배경으로 배치
   ↓
장소별 marker 좌표를 수동 지정
   ↓
순서대로 선과 번호 표시
```

`latitude`, `longitude`를 실제 지도 좌표로 변환하는 기능까지 구현하기 어렵다면, UI 담당자가 장소별 화면 좌표를 임시로 정해도 된다.

예시:

```ts
const markerPositions: Record<number, { x: number; y: number }> = {
  6: { x: 300, y: 140 }, // 월영교
  7: { x: 180, y: 260 }, // 안동구시장
  9: { x: 230, y: 220 }, // 문화의 거리
};
```

---

## 6-3. 3페이지: 경로 상세 설명 화면

### 목적

앱이 왜 이 경로를 추천했는지 설명하는 화면이다.

### 반드시 들어가면 좋은 요소

| 요소 | 설명 |
|---|---|
| 경로 제목 | `route.routeTitle` |
| 요약 문장 | `route.summary` |
| 전체 시간 요약 | `route.timeSummary` |
| 장소별 카드 | 장소 이름, 설명, 예상 체류 시간, 추천 이유 |
| 버스 정보 | 출발 버스, 복귀 버스 |
| 경고 카드 | `route.warnings` |

### 장소 카드 예시

```text
1. 안동구시장
먹거리 / 문화
예상 체류 시간: 45분
추천 이유: 식사가 포함된 일정을 위해 우선 배치되었습니다.
```

---

## 7. 추천 파일 구조

현재 프로젝트의 구조를 크게 바꾸지 않고, 아래처럼 UI 관련 파일을 정리하는 것을 추천한다.

```text
app/
└─ (tabs)/
   └─ index.tsx                 // 3개 화면을 임시로 전환하는 메인 UI

src/
├─ components/
│  ├─ ui/
│  │  ├─ SelectChip.tsx          // 선택 버튼
│  │  ├─ RouteSummaryCard.tsx    // 경로 요약 카드
│  │  ├─ RoutePlaceCard.tsx      // 장소 카드
│  │  └─ MockMapView.tsx         // 모의지도 화면
│  └─ PlaceCard.tsx              // 기존 파일 수정 가능
│
├─ utils/
│  └─ labelUtils.ts              // 비트마스크를 한글 라벨로 변환
│
└─ algorithms/
   └─ routeMaker.ts              // createRoute 사용
```

처음부터 파일을 많이 나누기 어렵다면, 우선 `app/(tabs)/index.tsx` 하나에 전부 구현하고, 동작이 확인된 뒤 컴포넌트로 분리해도 된다.

---

## 8. 공통 디자인 규칙

### 색상 추천

| 역할 | 색상 예시 | 사용 위치 |
|---|---|---|
| 메인 색 | 진한 초록 계열 | 주요 버튼, 선택 상태 |
| 배경 색 | 밝은 베이지/연녹색 | 앱 전체 배경 |
| 카드 색 | 흰색 | 장소 카드, 설명 카드 |
| 경고 색 | 연한 노랑/주황 | warnings 안내 |
| 보조 텍스트 | 회색 | 설명 문장 |

### 글자 크기 추천

| 용도 | 크기 |
|---|---|
| 화면 제목 | 24~28 |
| 카드 제목 | 17~20 |
| 일반 설명 | 13~15 |
| 작은 보조 정보 | 11~13 |

### 레이아웃 규칙

- 화면 바깥 여백은 20~24 정도로 둔다.
- 카드는 둥근 모서리를 사용한다.
- 버튼은 누르기 쉽게 높이 44 이상으로 만든다.
- 긴 내용은 `ScrollView` 안에 넣는다.
- 한 화면에 너무 많은 텍스트를 넣지 않는다.

---

## 9. 예시 코드 1: 비트마스크 라벨 변환 함수

`src/utils/labelUtils.ts` 파일을 만들어 아래 코드를 넣으면, 숫자로 저장된 카테고리와 테마를 화면용 한글 텍스트로 바꿀 수 있다.

```ts
import { categoryMask, themeMask } from "../types/place";

export function getCategoryLabels(categories: number): string[] {
  const labels: string[] = [];

  if ((categories & categoryMask.TOUR) !== 0) labels.push("관광지");
  if ((categories & categoryMask.FOOD) !== 0) labels.push("먹거리");
  if ((categories & categoryMask.CAFE) !== 0) labels.push("카페");
  if ((categories & categoryMask.CULTURE) !== 0) labels.push("문화");

  return labels.length > 0 ? labels : ["기타"];
}

export function getThemeLabels(themes: number): string[] {
  const labels: string[] = [];

  if ((themes & themeMask.MOOD) !== 0) labels.push("감성");
  if ((themes & themeMask.FOOD) !== 0) labels.push("먹거리");
  if ((themes & themeMask.NATURE) !== 0) labels.push("자연");
  if ((themes & themeMask.QUIET) !== 0) labels.push("조용한");
  if ((themes & themeMask.CULTURE) !== 0) labels.push("문화");

  return labels.length > 0 ? labels : ["기본"];
}
```

---

## 10. 예시 코드 2: 선택 버튼 컴포넌트

`src/components/ui/SelectChip.tsx` 예시다.

```tsx
import { Pressable, StyleSheet, Text } from "react-native";

type SelectChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export default function SelectChip({ label, selected, onPress }: SelectChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.selectedChip]}
    >
      <Text style={[styles.chipText, selected && styles.selectedText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D6DED2",
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    marginBottom: 10,
  },
  selectedChip: {
    backgroundColor: "#2F6F3E",
    borderColor: "#2F6F3E",
  },
  chipText: {
    color: "#263024",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedText: {
    color: "#FFFFFF",
  },
});
```

---

## 11. 예시 코드 3: 장소 카드 컴포넌트

기존 `PlaceCard.tsx`를 아래 방식으로 수정하면 현재 데이터 구조와 맞는다.

```tsx
import { StyleSheet, Text, View } from "react-native";
import { ScoredPlace } from "../types/route";
import { getCategoryLabels, getThemeLabels } from "../utils/labelUtils";

type RoutePlaceCardProps = {
  place: ScoredPlace;
  index: number;
};

export default function RoutePlaceCard({ place, index }: RoutePlaceCardProps) {
  const categories = getCategoryLabels(place.categories).join(" · ");
  const themes = getThemeLabels(place.themes).join(" · ");

  return (
    <View style={styles.card}>
      <View style={styles.numberCircle}>
        <Text style={styles.numberText}>{index + 1}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.meta}>{categories} / {themes}</Text>
        <Text style={styles.description}>{place.description}</Text>
        <Text style={styles.time}>예상 체류 시간: {place.averageTime}분</Text>

        {place.reasons.length > 0 && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonTitle}>추천 이유</Text>
            {place.reasons.map((reason, reasonIndex) => (
              <Text key={reasonIndex} style={styles.reasonText}>• {reason}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DDE5D8",
  },
  numberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#2F6F3E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  numberText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2A1E",
  },
  meta: {
    marginTop: 4,
    color: "#2F6F3E",
    fontWeight: "600",
  },
  description: {
    marginTop: 8,
    color: "#4F5B4C",
    lineHeight: 20,
  },
  time: {
    marginTop: 8,
    fontWeight: "600",
    color: "#333D31",
  },
  reasonBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F3F7EC",
  },
  reasonTitle: {
    fontWeight: "700",
    marginBottom: 4,
    color: "#2F6F3E",
  },
  reasonText: {
    color: "#4F5B4C",
    lineHeight: 19,
  },
});
```

---

## 12. 예시 코드 4: 1페이지 입력 화면 핵심 로직

아래 코드는 `createRoute()`를 사용해 사용자 입력을 최종 경로로 바꾸는 핵심 예시다.

```tsx
import { useState } from "react";
import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import { createRoute } from "../../src/algorithms/routeMaker";
import { FinalRoute } from "../../src/types/route";
import { UserRouteInput } from "../../src/types/userInput";
import { categoryMask, themeMask } from "../../src/types/place";

export default function HomeScreen() {
  const [screen, setScreen] = useState<"input" | "map" | "detail">("input");
  const [totalTime, setTotalTime] = useState(180);
  const [mealRequired, setMealRequired] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(themeMask.MOOD);
  const [selectedCategory, setSelectedCategory] = useState(categoryMask.TOUR);
  const [route, setRoute] = useState<FinalRoute | null>(null);

  function handleCreateRoute() {
    const userInput: UserRouteInput = {
      startTime: "09:00",
      totalAvailableTime: totalTime,
      themes: selectedTheme,
      categories: selectedCategory,
      mealRequired,
      maxPlaceCount: 3,
      startBusStopId: 7,
      endBusStopId: 7,
    };

    const result = createRoute(userInput);
    setRoute(result);
    setScreen("map");
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>여행 조건 선택</Text>
      <Text style={styles.subtitle}>원하는 조건을 선택하면 안동 시내 루트를 추천합니다.</Text>

      <Text style={styles.sectionTitle}>여행 시간</Text>
      <View style={styles.row}>
        <OptionButton label="2시간" selected={totalTime === 120} onPress={() => setTotalTime(120)} />
        <OptionButton label="3시간" selected={totalTime === 180} onPress={() => setTotalTime(180)} />
        <OptionButton label="4시간" selected={totalTime === 240} onPress={() => setTotalTime(240)} />
      </View>

      <Text style={styles.sectionTitle}>식사 여부</Text>
      <View style={styles.row}>
        <OptionButton label="식사 포함" selected={mealRequired} onPress={() => setMealRequired(true)} />
        <OptionButton label="식사 제외" selected={!mealRequired} onPress={() => setMealRequired(false)} />
      </View>

      <Text style={styles.sectionTitle}>테마</Text>
      <View style={styles.row}>
        <OptionButton label="감성" selected={selectedTheme === themeMask.MOOD} onPress={() => setSelectedTheme(themeMask.MOOD)} />
        <OptionButton label="먹거리" selected={selectedTheme === themeMask.FOOD} onPress={() => setSelectedTheme(themeMask.FOOD)} />
        <OptionButton label="자연" selected={selectedTheme === themeMask.NATURE} onPress={() => setSelectedTheme(themeMask.NATURE)} />
        <OptionButton label="문화" selected={selectedTheme === themeMask.CULTURE} onPress={() => setSelectedTheme(themeMask.CULTURE)} />
      </View>

      <Pressable style={styles.mainButton} onPress={handleCreateRoute}>
        <Text style={styles.mainButtonText}>추천 경로 생성하기</Text>
      </Pressable>
    </ScrollView>
  );
}

type OptionButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function OptionButton({ label, selected, onPress }: OptionButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.optionButton, selected && styles.selectedButton]}>
      <Text style={[styles.optionText, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F6F8F2",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2A1E",
    marginTop: 20,
  },
  subtitle: {
    marginTop: 8,
    color: "#5B6657",
    lineHeight: 21,
  },
  sectionTitle: {
    marginTop: 28,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2A1E",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  optionButton: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D6DED2",
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    marginBottom: 10,
  },
  selectedButton: {
    backgroundColor: "#2F6F3E",
    borderColor: "#2F6F3E",
  },
  optionText: {
    color: "#263024",
    fontWeight: "600",
  },
  selectedText: {
    color: "#FFFFFF",
  },
  mainButton: {
    marginTop: 34,
    height: 56,
    borderRadius: 22,
    backgroundColor: "#243C2C",
    alignItems: "center",
    justifyContent: "center",
  },
  mainButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
});
```

위 코드는 핵심 로직만 보여주는 예시다. 실제로는 `screen` 값에 따라 지도 화면과 상세 화면도 조건부로 렌더링해야 한다.

---

## 13. 예시 코드 5: 모의지도 화면

실제 지도 API를 사용하지 않고도 아래처럼 모의지도 화면을 만들 수 있다.

```tsx
import { StyleSheet, Text, View } from "react-native";
import { FinalRoute } from "../types/route";

type MockMapViewProps = {
  route: FinalRoute;
};

const markerPositions: Record<number, { x: number; y: number }> = {
  1: { x: 120, y: 120 },
  2: { x: 130, y: 135 },
  3: { x: 140, y: 150 },
  4: { x: 95, y: 170 },
  5: { x: 160, y: 155 },
  6: { x: 260, y: 90 },
  7: { x: 170, y: 145 },
  8: { x: 270, y: 105 },
  9: { x: 190, y: 135 },
};

export default function MockMapView({ route }: MockMapViewProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>모의지도 경로</Text>
      <View style={styles.mapBox}>
        <View style={styles.river} />
        <View style={styles.roadOne} />
        <View style={styles.roadTwo} />

        {route.places.map((place, index) => {
          const position = markerPositions[place.id] ?? { x: 40 + index * 50, y: 120 };

          return (
            <View
              key={place.id}
              style={[styles.markerWrap, { left: position.x, top: position.y }]}
            >
              <View style={styles.marker}>
                <Text style={styles.markerText}>{index + 1}</Text>
              </View>
              <Text style={styles.markerLabel}>{place.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE5D8",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    color: "#1F2A1E",
  },
  mapBox: {
    height: 360,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#E5EBDD",
    position: "relative",
  },
  river: {
    position: "absolute",
    left: -30,
    top: 130,
    width: 420,
    height: 44,
    backgroundColor: "#B4D4DD",
    transform: [{ rotate: "12deg" }],
  },
  roadOne: {
    position: "absolute",
    left: 40,
    top: 210,
    width: 300,
    height: 12,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "-25deg" }],
  },
  roadTwo: {
    position: "absolute",
    left: 50,
    top: 110,
    width: 270,
    height: 12,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "18deg" }],
  },
  markerWrap: {
    position: "absolute",
    alignItems: "center",
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2F6F3E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  markerText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  markerLabel: {
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: "700",
    color: "#263024",
  },
});
```

이 예시는 실제 경로선을 완벽하게 그리지는 않는다. 발표용 완성도를 높이려면 장소 마커 사이를 연결하는 `View` 선 또는 `react-native-svg` 선을 추가하면 된다. 다만 외부 라이브러리를 새로 설치하지 않을 계획이라면, 우선 마커와 지도 배경만 구현해도 충분하다.

---

## 14. 예시 코드 6: 경로 상세 설명 화면

```tsx
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FinalRoute } from "../types/route";
import RoutePlaceCard from "./RoutePlaceCard";

type RouteDetailScreenProps = {
  route: FinalRoute;
};

export default function RouteDetailScreen({ route }: RouteDetailScreenProps) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>경로 상세 설명</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.routeTitle}>{route.routeTitle}</Text>
        <Text style={styles.summary}>{route.summary}</Text>
        <Text style={styles.timeText}>총 소요 시간: {route.timeSummary.totalTime}분</Text>
        <Text style={styles.timeText}>도보 시간: {route.timeSummary.walkingTime}분</Text>
        <Text style={styles.timeText}>체류 시간: {route.timeSummary.stayTime}분</Text>
        <Text style={styles.timeText}>버스 시간: {route.timeSummary.busTime}분</Text>
      </View>

      {route.warnings.length > 0 && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>안내</Text>
          {route.warnings.map((warning, index) => (
            <Text key={index} style={styles.warningText}>• {warning}</Text>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>방문 장소</Text>
      {route.places.map((place, index) => (
        <RoutePlaceCard key={place.id} place={place} index={index} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F6F8F2",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2A1E",
    marginTop: 20,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: "#243C2C",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  routeTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },
  summary: {
    color: "#D8EAD9",
    marginTop: 8,
    lineHeight: 21,
  },
  timeText: {
    color: "#FFFFFF",
    marginTop: 6,
    fontWeight: "600",
  },
  warningCard: {
    backgroundColor: "#FFF7E8",
    borderColor: "#EFD7AF",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  warningTitle: {
    fontWeight: "800",
    color: "#7A4F12",
    marginBottom: 6,
  },
  warningText: {
    color: "#7A4F12",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2A1E",
    marginBottom: 12,
  },
});
```

---

## 15. UI 구현 순서

UI 담당자는 아래 순서대로 구현하면 된다.

### 1단계: 기존 UI 오류 정리

- `PlaceCard.tsx`에서 존재하지 않는 필드 사용 여부 확인
- `filterPlacesByMood` import 사용 여부 확인
- 현재 타입 구조에 맞게 `Place`, `ScoredPlace`, `FinalRoute` 기준으로 수정

### 2단계: 입력 화면 구현

- 시간 선택 버튼 만들기
- 식사 여부 선택 버튼 만들기
- 테마 선택 버튼 만들기
- `UserRouteInput` 생성하기
- `createRoute()` 실행하기

### 3단계: 결과 상태 저장

- `const [route, setRoute] = useState<FinalRoute | null>(null);`
- `createRoute()` 결과를 `route` 상태에 저장
- 결과가 없으면 지도/상세 화면으로 못 넘어가게 처리

### 4단계: 모의지도 화면 구현

- 지도 배경 박스 만들기
- 장소 마커 표시
- 방문 순서 번호 표시
- 지도 아래에 경로 요약 카드 표시

### 5단계: 상세 설명 화면 구현

- `route.routeTitle`
- `route.summary`
- `route.timeSummary`
- `route.places`
- `route.warnings`

위 값들을 카드 형태로 출력한다.

---

## 16. 최소 완성 기준

시간이 부족할 경우 아래 항목만 구현해도 UI 파트는 최소 완성으로 볼 수 있다.

- [ ] 1페이지에서 테마와 식사 여부를 선택할 수 있다.
- [ ] 버튼을 누르면 `createRoute()`가 실행된다.
- [ ] 추천된 장소 목록이 화면에 표시된다.
- [ ] 모의지도 화면에 장소 마커가 표시된다.
- [ ] 상세 화면에 장소별 설명과 추천 이유가 표시된다.
- [ ] 기존 `PlaceCard`의 잘못된 필드 사용을 수정했다.

---

## 17. 발표용 완성도를 높이는 추가 요소

시간이 남는다면 아래 요소를 추가하면 좋다.

- [ ] 선택된 테마를 화면 상단에 태그로 표시
- [ ] 지도 화면에서 현재 위치 마커 강조
- [ ] 경로선 추가
- [ ] 장소 카드에 추천 점수 `score` 표시
- [ ] `warnings`가 있으면 노란 안내 카드로 표시
- [ ] 버스 정보 카드 추가
- [ ] “다시 조건 선택하기” 버튼 추가
- [ ] “다음 장소 보기” 버튼 추가

---

## 18. 팀원에게 전달할 핵심 요약

UI 담당자는 아래 문장을 기준으로 작업하면 된다.

> UI 파트는 사용자가 여행 조건을 선택하면 `UserRouteInput`을 만들고, 알고리즘의 `createRoute()`를 실행한 뒤, 반환된 `FinalRoute`를 3개 화면에 나누어 보여준다. 첫 화면은 조건 선택, 두 번째 화면은 모의지도와 마커, 세 번째 화면은 장소별 추천 이유와 시간 요약을 보여주는 방식으로 구현한다.

---

## 19. GitHub에 올리는 방법

이 문서는 아래 위치에 두는 것을 추천한다.

```text
docs/UI_PART_GUIDEBOOK.md
```

이미지 파일은 아래 위치에 둔다.

```text
docs/images/ui_screen_01_input.png
docs/images/ui_screen_02_map.png
docs/images/ui_screen_03_detail.png
```

README에서 UI 가이드북 링크는 아래처럼 수정하면 된다.

```md
- [UI 파트 가이드북](./docs/UI_PART_GUIDEBOOK.md)
```

---

## 20. 최종 결론

UI는 복잡하게 만들 필요가 없다. 중요한 것은 다음 세 가지다.

1. 사용자가 조건을 선택할 수 있어야 한다.
2. 추천 결과가 지도처럼 보여야 한다.
3. 왜 그 경로가 추천되었는지 설명되어야 한다.

따라서 이번 프로젝트의 UI 목표는 **입력 화면 → 모의지도 화면 → 경로 상세 설명 화면**의 흐름을 안정적으로 구현하는 것이다.
