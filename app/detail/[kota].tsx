// app/detail/[kota].tsx
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import WeatherCard from "../../components/WeatherCard";
import { useAppTheme } from "../../context/ThemeContext";
import { ambilCacheCuaca, ItemCacheKota } from "../../services/offlineStorage";
import { ambilSemuaFavorit } from "../../services/favoritStorage";

export default function HalamanDetail() {
  const { kota } = useLocalSearchParams<{ kota: string }>();
  const { colors, isDark } = useAppTheme();
  const [cache, setCache] = useState<ItemCacheKota | null>(null);
  const [sudahFavorit, setSudahFavorit] = useState(false);

  useEffect(() => {
    if (kota) {
      ambilCacheCuaca(kota).then(setCache);
      ambilSemuaFavorit().then((favs) => {
        setSudahFavorit(
          favs.some((f) => f.nama.toLowerCase() === kota.toLowerCase())
        );
      });
    }
  }, [kota]);

  const suhu = cache?.cuaca?.saatIni?.suhu ?? 29;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WeatherCard
        kota={kota || "Detail Kota"}
        suhu={suhu}
        tingkatAQI="BAIK"
        isCached={Boolean(cache)}
        terakhirDiperbarui={cache?.disimpanPada}
      />

      {!sudahFavorit && (
        <TouchableOpacity
          style={[
            styles.btnFavorit,
            { backgroundColor: isDark ? "#065f46" : "#0D9488" },
          ]}
          onPress={() =>
            router.push({
              pathname: "/tambah-favorit",
              params: {
                id: String(cache?.kota?.id ?? Date.now()),
                nama: kota,
                lat: String(cache?.kota?.latitude ?? 0),
                lon: String(cache?.kota?.longitude ?? 0),
              },
            })
          }
        >
          <Ionicons name="heart-outline" size={18} color="#FFFFFF" />
          <Text style={styles.btnFavoritText}>Tambahkan ke Favorit</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.btnLihatBeranda,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
        onPress={() =>
          router.navigate({
            pathname: "/(tabs)",
            params: { cariKota: kota },
          })
        }
      >
        <Ionicons name="search" size={16} color={colors.tint} />
        <Text style={[styles.btnLihatBerandaText, { color: colors.tint }]}>
          Buka & Pantau Cuaca Lengkap di Beranda
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  btnFavorit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnFavoritText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  btnLihatBeranda: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnLihatBerandaText: {
    fontSize: 13,
    fontWeight: "600",
  },
});