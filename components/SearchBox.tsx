// components/SearchBox.tsx
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";

interface SearchBoxProps {
  onCari: (teks: string) => void;
  isOffline?: boolean;
  isUsingLocalData?: boolean;
  placeholder?: string;
  nilaiTeks?: string;
}

export default function SearchBox({
  onCari,
  isOffline = false,
  isUsingLocalData = false,
  placeholder,
  nilaiTeks,
}: SearchBoxProps) {
  const { colors, isDark } = useAppTheme();
  const [teks, setTeks] = useState(nilaiTeks ?? "");

  // Update teks jika nilaiTeks dikontrol dari luar
  if (nilaiTeks !== undefined && nilaiTeks !== teks && nilaiTeks === "") {
    setTeks("");
  }

  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru);
  }

  function handleReset() {
    setTeks("");
    onCari("");
  }

  const defaultPlaceholder = isOffline
    ? "Cari kota di Indonesia (Mode Offline)..."
    : "Cari nama kota (misal: Surabaya, Bandung)...";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.card,
            borderColor: colors.inputBorder,
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={colors.icon}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder={placeholder || defaultPlaceholder}
          placeholderTextColor={colors.inputPlaceholder}
          value={teks}
          onChangeText={handleChange}
          accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
          style={[styles.input, { color: colors.text }]}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {teks.length > 0 && (
          <TouchableOpacity
            onPress={handleReset}
            style={styles.clearBtn}
            accessibilityLabel="Hapus teks pencarian"
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Indikator Visual Mode Offline / Database Lokal */}
      {(isOffline || isUsingLocalData) && (
        <View style={styles.badgeWrapper}>
          <View
            style={[
              styles.offlineBadge,
              {
                backgroundColor: isDark ? "#451a03" : "#FFF3CD",
                borderColor: isDark ? "#78350f" : "#FFEEBA",
              },
            ]}
          >
            <Ionicons
              name="cloud-offline"
              size={12}
              color={isDark ? "#fbbf24" : "#856404"}
            />
            <Text
              style={[
                styles.badgeText,
                { color: isDark ? "#fbbf24" : "#856404" },
              ]}
            >
              Mode Offline • Pencarian Database Lokal
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  badgeWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});