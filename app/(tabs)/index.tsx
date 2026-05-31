import React, { useMemo, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { createRoute } from "../../src/algorithms/routeMaker";
import { busStops } from "../../src/data/busStop";
import { places } from "../../src/data/places";
import { categoryMask, themeMask } from "../../src/types/place";

import type { Place } from "../../src/types/place";
import type { FinalRoute } from "../../src/types/route";
import type { UserRouteInput } from "../../src/types/userInput";

const andongMapImage = require("../../assets/images/andong_map.png");

type Step = "input" | "map" | "detail";

type Option = {
  label: string;
  value: number;
};

type MapPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: "start" | "place" | "end";
  order?: number;
};

const categoryOptions: Option[] = [
  { label: "관광", value: categoryMask.TOUR },
  { label: "먹거리", value: categoryMask.FOOD },
  { label: "카페", value: categoryMask.CAFE },
  { label: "문화", value: categoryMask.CULTURE },
];

const themeOptions: Option[] = [
  { label: "감성", value: themeMask.MOOD },
  { label: "먹거리", value: themeMask.FOOD },
  { label: "자연", value: themeMask.NATURE },
  { label: "조용한", value: themeMask.QUIET },
  { label: "문화", value: themeMask.CULTURE },
];

const startTimeOptions = ["09:00", "10:00", "11:00", "13:00", "15:00"];
const timeLimitOptions = [120, 180, 240, 300, 420];
const maxPlaceOptions = [2, 3, 4, 5];

const DEFAULT_INPUT: UserRouteInput = {
  startTime: "10:00",
  totalAvailableTime: 300,
  themes: themeMask.MOOD | themeMask.FOOD,
  categories: categoryMask.TOUR | categoryMask.FOOD | categoryMask.CAFE,
  mealRequired: true,
  maxPlaceCount: 4,
  startBusStopId: 7, // 국립경국대
  endBusStopId: 7, // 국립경국대 복귀
};

export default function HomeScreen() {
  const [step, setStep] = useState<Step>("input");
  const [input, setInput] = useState<UserRouteInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<FinalRoute | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const matchedPlaceCount = useMemo(() => {
    return places.filter((place) => {
      const categoryMatched =
        input.categories === 0 || (place.categories & input.categories) !== 0;
      const themeMatched =
        input.themes === 0 || (place.themes & input.themes) !== 0;

      return categoryMatched && themeMatched;
    }).length;
  }, [input.categories, input.themes]);

  const toggleMask = (field: "categories" | "themes", value: number) => {
    setInput((prev) => ({
      ...prev,
      [field]:
        (prev[field] & value) !== 0
          ? prev[field] & ~value
          : prev[field] | value,
    }));
  };

  const runRouteAlgorithm = () => {
    try {
      setErrorMessage("");

      const route = createRoute(input);

      setResult(route);
      setStep("map");
    } catch (error) {
      setResult(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Andong Travel Route</Text>
        <Text style={styles.title}>안동 여행 루트 자동 생성</Text>
        <Text style={styles.description}>
          UI 입력값 → 데이터 필터링 → 알고리즘 실행 → 모의지도/경로 설명까지
          한 화면에서 연결한 통합 index 화면입니다.
        </Text>
      </View>

      <StepTabs step={step} setStep={setStep} hasResult={result !== null} />

      {step === "input" && (
        <InputSection
          input={input}
          setInput={setInput}
          matchedPlaceCount={matchedPlaceCount}
          toggleMask={toggleMask}
          runRouteAlgorithm={runRouteAlgorithm}
          errorMessage={errorMessage}
        />
      )}

      {step === "map" && (
        <MapSection
          input={input}
          result={result}
          goToInput={() => setStep("input")}
          goToDetail={() => setStep("detail")}
        />
      )}

      {step === "detail" && (
        <DetailSection
          input={input}
          result={result}
          goToInput={() => setStep("input")}
          goToMap={() => setStep("map")}
        />
      )}
    </ScrollView>
  );
}

function StepTabs({
  step,
  setStep,
  hasResult,
}: {
  step: Step;
  setStep: (step: Step) => void;
  hasResult: boolean;
}) {
  const tabs: { label: string; value: Step; disabled?: boolean }[] = [
    { label: "1. 입력", value: "input" },
    { label: "2. 지도", value: "map", disabled: !hasResult },
    { label: "3. 설명", value: "detail", disabled: !hasResult },
  ];

  return (
    <View style={styles.tabWrap}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.value}
          disabled={tab.disabled}
          onPress={() => setStep(tab.value)}
          style={[
            styles.tab,
            step === tab.value && styles.activeTab,
            tab.disabled && styles.disabledTab,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              step === tab.value && styles.activeTabText,
              tab.disabled && styles.disabledTabText,
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function InputSection({
  input,
  setInput,
  matchedPlaceCount,
  toggleMask,
  runRouteAlgorithm,
  errorMessage,
}: {
  input: UserRouteInput;
  setInput: React.Dispatch<React.SetStateAction<UserRouteInput>>;
  matchedPlaceCount: number;
  toggleMask: (field: "categories" | "themes", value: number) => void;
  runRouteAlgorithm: () => void;
  errorMessage: string;
}) {
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>데이터 연결 상태</Text>

        <View style={styles.statsRow}>
          <Stat label="장소 데이터" value={`${places.length}개`} />
          <Stat label="정류장 데이터" value={`${busStops.length}개`} />
          <Stat label="조건 일치" value={`${matchedPlaceCount}개`} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>사용자 조건 입력</Text>

        <Text style={styles.groupLabel}>출발 시간</Text>
        <ChipWrap>
          {startTimeOptions.map((time) => (
            <Chip
              key={time}
              label={time}
              selected={input.startTime === time}
              onPress={() =>
                setInput((prev) => ({
                  ...prev,
                  startTime: time,
                }))
              }
            />
          ))}
        </ChipWrap>

        <Text style={styles.groupLabel}>사용 가능 시간</Text>
        <ChipWrap>
          {timeLimitOptions.map((minutes) => (
            <Chip
              key={minutes}
              label={`${minutes}분`}
              selected={input.totalAvailableTime === minutes}
              onPress={() =>
                setInput((prev) => ({
                  ...prev,
                  totalAvailableTime: minutes,
                }))
              }
            />
          ))}
        </ChipWrap>

        <Text style={styles.groupLabel}>최대 방문 장소 수</Text>
        <ChipWrap>
          {maxPlaceOptions.map((count) => (
            <Chip
              key={count}
              label={`${count}곳`}
              selected={input.maxPlaceCount === count}
              onPress={() =>
                setInput((prev) => ({
                  ...prev,
                  maxPlaceCount: count,
                }))
              }
            />
          ))}
        </ChipWrap>

        <Text style={styles.groupLabel}>카테고리</Text>
        <ChipWrap>
          {categoryOptions.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              selected={(input.categories & option.value) !== 0}
              onPress={() => toggleMask("categories", option.value)}
            />
          ))}
        </ChipWrap>

        <Text style={styles.groupLabel}>테마</Text>
        <ChipWrap>
          {themeOptions.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              selected={(input.themes & option.value) !== 0}
              onPress={() => toggleMask("themes", option.value)}
            />
          ))}
        </ChipWrap>

        <Text style={styles.groupLabel}>식사 포함 여부</Text>
        <ChipWrap>
          <Chip
            label="식사 포함"
            selected={input.mealRequired}
            onPress={() =>
              setInput((prev) => ({
                ...prev,
                mealRequired: true,
              }))
            }
          />
          <Chip
            label="상관없음"
            selected={!input.mealRequired}
            onPress={() =>
              setInput((prev) => ({
                ...prev,
                mealRequired: false,
              }))
            }
          />
        </ChipWrap>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>버스 시작/종료 정류장</Text>

        <Text style={styles.groupLabel}>출발 정류장</Text>
        <ChipWrap>
          {busStops.map((stop) => (
            <Chip
              key={`start-${stop.id}`}
              label={stop.name}
              selected={input.startBusStopId === stop.id}
              onPress={() =>
                setInput((prev) => ({
                  ...prev,
                  startBusStopId: stop.id,
                }))
              }
            />
          ))}
        </ChipWrap>

        <Text style={styles.groupLabel}>복귀 정류장</Text>
        <ChipWrap>
          {busStops.map((stop) => (
            <Chip
              key={`end-${stop.id}`}
              label={stop.name}
              selected={input.endBusStopId === stop.id}
              onPress={() =>
                setInput((prev) => ({
                  ...prev,
                  endBusStopId: stop.id,
                }))
              }
            />
          ))}
        </ChipWrap>

        <View style={styles.inputSummary}>
          <Text style={styles.summaryText}>
            카테고리: {formatMask(input.categories, categoryOptions)}
          </Text>
          <Text style={styles.summaryText}>
            테마: {formatMask(input.themes, themeOptions)}
          </Text>
          <Text style={styles.summaryText}>
            출발: {getBusStopName(input.startBusStopId)}
          </Text>
          <Text style={styles.summaryText}>
            복귀: {getBusStopName(input.endBusStopId)}
          </Text>
        </View>

        <Pressable style={styles.mainButton} onPress={runRouteAlgorithm}>
          <Text style={styles.mainButtonText}>경로 생성하기</Text>
        </Pressable>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>오류: {errorMessage}</Text>
          </View>
        ) : null}
      </View>
    </>
  );
}

function MapSection({
  input,
  result,
  goToInput,
  goToDetail,
}: {
  input: UserRouteInput;
  result: FinalRoute | null;
  goToInput: () => void;
  goToDetail: () => void;
}) {
  if (!result) {
    return (
      <EmptyResult
        title="아직 생성된 경로가 없습니다."
        description="입력 화면에서 경로 생성하기를 먼저 눌러주세요."
        onPress={goToInput}
      />
    );
  }

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>추천 경로 지도</Text>
        <Text style={styles.description}>
          장소 데이터의 위도/경도를 이용해 모의지도 위에 마커를 표시합니다.
        </Text>

        <RouteMap input={input} result={result} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{result.routeTitle}</Text>
        <Text style={styles.description}>{result.summary}</Text>

        <View style={styles.statsRow}>
          <Stat label="총 소요" value={`${result.timeSummary.totalTime}분`} />
          <Stat label="체류" value={`${result.timeSummary.stayTime}분`} />
          <Stat label="도보" value={`${result.timeSummary.walkingTime}분`} />
        </View>

        <View style={styles.statsRow}>
          <Stat label="버스" value={`${result.timeSummary.busTime}분`} />
          <Stat label="대기" value={`${result.timeSummary.busWaitTime}분`} />
          <Stat label="장소" value={`${result.places.length}곳`} />
        </View>

        {result.warnings.length > 0 ? (
          <View style={styles.warningBox}>
            {result.warnings.map((warning, index) => (
              <Text key={index} style={styles.warningText}>
                ⚠ {warning}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.buttonRow}>
          <Pressable style={styles.subButton} onPress={goToInput}>
            <Text style={styles.subButtonText}>조건 수정</Text>
          </Pressable>
          <Pressable style={styles.mainButtonFlex} onPress={goToDetail}>
            <Text style={styles.mainButtonText}>경로 설명 보기</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

function DetailSection({
  input,
  result,
  goToInput,
  goToMap,
}: {
  input: UserRouteInput;
  result: FinalRoute | null;
  goToInput: () => void;
  goToMap: () => void;
}) {
  if (!result) {
    return (
      <EmptyResult
        title="아직 생성된 경로가 없습니다."
        description="입력 화면에서 경로 생성하기를 먼저 눌러주세요."
        onPress={goToInput}
      />
    );
  }

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>버스 이동 요약</Text>

        {result.startBus ? (
          <BusInfo title="출발 버스" bus={result.startBus} />
        ) : (
          <Text style={styles.description}>
            출발 버스 정보가 없습니다. 가까운 정류장이거나 시간표가 없을 수
            있습니다.
          </Text>
        )}

        {result.returnBus ? (
          <BusInfo title="복귀 버스" bus={result.returnBus} />
        ) : (
          <Text style={styles.description}>
            복귀 버스 정보가 없습니다. 마지막 장소에서 직접 이동하거나 시간표
            확인이 필요합니다.
          </Text>
        )}

        <View style={styles.inputSummary}>
          <Text style={styles.summaryText}>
            출발 정류장: {getBusStopName(input.startBusStopId)}
          </Text>
          <Text style={styles.summaryText}>
            복귀 정류장: {getBusStopName(input.endBusStopId)}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>추천 장소 순서</Text>

        {result.places.map((place, index) => (
          <View key={place.id} style={styles.placeCard}>
            <Text style={styles.placeNumber}>{index + 1}</Text>
            <View style={styles.placeBody}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeDescription}>{place.description}</Text>
              <Text style={styles.placeMeta}>
                점수 {place.score}점 · 체류 {place.averageTime}분 · 가까운
                정류장 {getBusStopName(place.nearestBusStopId)}
              </Text>

              {place.reasons.length > 0 ? (
                <View style={styles.reasonBox}>
                  {place.reasons.map((reason, reasonIndex) => (
                    <Text key={reasonIndex} style={styles.reasonText}>
                      · {reason}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>장소 간 이동 경로</Text>

        {result.paths.length === 0 ? (
          <Text style={styles.description}>장소 간 이동 경로가 없습니다.</Text>
        ) : (
          result.paths.map((path, index) => (
            <View key={`${path.from}-${path.to}-${index}`} style={styles.pathCard}>
              <Text style={styles.pathTitle}>
                {index + 1}구간: {getPlaceName(path.from)} →{" "}
                {getPlaceName(path.to)}
              </Text>
              <Text style={styles.pathText}>
                거리 약 {Math.round(path.distance)}m
              </Text>

              {path.bus ? (
                <Text style={styles.pathText}>
                  이동: {path.bus.busNumber}번 버스 · 대기{" "}
                  {path.bus.waitTime}분 · 탑승 {path.bus.rideTime}분
                </Text>
              ) : (
                <Text style={styles.pathText}>
                  이동: 도보 약 {path.walkTime}분
                </Text>
              )}
            </View>
          ))
        )}

        <View style={styles.buttonRow}>
          <Pressable style={styles.subButton} onPress={goToMap}>
            <Text style={styles.subButtonText}>지도 보기</Text>
          </Pressable>
          <Pressable style={styles.mainButtonFlex} onPress={goToInput}>
            <Text style={styles.mainButtonText}>다시 생성</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

function RouteMap({
  input,
  result,
}: {
  input: UserRouteInput;
  result: FinalRoute;
}) {
  const mapPoints = useMemo(() => {
    const startStop = busStops.find((stop) => stop.id === input.startBusStopId);
    const endStop = busStops.find((stop) => stop.id === input.endBusStopId);

    const points: MapPoint[] = [];

    if (startStop) {
      points.push({
        id: `start-${startStop.id}`,
        name: startStop.name,
        latitude: startStop.latitude,
        longitude: startStop.longitude,
        type: "start",
      });
    }

    result.places.forEach((place, index) => {
      points.push({
        id: `place-${place.id}`,
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        type: "place",
        order: index + 1,
      });
    });

    if (endStop) {
      points.push({
        id: `end-${endStop.id}`,
        name: endStop.name,
        latitude: endStop.latitude,
        longitude: endStop.longitude,
        type: "end",
      });
    }

    return points;
  }, [input.endBusStopId, input.startBusStopId, result.places]);

  const bounds = useMemo(() => makeBounds(mapPoints), [mapPoints]);

  return (
    <View>
      <ImageBackground
        source={andongMapImage}
        style={styles.map}
        imageStyle={styles.mapImage}
      >
        <View style={styles.mapDim} />

        {mapPoints.map((point) => {
          const position = toMapPercent(point, bounds);

          return (
            <View
              key={point.id}
              style={[
                styles.mapMarkerWrap,
                {
                  left: `${position.left}%`,
                  top: `${position.top}%`,
                },
              ]}
            >
              <View
                style={[
                  styles.mapMarker,
                  point.type === "start" && styles.startMarker,
                  point.type === "end" && styles.endMarker,
                ]}
              >
                <Text style={styles.mapMarkerText}>
                  {point.type === "start"
                    ? "S"
                    : point.type === "end"
                      ? "E"
                      : point.order}
                </Text>
              </View>
              <Text numberOfLines={1} style={styles.mapMarkerLabel}>
                {point.name}
              </Text>
            </View>
          );
        })}
      </ImageBackground>

      <View style={styles.routeFlow}>
        <Text style={styles.flowText}>
          {getBusStopName(input.startBusStopId)}
        </Text>

        {result.places.map((place) => (
          <React.Fragment key={place.id}>
            <Text style={styles.flowArrow}>↓</Text>
            <Text style={styles.flowText}>{place.name}</Text>
          </React.Fragment>
        ))}

        <Text style={styles.flowArrow}>↓</Text>
        <Text style={styles.flowText}>{getBusStopName(input.endBusStopId)}</Text>
      </View>
    </View>
  );
}

function BusInfo({
  title,
  bus,
}: {
  title: string;
  bus: NonNullable<FinalRoute["startBus"]>;
}) {
  return (
    <View style={styles.busCard}>
      <Text style={styles.busTitle}>{title}</Text>
      <Text style={styles.busText}>
        {bus.busNumber}번 · {getBusStopName(bus.fromBusStopId)} →{" "}
        {getBusStopName(bus.toBusStopId)}
      </Text>
      <Text style={styles.busText}>
        출발 {bus.departureTime} · 도착 {bus.arrivalTime}
      </Text>
      <Text style={styles.busText}>
        대기 {bus.waitTime}분 · 탑승 {bus.rideTime}분
      </Text>
    </View>
  );
}

function EmptyResult({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable style={styles.mainButton} onPress={onPress}>
        <Text style={styles.mainButtonText}>입력 화면으로 이동</Text>
      </Pressable>
    </View>
  );
}

function ChipWrap({ children }: { children: React.ReactNode }) {
  return <View style={styles.chipWrap}>{children}</View>;
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.selectedChip]}
    >
      <Text style={[styles.chipText, selected && styles.selectedChipText]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function getBusStopName(id: number) {
  return busStops.find((stop) => stop.id === id)?.name ?? `정류장 ${id}`;
}

function getPlaceName(id: number) {
  return places.find((place) => place.id === id)?.name ?? `장소 ${id}`;
}

function formatMask(value: number, options: Option[]) {
  const selected = options
    .filter((option) => (value & option.value) !== 0)
    .map((option) => option.label);

  return selected.length > 0 ? selected.join(", ") : "선택 없음";
}

function makeBounds(points: MapPoint[]) {
  const safePoints =
    points.length > 0
      ? points
      : places.map((place) => ({
          id: String(place.id),
          name: place.name,
          latitude: place.latitude,
          longitude: place.longitude,
          type: "place" as const,
        }));

  const latitudes = safePoints.map((point) => point.latitude);
  const longitudes = safePoints.map((point) => point.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  return {
    minLat,
    maxLat: maxLat === minLat ? maxLat + 0.001 : maxLat,
    minLon,
    maxLon: maxLon === minLon ? maxLon + 0.001 : maxLon,
  };
}

function toMapPercent(
  point: Pick<Place, "latitude" | "longitude">,
  bounds: ReturnType<typeof makeBounds>
) {
  const horizontalPadding = 10;
  const verticalPadding = 12;

  const rawLeft =
    ((point.longitude - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 100;

  const rawTop =
    (1 - (point.latitude - bounds.minLat) / (bounds.maxLat - bounds.minLat)) *
    100;

  return {
    left:
      horizontalPadding +
      (rawLeft * (100 - horizontalPadding * 2)) / 100,
    top: verticalPadding + (rawTop * (100 - verticalPadding * 2)) / 100,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 8,
    paddingTop: 8,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4B5563",
  },
  tabWrap: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    padding: 4,
    borderRadius: 999,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#111827",
  },
  disabledTab: {
    opacity: 0.45,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  disabledTabText: {
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111827",
  },
  groupLabel: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
  },
  statValue: {
    marginTop: 4,
    fontSize: 17,
    color: "#2563EB",
    fontWeight: "900",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedChip: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
  },
  selectedChipText: {
    color: "#FFFFFF",
  },
  inputSummary: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    gap: 4,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#374151",
    fontWeight: "600",
  },
  mainButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  mainButtonFlex: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  mainButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  subButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#EEF2FF",
  },
  subButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#3730A3",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  errorBox: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#B91C1C",
    fontWeight: "800",
  },
  warningBox: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFFBEB",
    gap: 4,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#92400E",
    fontWeight: "700",
  },
  map: {
    height: 260,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  mapImage: {
    borderRadius: 18,
  },
  mapDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  mapMarkerWrap: {
    position: "absolute",
    width: 86,
    marginLeft: -43,
    marginTop: -20,
    alignItems: "center",
  },
  mapMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  startMarker: {
    backgroundColor: "#2563EB",
  },
  endMarker: {
    backgroundColor: "#111827",
  },
  mapMarkerText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  mapMarkerLabel: {
    marginTop: 4,
    maxWidth: 86,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(17,24,39,0.84)",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
  routeFlow: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    gap: 4,
  },
  flowText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  flowArrow: {
    fontSize: 14,
    fontWeight: "900",
    color: "#2563EB",
  },
  busCard: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: 4,
  },
  busTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1D4ED8",
  },
  busText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#1F2937",
    fontWeight: "600",
  },
  placeCard: {
    flexDirection: "row",
    gap: 12,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  placeNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "900",
  },
  placeBody: {
    flex: 1,
    gap: 4,
  },
  placeName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  placeDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#4B5563",
  },
  placeMeta: {
    fontSize: 12,
    lineHeight: 18,
    color: "#2563EB",
    fontWeight: "800",
  },
  reasonBox: {
    marginTop: 4,
    gap: 2,
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#374151",
  },
  pathCard: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    gap: 4,
  },
  pathTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },
  pathText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#4B5563",
    fontWeight: "600",
  },
});
