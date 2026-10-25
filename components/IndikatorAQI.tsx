// components/IndikatorAQI.tsx
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LaporanUdara, TingkatAQI } from "../types/cuaca";
import { useAppTheme } from "../context/ThemeContext";

export interface IndikatorAQIProps {
  laporan?: LaporanUdara;
  kota?: string;
  indeksAQI?: number;
  tingkat?: TingkatAQI;
  diperbaruiPada?: string;
  isOffline?: boolean;
  isEstimasi?: boolean;
}

export default function IndikatorAQI(props: IndikatorAQIProps) {
  const { colors, isDark } = useAppTheme();

  const data: LaporanUdara = props.laporan
    ? props.laporan
    : {
        kota: props.kota ?? "",
        indeksAQI: props.indeksAQI ?? 0,
        tingkat: props.tingkat ?? "BAIK",
        diperbaruiPada: props.diperbaruiPada,
        isOffline: props.isOffline,
        isEstimasi: props.isEstimasi,
      };

  const { kota, indeksAQI, tingkat, diperbaruiPada } = data;
  const isOffline = props.isOffline ?? data.isOffline;
  const isEstimasi = props.isEstimasi ?? data.isEstimasi;

  const getWarnaAQI = (statusTingkat: TingkatAQI) => {
    switch (statusTingkat) {
      case "BAIK":
        return isDark ? "#4ade80" : "#16A34A";
      case "SEDANG":
        return isDark ? "#fbbf24" : "#D97706";
      case "TIDAK_SEHAT":
        return isDark ? "#fb923c" : "#EA580C";
      case "BERBAHAYA":
        return isDark ? "#f87171" : "#DC2626";
      default:
        return colors.text;
    }
  };

  const warnaTeks = getWarnaAQI(tingkat);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.header}>
        {kota ? (
          <Text style={[styles.kotaText, { color: colors.text }]}>
            Kota: {kota}
          </Text>
        ) : null}
        {isEstimasi ? (
          <View
            style={[
              styles.badgeEstimasi,
              {
                backgroundColor: isDark ? "#451a03" : "#FFF3CD",
                borderColor: isDark ? "#78350f" : "#FFEEBA",
              },
            ]}
          >
            <Ionicons
              name="sparkles-outline"
              size={10}
              color={isDark ? "#fbbf24" : "#856404"}
            />
            <Text
              style={[
                styles.badgeEstimasiText,
                { color: isDark ? "#fbbf24" : "#856404" },
              ]}
            >
              Estimasi Offline
            </Text>
          </View>
        ) : isOffline ? (
          <View
            style={[
              styles.badgeOffline,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="cloud-offline-outline"
              size={10}
              color={colors.textSecondary}
            />
            <Text
              style={[
                styles.badgeOfflineText,
                { color: colors.textSecondary },
              ]}
            >
              Offline
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.aqiText, { color: colors.textSecondary }]}>
        Indeks AQI: <Text style={{ color: colors.text, fontWeight: "700" }}>{indeksAQI}</Text>
      </Text>
      <Text style={[styles.tingkatText, { color: warnaTeks }]}>
        Tingkat: {tingkat}
      </Text>

      {diperbaruiPada ? (
        <Text style={[styles.diperbaruiText, { color: colors.textMuted }]}>
          Diperbarui: {diperbaruiPada}
        </Text>
      ) : null}

      {isEstimasi && (
        <Text style={[styles.keteranganEstimasi, { color: colors.warning }]}>
          * Data AQI akan diperbarui secara otomatis saat perangkat online kembali.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kotaText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  aqiText: {
    fontSize: 15,
  },
  tingkatText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  diperbaruiText: {
    fontSize: 12,
  },
  badgeEstimasi: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeEstimasiText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  badgeOffline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeOfflineText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  keteranganEstimasi: {
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 4,
  },
});
