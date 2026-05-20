import React from "react";
import { StyleSheet, Text, View, ImageBackground } from "react-native";
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
      
      {/* 1. 지도를 배경으로 사용하는 컨테이너 */}
      <ImageBackground 
        source={require("@/assets/images/안동시내_약도.png")} // 프로젝트 내 실제 이미지 파일 경로에 맞게 수정해 주세요.
        style={styles.mapBackground}
        imageStyle={styles.mapImageStyle}
      >
        {/* 지도가 너무 선명해 텍스트가 안 보일 수 있으므로 살짝 어둡거나 밝게 필터를 씌우는 오버레이 레이어 */}
        <View style={styles.mapOverlay}>
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
                    
                    {/* 다음 노드로 이어지는 선 */}
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
      </ImageBackground>
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
    overflow: "hidden", // 테두리 밖으로 지도가 빠져나가지 않도록 스냅
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  // 지도를 배경으로 감싸는 컨테이너 스타일 추가
  mapBackground: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },
  mapImageStyle: {
    opacity: 0.85, // 지도를 살짝 불투명하게 만들어 UI 가독성을 확보
    resizeMode: "cover",
  },
  mapOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.3)", // 지도 위에 하얀 보정 효과를 살짝 주어 텍스트가 묻히지 않게 조절
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  mapContainer: {
    paddingLeft: 8,
  },
  nodeWrapper: {
    flexDirection: "row",
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
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
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
    bottom: -10, // 아래 카드 패딩 하단까지 자연스럽게 물리도록 좀 더 연장
    left: 14,  
  },
  busLine: {
    borderLeftWidth: 4,
    borderColor: "#3B82F6",
    borderStyle: "solid",
  },
  walkLine: {
    borderLeftWidth: 4,
    borderColor: "#9CA3AF", // 점선이 배경지도 위에서 잘 보이도록 색상을 한 단계 명확하게 조정
    borderStyle: "dashed", 
  },
  rightContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 32, 
  },
  placeInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.92)", // 배경 지도가 비치되 글씨 가독성을 지키기 위해 불투명 백그라운드 적용
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.0,
  },
  placeName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  placeMeta: {
    fontSize: 11,
    color: "#4B5563",
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
    elevation: 1,
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
    backgroundColor: "#F9FAFB",
    borderWidth: 0.5,
    borderColor: "#D1D5DB",
  },
  walkBadgeText: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "700",
  },
});
