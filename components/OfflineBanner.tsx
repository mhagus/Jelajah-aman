// components/OfflineBanner.tsx
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";

interface OfflineBannerProps {
  isOffline: boolean;
  pesan?: string;
  onCobaLagi?: () => void;
}

export default function OfflineBanner({
  isOffline,
  pesan = "Anda sedang dalam mode offline. Menampilkan data lokal & cache.",
  onCobaLagi,
}: OfflineBannerProps) {
  const { isDark } = useAppTheme();

  if (!isOffline) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#381e05" : "#FFF3CD",
          borderColor: isDark ? "#78350f" : "#FFEEBA",
        },
      ]}
      accessibilityRole="alert"
    >
      <View style={styles.content}>
        <Ionicons
          name="cloud-offline-outline"
          size={18}
          color={isDark ? "#fbbf24" : "#856404"}
        />
        <Text
          style={[
            styles.text,
            { color: isDark ? "#fde68a" : "#856404" },
          ]}
        >
          {pesan}
        </Text>
      </View>
      {onCobaLagi ? (
        <TouchableOpacity
          onPress={onCobaLagi}
          style={[
            styles.btnCobaLagi,
            { backgroundColor: isDark ? "#78350f" : "#FFE8A1" },
          ]}
          accessibilityLabel="Coba hubungkan kembali"
        >
          <Text
            style={[
              styles.btnText,
              { color: isDark ? "#fef3c7" : "#533f03" },
            ]}
          >
            Coba Lagi
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  btnCobaLagi: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  btnText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
