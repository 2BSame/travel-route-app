import { Text, View } from "react-native";
import { Place } from "../types/place";

type PlaceCardProps = {
  place: Place;
  index: number;
};

export default function PlaceCard({ place, index }: PlaceCardProps) {
  return (
    <View
      style={{
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#dddddd",
        borderRadius: 12,
        backgroundColor: "#ffffff",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 6 }}>
        {index + 1}. {place.name}
      </Text>

      <Text style={{ fontSize: 14, marginBottom: 4 }}>
        카테고리: {place.categories}
      </Text>

      <Text style={{ fontSize: 14, marginBottom: 4 }}>
        분위기 태그: {place.themes.join(", ")}
      </Text>

      <Text style={{ fontSize: 14, marginBottom: 4 }}>
        예상 비용: {place.avgCost.toLocaleString()}원
      </Text>

      <Text style={{ fontSize: 14 }}>예상 체류시간: {place.averageTime}분</Text>
    </View>
  );
}
