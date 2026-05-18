import { useMemo, useState } from "react";
import {
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
import type { FinalRoute } from "../../src/types/route";
import type { UserRouteInput } from "../../src/types/userInput";

const categoryOptions = [
  { label: "관광", value: categoryMask.TOUR },
  { label: "먹거리", value: categoryMask.FOOD },
  { label: "카페", value: categoryMask.CAFE },
  { label: "문화", value: categoryMask.CULTURE },
];

const themeOptions = [
  { label: "감성", value: themeMask.MOOD },
  { label: "먹거리", value: themeMask.FOOD },
  { label: "자연", value: themeMask.NATURE },
  { label: "조용한", value: themeMask.QUIET },
  { label: "문화", value: themeMask.CULTURE },
];

const startTimeOptions = ["09:00", "10:00", "11:00", "13:00", "15:00"];
const timeLimitOptions = [120, 180, 240, 300, 420];
const maxPlaceOptions = [2, 3, 4, 5];

function getBusStopName(id: number) {
  return busStops.find((stop) => stop.id === id)?.name ?? `정류장 ${id}`;
}

function formatMask(
  value: number,
  options: {
    label: string;
    value: number;
  }[]
) {
  const selected = options
    .filter((option) => (value & option.value) !== 0)
    .map((option) => option.label);

  return selected.length > 0 ? selected.join(", ") : "선택 없음";
}

export default function HomeScreen() {
  const [input, setInput] = useState<UserRouteInput>({
    startTime: "10:00",
    totalAvailableTime: 300,
    themes: themeMask.MOOD | themeMask.FOOD,
    categories: categoryMask.TOUR | categoryMask.FOOD,
    mealRequired: true,
    maxPlaceCount: 4,
    startBusStopId: 1,
    endBusStopId: 3,
  });

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

  const toggleCategory = (value: number) => {
    setInput((prev) => ({
      ...prev,
      categories:
        (prev.categories & value) !== 0
          ? prev.categories & ~value
          : prev.categories | value,
    }));
  };

  const toggleTheme = (value: number) => {
    setInput((prev) => ({
      ...prev,
      themes:
        (prev.themes & value) !== 0
          ? prev.themes & ~value
          : prev.themes | value,
    }));
  };

  const runAlgorithmTest = () => {
    try {
      setErrorMessage("");
      const route = createRoute(input);
      setResult(route);
    } catch (error) {
      setResult(null);
      setErrorMessage(
        error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>데이터 · 알고리즘 테스트 UI</Text>
      <Text style={styles.description}>
        장소 데이터, 버스 정류장 데이터, 경로 생성 알고리즘이 정상적으로 연결되는지 확인하는 임시 화면입니다.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. 데이터 로딩 확인</Text>

        <View style={styles.row}>
          <Text style={styles.label}>장소 데이터</Text>
          <Text style={styles.value}>{places.length}개</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>버스 정류장 데이터</Text>
          <Text style={styles.value}>{busStops.length}개</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>현재 조건과 맞는 장소</Text>
          <Text style={styles.value}>{matchedPlaceCount}개</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>2. 사용자 입력값</Text>

        <Text style={styles.label}>출발 시간</Text>
        <View style={styles.chipWrap}>
          {startTimeOptions.map((time) => (
            <Chip
              key={time}
              label={time}
              selected={input.startTime === time}
              onPress={() => setInput((prev) => ({ ...prev, startTime: time }))}
            />
          ))}
        </View>

        <Text style={styles.label}>사용 가능 시간</Text>
        <View style={styles.chipWrap}>
          {timeLimitOptions.map((minutes) => (
            <Chip
              key={minutes}
              label={`${minutes}분`}
              selected={input.totalAvailableTime === minutes}
              onPress={() =>
                setInput((prev) => ({ ...prev, totalAvailableTime: minutes }))
              }
            />
          ))}
        </View>

        <Text style={styles.label}>최대 방문 장소 수</Text>
        <View style={styles.chipWrap}>
          {maxPlaceOptions.map((count) => (
            <Chip
              key={count}
              label={`${count}곳`}
              selected={input.maxPlaceCount === count}
              onPress={() =>
                setInput((prev) => ({ ...prev, maxPlaceCount: count }))
              }
            />
          ))}
        </View>

        <Text style={styles.label}>카테고리</Text>
        <View style={styles.chipWrap}>
          {categoryOptions.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              selected={(input.categories & option.value) !== 0}
              onPress={() => toggleCategory(option.value)}
            />
          ))}
        </View>

        <Text style={styles.label}>테마</Text>
        <View style={styles.chipWrap}>
          {themeOptions.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              selected={(input.themes & option.value) !== 0}
              onPress={() => toggleTheme(option.value)}
            />
          ))}
        </View>

        <Text style={styles.label}>식사 포함 여부</Text>
        <View style={styles.chipWrap}>
          <Chip
            label="식사 필요"
            selected={input.mealRequired}
            onPress={() => setInput((prev) => ({ ...prev, mealRequired: true }))}
          />
          <Chip
            label="식사 불필요"
            selected={!input.mealRequired}
            onPress={() =>
              setInput((prev) => ({ ...prev, mealRequired: false }))
            }
          />
        </View>

        <Text style={styles.label}>출발 정류장</Text>
        <View style={styles.chipWrap}>
          {busStops.slice(0, 7).map((stop) => (
            <Chip
              key={stop.id}
              label={stop.name}
              selected={input.startBusStopId === stop.id}
              onPress={() =>
                setInput((prev) => ({ ...prev, startBusStopId: stop.id }))
              }
            />
          ))}
        </View>

        <Text style={styles.label}>도착 정류장</Text>
        <View style={styles.chipWrap}>
          {busStops.slice(0, 7).map((stop) => (
            <Chip
              key={stop.id}
              label={stop.name}
              selected={input.endBusStopId === stop.id}
              onPress={() =>
                setInput((prev) => ({ ...prev, endBusStopId: stop.id }))
              }
            />
          ))}
        </View>

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
            도착: {getBusStopName(input.endBusStopId)}
          </Text>
        </View>

        <Pressable style={styles.mainButton} onPress={runAlgorithmTest}>
          <Text style={styles.mainButtonText}>경로 생성 테스트 실행</Text>
        </Pressable>
      </View>

      {errorMessage ? (
        <View style={[styles.card, styles.errorCard]}>
          <Text style={styles.sectionTitle}>오류 발생</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {result ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. 알고리즘 결과</Text>

          <Text style={styles.resultTitle}>{result.routeTitle}</Text>
          <Text style={styles.description}>{result.summary}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>총 소요 시간</Text>
            <Text style={styles.value}>{result.timeSummary.totalTime}분</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>체류 시간</Text>
            <Text style={styles.value}>{result.timeSummary.stayTime}분</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>도보 시간</Text>
            <Text style={styles.value}>{result.timeSummary.walkingTime}분</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>버스 시간</Text>
            <Text style={styles.value}>{result.timeSummary.busTime}분</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>버스 대기</Text>
            <Text style={styles.value}>{result.timeSummary.busWaitTime}분</Text>
          </View>

          {result.startBus ? (
            <BusInfo title="출발 버스" bus={result.startBus} />
          ) : (
            <Text style={styles.warningText}>출발 버스 없음 또는 같은 정류장</Text>
          )}

          {result.returnBus ? (
            <BusInfo title="복귀 버스" bus={result.returnBus} />
          ) : (
            <Text style={styles.warningText}>복귀 버스 없음 또는 같은 정류장</Text>
          )}

          {result.warnings.length > 0 ? (
            <View style={styles.warningBox}>
              {result.warnings.map((warning, index) => (
                <Text key={index} style={styles.warningText}>
                  ⚠ {warning}
                </Text>
              ))}
            </View>
          ) : null}

          <Text style={styles.sectionSubTitle}>추천 장소 순서</Text>

          {result.places.map((place, index) => (
            <View key={place.id} style={styles.placeCard}>
              <Text style={styles.placeName}>
                {index + 1}. {place.name}
              </Text>
              <Text style={styles.placeDescription}>{place.description}</Text>
              <Text style={styles.summaryText}>점수: {place.score}</Text>
              <Text style={styles.summaryText}>
                체류 시간: {place.averageTime}분
              </Text>
              <Text style={styles.summaryText}>
                가까운 정류장: {getBusStopName(place.nearestBusStopId)}
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
          ))}

          <Text style={styles.sectionSubTitle}>장소 간 이동 경로</Text>

          {result.paths.length === 0 ? (
            <Text style={styles.description}>장소 간 이동 경로가 없습니다.</Text>
          ) : (
            result.paths.map((path, index) => (
              <View key={`${path.from}-${path.to}-${index}`} style={styles.pathCard}>
                <Text style={styles.summaryText}>
                  {index + 1}구간: 장소 {path.from} → 장소 {path.to}
                </Text>
                <Text style={styles.summaryText}>거리: {path.distance}m</Text>
                {path.bus ? (
                  <Text style={styles.summaryText}>
                    이동: {path.bus.busNumber}번 버스 / 대기 {path.bus.waitTime}분 / 탑승{" "}
                    {path.bus.rideTime}분
                  </Text>
                ) : (
                  <Text style={styles.summaryText}>
                    이동: 도보 {path.walkTime}분
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      ) : null}
    </ScrollView>
  );
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
      style={[styles.chip, selected ? styles.selectedChip : null]}
    >
      <Text style={[styles.chipText, selected ? styles.selectedChipText : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

function BusInfo({
  title,
  bus,
}: {
  title: string;
  bus: {
    busNumber: string;
    fromBusStopId: number;
    toBusStopId: number;
    departureTime: string;
    waitTime: number;
    rideTime: number;
    arrivalTime: string;
  };
}) {
  return (
    <View style={styles.busCard}>
      <Text style={styles.busTitle}>{title}</Text>
      <Text style={styles.summaryText}>
        {bus.busNumber}번 / {getBusStopName(bus.fromBusStopId)} →{" "}
        {getBusStopName(bus.toBusStopId)}
      </Text>
      <Text style={styles.summaryText}>
        출발 {bus.departureTime} / 도착 {bus.arrivalTime}
      </Text>
      <Text style={styles.summaryText}>
        대기 {bus.waitTime}분 / 탑승 {bus.rideTime}분
      </Text>
    </View>
  );
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
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4B5563",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },
  sectionSubTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  value: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2563EB",
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
    fontWeight: "700",
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
  },
  mainButton: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  mainButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2563EB",
  },
  placeCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 5,
  },
  placeName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  placeDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#4B5563",
  },
  reasonBox: {
    marginTop: 6,
    gap: 3,
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#2563EB",
  },
  pathCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    gap: 3,
  },
  busCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    gap: 3,
  },
  busTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  warningBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFFBEB",
    gap: 4,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#92400E",
  },
  errorCard: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#B91C1C",
    fontWeight: "700",
  },
});
