import { Pressable, Text } from "react-native";

type MoodButtonProps = {
  title: string;
  selectedMood: string;
  onPress: () => void;
};

export default function MoodButton({
  title,
  selectedMood,
  onPress,
}: MoodButtonProps) {
  const isSelected = selectedMood === title;

  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 14,
        marginBottom: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: isSelected ? "#2563eb" : "#cccccc",
        backgroundColor: isSelected ? "#dbeafe" : "#ffffff",
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: isSelected ? "bold" : "normal",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
