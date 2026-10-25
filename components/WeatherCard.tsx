// components/WeatherCard.tsx
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TingkatAQI, WeatherCardProps } from "../types/cuaca";
import { spacing, typeScale } from "../constants/styles";
import { useAppTheme } from "../context/ThemeContext";

const warnaPerTingkat: Record<TingkatAQI, { light: string; dark: string }> = {
  BAIK: { light: "#16A34A", dark: "#4ADE80" },
  SEDANG: { light: "#D97706", dark: "#FBBF24" },
  TIDAK_SEHAT: { light: "#EA580C", dark: "#FB923C" },
  BERBAHAYA: { light: "#DC2626", dark: "#F87171" },
};

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
  isOffline = false,
  isCached = false,
  isEstimasi = false,
  terakhirDiperbarui,
  catatanOffline,
}: WeatherCardProps) {
  const { colors, isDark } = useAppTheme();

  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} (${tingkatAQI})`
      : `AQI: ${tingkatAQI}`;

  const formatWaktu = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      });
    } catch {
      return isoString;
    }
  };

  const warnaAQI = isDark
    ? warnaPerTingkat[tingkatAQI]?.dark || "#4ADE80"
    : warnaPerTingkat[tingkatAQI]?.light || "#16A34A";

  const labelAksesibilitas = `${kota}, suhu ${suhu} derajat, kualitas udara ${teksAQI}${
    isOffline ? ", mode offline" : ""
  }${isEstimasi ? ", data estimasi" : ""}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.kotaRow}>
          <Ionicons name="location" size={20} color={colors.tint} />
          <Text style={[styles.kotaText, { color: colors.text }]}>{kota}</Text>
        </View>

        {/* Status Badge Offline / Cache / Estimasi */}
        {isEstimasi ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark ? "#451a03" : "#FEF3C7",
                borderColor: isDark ? "#78350f" : "#FDE68A",
              },
            ]}
          >
            <Ionicons
              name="sparkles-outline"
              size={12}
              color={isDark ? "#fbbf24" : "#B45309"}
            />
            <Text
              style={[
                styles.badgeText,
                { color: isDark ? "#fbbf24" : "#B45309" },
              ]}
            >
              Estimasi Lokal
            </Text>
          </View>
        ) : isCached || isOffline ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark ? "#052e16" : "#DCFCE7",
                borderColor: isDark ? "#14532d" : "#86EFAC",
              },
            ]}
          >
            <Ionicons
              name="server-outline"
              size={12}
              color={isDark ? "#4ade80" : "#15803d"}
            />
            <Text
              style={[
                styles.badgeText,
                { color: isDark ? "#4ade80" : "#15803d" },
              ]}
            >
              Data Cache
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.suhuWrapper}>
        <Text style={[styles.suhuText, { color: colors.text }]}>{suhu}°C</Text>
        <Ionicons
          name={suhu > 30 ? "sunny" : "cloudy-night"}
          size={38}
          color={colors.tint}
        />
      </View>

      <View style={styles.aqiContainer}>
        <View style={[styles.aqiDot, { backgroundColor: warnaAQI }]} />
        <Text style={[styles.aqiText, { color: warnaAQI }]}>{teksAQI}</Text>
      </View>

      {/* Informasi Sinkronisasi Terakhir */}
      {terakhirDiperbarui ? (
        <Text
          style={[styles.terakhirDiperbaruiText, { color: colors.textSecondary }]}
        >
          Sinkronisasi terakhir: {formatWaktu(terakhirDiperbarui)}
        </Text>
      ) : null}

      {/* Pemberitahuan Jika Data Berupa Estimasi Offline Baru */}
      {isEstimasi && (
        <View
          style={[
            styles.boxPemberitahuan,
            {
              backgroundColor: isDark ? "#1f1709" : "#FFF8E1",
              borderColor: isDark ? "#451a03" : "#FEEAA6",
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={14}
            color={isDark ? "#fbbf24" : "#856404"}
          />
          <Text
            style={[
              styles.teksPemberitahuan,
              { color: isDark ? "#fbbf24" : "#856404" },
            ]}
          >
            {catatanOffline || "Data cuaca/AQI akan diperbarui saat kembali online"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sedang,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kotaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  kotaText: {
    fontWeight: "bold",
    fontSize: typeScale.judul,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  suhuWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  suhuText: {
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  aqiContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aqiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  aqiText: {
    fontSize: typeScale.isi,
    fontWeight: "700",
  },
  terakhirDiperbaruiText: {
    fontSize: 11,
    marginTop: 2,
  },
  boxPemberitahuan: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
  },
  teksPemberitahuan: {
    fontSize: 11,
    flex: 1,
    fontWeight: "500",
  },
});