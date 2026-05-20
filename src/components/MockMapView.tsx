import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { FinalRoute } from "../../src/types/route";

interface MockMapViewProps {
  result: FinalRoute;
}

export default function MockMapView({ result }: MockMapViewProps) {
  const { places, paths } = result;

  // paths 배열을 Map으로 변환하여 탐색 성능을 O(1)로 최적화
  const pathMap = React.useMemo(() => {
    return new Map(paths.map((p) => [p.from, p]));
  }, [paths]);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>🗺 가상 경로 맵</Text>
      
      <View style={styles.mapContainer}>
        {places.map((place, index) => {
          const nextPath = pathMap.get(place.id);
          const isLast = index === places.length - 1;

          return (
            <View key={place.id} style={styles.nodeWrapper}>
              
              {/* 왼쪽: 노드와 연결선 영역 */}
              <View style={styles.leftTimeline}>
                {/* 순서 마커 */}
                <View style={[styles.marker, place.categories === 0 ? styles.foodMarker : styles.tourMarker]}>
                  <Text style={styles.markerText}>{index + 1}</Text>
                </View>
                
                {/* 다음 노드로 이어지는 선 (RN Dashed 버그 수정) */}
                {!isLast && (
                  <View 
                    style={[
                      styles.connectorLine, 
                      nextPath?.bus ? styles.busLine : styles.walkLine
                    ]} 
                  />
                )}
              </View>

              {/* 오른쪽: 콘텐츠 카드 영역 */}
              <View style={styles.rightContent}>
                <View style={styles.placeInfoCard}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.placeMeta}>⏱ {place.averageTime}분 체류</Text>
                </View>

                {/* 다음 장소로 이동할 때의 교통 수단 정보 표기 */}
                {!isLast && nextPath && (
                  <View style={styles.pathBadgeContainer}>
                    {nextPath.bus ? (
                      <View style={[styles.badge, styles.busBadge]}>
                        <Text style={styles.busBadgeText}>🚌 {nextPath.bus.busNumber}번 버스 ({nextPath.bus.rideTime}분)</Text>
                      </View>
                    ) : (
                      <View style={[styles.badge, styles.walkBadge]}>
                        <Text style={styles.walkBadgeText}>🏃 도보 {nextPath.walkTime}분 ({nextPath.distance}m)</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

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
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  mapContainer: {
    paddingLeft: 8,
  },
  nodeWrapper: {
    flexDirection: "row",
    // 유연한 높이를 위해 minHeight 제거
  },
  leftTimeline: {
    alignItems: "center",
    width: 32,
  },
  marker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  tourMarker: {
    backgroundColor: "#2563EB",
  },
  foodMarker: {
    backgroundColor: "#10B981",
  },
  markerText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  connectorLine: {
    position: "absolute",
    top: 24,
    bottom: 0, // 카드가 길어져도 마커 밑까지 쭉 이어지도록 조정
    left: 14,  // 센터에 맞추기 위해 마커 가로 너비의 절반 위치 근처로 조정
  },
  busLine: {
    borderLeftWidth: 4,
    borderColor: "#3B82F6",
    borderStyle: "solid",
  },
  walkLine: {
    borderLeftWidth: 4,
    borderColor: "#D1D5DB",
    borderStyle: "dashed", // React Native에서 작동하는 올바른 점선 방식
  },
  rightContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 28, // 선이 겹치지 않고 여유 공간을 주도록 살짝 늘림
  },
  placeInfoCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  placeName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  placeMeta: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  pathBadgeContainer: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  busBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 0.5,
    borderColor: "#BFDBFE",
  },
  busBadgeText: {
    fontSize: 11,
    color: "#1D4ED8",
    fontWeight: "700",
  },
  walkBadge: {
    backgroundColor: "#F3F4F6",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  walkBadgeText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "700",
  },
});
