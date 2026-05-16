import { useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";

import { filterPlacesByMood } from "../../src/algorithms/filterPlaces";
import MoodButton from "../../src/components/MoodButton";
import PlaceCard from "../../src/components/PlaceCard";
import { places } from "../../src/data/places";

export default function HomeScreen() {
  const [screen, setScreen] = useState("home");
  const [selectedMood, setSelectedMood] = useState("");

  const filteredPlaces = filterPlacesByMood(places, selectedMood);

  if (screen === "home") {
    return (
      <View style={{ flex: 1, padding: 40, justifyContent: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
          여행 루트 추천 앱
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 30 }}>
          경국대에서 출발해 안동시내 여행 루트를 추천합니다.
        </Text>

        <Button title="루트 만들기" onPress={() => setScreen("input")} />
      </View>
    );
  }

  if (screen === "input") {
    return (
      <View style={{ flex: 1, padding: 40, justifyContent: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
          원하는 여행 분위기를 선택하세요
        </Text>

        <MoodButton
          title="먹거리탐방"
          selectedMood={selectedMood}
          onPress={() => setSelectedMood("먹거리탐방")}
        />

        <MoodButton
          title="조용한"
          selectedMood={selectedMood}
          onPress={() => setSelectedMood("조용한")}
        />

        <MoodButton
          title="전통문화"
          selectedMood={selectedMood}
          onPress={() => setSelectedMood("전통문화")}
        />

        <MoodButton
          title="자연"
          selectedMood={selectedMood}
          onPress={() => setSelectedMood("자연")}
        />

        <Text style={{ marginTop: 20, fontSize: 16 }}>
          선택한 분위기: {selectedMood || "아직 선택 안 함"}
        </Text>

        <View style={{ marginTop: 30 }}>
          <Button
            title="추천 루트 만들기"
            onPress={() => setScreen("result")}
            disabled={selectedMood === ""}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Button title="처음으로" onPress={() => setScreen("home")} />
        </View>
      </View>
    );
  }

  if (screen === "result") {
    return (
      <ScrollView style={{ flex: 1, padding: 30 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 12 }}>
          추천 결과
        </Text>

        <Text style={{ fontSize: 18, marginBottom: 8 }}>
          선택한 분위기: {selectedMood}
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 20 }}>
          조건에 맞는 장소 {filteredPlaces.length}개를 찾았습니다.
        </Text>

        {filteredPlaces.map((place, index) => (
          <PlaceCard key={place.id} place={place} index={index} />
        ))}

        <View style={{ marginTop: 24, marginBottom: 12 }}>
          <Button title="모의지도 보기" onPress={() => setScreen("map")} />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Button title="다시 선택하기" onPress={() => setScreen("input")} />
        </View>

        <View style={{ marginBottom: 40 }}>
          <Button title="처음으로" onPress={() => setScreen("home")} />
        </View>
      </ScrollView>
    );
  }

  if (screen === "map") {
    return (
      <View style={{ flex: 1, padding: 40, justifyContent: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
          모의지도 화면
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 20 }}>
          다음 단계에서 이 화면에 장소 점과 경로선을 표시합니다.
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          선택한 분위기: {selectedMood}
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 20 }}>
          지도에 표시할 장소 수: {filteredPlaces.length}개
        </Text>

        <Button title="결과 화면으로" onPress={() => setScreen("result")} />
      </View>
    );
  }

  return null;
}
