import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { FinalRoute } from "../../src/types/route";

interface RouteSummaryProps {
  result: FinalRoute;
}

export default function RouteSummary({ result }: RouteSummaryProps) {
  const { totalTime, stayTime, walkingTime, busTime, busWaitTime } = result.timeSummary;

  // 가로 바 차트 비율 계산 (안전하게 0 나누기 방지)
  const denominator = totalTime || 1;
  const stayPercent = (stayTime / denominator) * 100;
  const walkPercent = (walkingTime / denominator) * 100;
  const busPercent = ((busTime + busWaitTime) / denominator) * 100;

  // 분 단위를 시간과 분으로 변환 (예: 120분 -> 2시간, 135분 -> 2시간 15분)
  const formatHourMin = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h > 0) {
      return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
    }
    return `${m}분`;
  };

  return (
    <View style={styles.card}>
      {/* 헤더 및 타이틀 */}
      <View style={styles.header}>
        <Text style={styles.routeTitle} numberOfLines={1}>
          {result.routeTitle}
        </Text>
        <Text style={styles.totalTimeText}>{formatHourMin(totalTime)}</Text>
      </View>
      
      <Text style={styles.description}>{result.summary}</Text>

      {/* 수평 바 차트 (시간 분배 비주얼) */}
      <View style={styles.chartContainer}>
        {stayPercent > 0 && (
          <View style={[styles.chartBar, { width: `${stayPercent}%`, backgroundColor: "#10B981" }]} />
        )}
        {busPercent > 0 && (
          <View style={[styles.chartBar, { width: `${busPercent}%`, backgroundColor: "#3B82F6" }]} />
        )}
        {walkPercent > 0 && (
          <View style={[styles.chartBar, { width: `${walkPercent}%`, backgroundColor: "#9CA3AF" }]} />
        )}
      </View>

      {/* 범례 및 세부 지표 */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#10B981" }]} />
          <Text style={styles.legendLabel}>체류 {stayTime}분</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#3B82F6" }]} />
          <Text style={styles.legendLabel}>버스 {busTime + busWaitTime}분</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#9CA3AF" }]} />
          <Text style={styles.legendLabel}>도보 {walkingTime}분</Text>
        </View>
      </View>

      {/* 경고 메시지 영역 */}
      {result.warnings.length > 0 && (
        <View style={styles.warningBox}>
          {result.warnings.map((warning) => (
            <Text key={warning} style={styles.warningText}>
              ⚠ {warning}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  totalTimeText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
  },
  chartContainer: {
    flexDirection: "row",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    marginTop: 6,
  },
  chartBar: {
    height: "100%",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  warningBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFFBEB",
    marginTop: 4,
    gap: 4,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#92400E",
    fontWeight: "600",
  },
});
