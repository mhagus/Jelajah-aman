// components/AtribusiCuaca.tsx
import { Text, TouchableOpacity, Linking } from "react-native";
import { useAppTheme } from "../context/ThemeContext";

export default function AtribusiCuaca() {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL("https://open-meteo.com/")}
      style={{ paddingVertical: 12 }}
    >
      <Text
        style={{
          fontSize: 11,
          color: colors.textMuted,
          textAlign: "center",
        }}
      >
        Data cuaca disediakan oleh Open-Meteo.com
      </Text>
    </TouchableOpacity>
  );
}
