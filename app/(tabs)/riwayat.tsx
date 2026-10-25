// app/(tabs)/riwayat.tsx
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import RiwayatList, { InfoRiwayatItem } from "../../components/RiwayatList";
import { useAppTheme } from "../../context/ThemeContext";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
  ambilCacheCuaca,
  ambilRiwayatPencarian,
  hapusCacheKota,
  hapusRiwayatPencarian,
  ItemCacheKota,
  MAKS_RIWAYAT_PENCARIAN,
} from "../../services/offlineStorage";
import { KotaFavorit } from "../../types/favorit";
import { HasilGeocoding } from "../../types/geocoding";

export default function TabRiwayat() {
  const { colors, isDark } = useAppTheme();
  const [tabAktif, setTabAktif] = useState<"riwayat" | "favorit">("riwayat");
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<HasilGeocoding[]>([]);
  const [petaCache, setPetaCache] = useState<Record<string, ItemCacheKota>>({});

  const muatData = useCallback(async () => {
    try {
      const [favs, riwayat] = await Promise.all([
        ambilSemuaFavorit(),
        ambilRiwayatPencarian(),
      ]);
      setDaftarFavorit(favs);
      setDaftarRiwayat(riwayat);

      // Cek cache untuk semua kota di riwayat dan favorit
      const semuaNama = new Set<string>();
      riwayat.forEach((r) => semuaNama.add(r.name));
      favs.forEach((f) => semuaNama.add(f.nama));

      const cacheBaru: Record<string, ItemCacheKota> = {};
      await Promise.all(
        Array.from(semuaNama).map(async (nama) => {
          const c = await ambilCacheCuaca(nama);
          if (c) {
            cacheBaru[nama.toLowerCase().trim()] = c;
          }
        })
      );
      setPetaCache(cacheBaru);
    } catch (e) {
      console.error("Gagal memuat data riwayat & favorit:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [muatData])
  );

  // UTS Tugas 2: Memastikan saat salah satu riwayat kota diklik, aplikasi otomatis memunculkan pencarian kota tersebut
  function handlePilihKota(namaKota: string) {
    router.navigate({
      pathname: "/(tabs)",
      params: { cariKota: namaKota },
    });
  }

  // UTS Tugas 3: Menambahkan tombol hapus cache dengan konfirmasi Alert
  async function handleHapusCache(namaKota: string) {
    const sukses = await hapusCacheKota(namaKota);
    if (sukses) {
      setPetaCache((prev) => {
        const copy = { ...prev };
        delete copy[namaKota.toLowerCase().trim()];
        return copy;
      });

      const pesan = `Data cache cuaca untuk "${namaKota}" berhasil dihapus dari perangkat.`;
      if (Platform.OS === "web") {
        alert(pesan);
      } else {
        Alert.alert("Berhasil", pesan);
      }
    }
  }

  function konfirmasiHapusCacheFavorit(namaKota: string) {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Hapus cache offline untuk ${namaKota}?`
      );
      if (confirmed) {
        handleHapusCache(namaKota);
      }
    } else {
      Alert.alert(
        "Hapus Cache Kota",
        `Apakah Anda yakin ingin menghapus data cache cuaca untuk "${namaKota}"?`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus Cache",
            style: "destructive",
            onPress: () => handleHapusCache(namaKota),
          },
        ]
      );
    }
  }

  function konfirmasiHapusFavorit(kota: KotaFavorit) {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Yakin hapus ${kota.nama} dari daftar favorit?`
      );
      if (confirmed) {
        hapusFavorit(kota.id).then(() => {
          setDaftarFavorit((prev) => prev.filter((k) => k.id !== kota.id));
        });
      }
    } else {
      Alert.alert(
        `Hapus ${kota.nama}?`,
        "Kota ini akan dihapus dari daftar favorit.",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus",
            style: "destructive",
            onPress: async () => {
              await hapusFavorit(kota.id);
              setDaftarFavorit((prev) => prev.filter((k) => k.id !== kota.id));
            },
          },
        ]
      );
    }
  }

  async function handleHapusItemRiwayat(namaKota: string) {
    const item = daftarRiwayat.find(
      (k) => k.name.toLowerCase() === namaKota.toLowerCase()
    );
    if (item) {
      await hapusRiwayatPencarian(item.id);
      const sisa = await ambilRiwayatPencarian();
      setDaftarRiwayat(sisa);
    }
  }

  function handleBersihkanRiwayat() {
    const pesan = "Semua riwayat pencarian akan dihapus dari perangkat.";
    if (Platform.OS === "web") {
      const confirmed = window.confirm(`Bersihkan semua riwayat?\n${pesan}`);
      if (confirmed) {
        hapusRiwayatPencarian().then(() => setDaftarRiwayat([]));
      }
    } else {
      Alert.alert("Bersihkan Semua Riwayat", pesan, [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Semua",
          style: "destructive",
          onPress: async () => {
            await hapusRiwayatPencarian();
            setDaftarRiwayat([]);
          },
        },
      ]);
    }
  }

  // Siapkan data item riwayat dengan info cache untuk RiwayatList
  const dataItemRiwayat: InfoRiwayatItem[] = daftarRiwayat.map((kota) => {
    const key = kota.name.toLowerCase().trim();
    const cache = petaCache[key];
    return {
      id: kota.id,
      nama: kota.name,
      adminWilayah: kota.admin1
        ? `${kota.admin1}, ${kota.country || "Indonesia"}`
        : kota.country || "Indonesia",
      isCached: Boolean(cache),
      suhuCached: cache?.cuaca?.saatIni?.suhu,
      waktuDisimpan: cache?.disimpanPada,
    };
  });

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Penjelasan Fitur UTS */}
        <View
          style={[
            styles.bannerInfo,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Ionicons name="information-circle" size={18} color={colors.tint} />
          <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
            Ketuk kota untuk memunculkan cuacanya di Beranda. Hapus cache kota
            untuk mengosongkan penyimpanan lokal.
          </Text>
        </View>

        {/* Tab Switcher: Riwayat Pencarian vs Kota Favorit */}
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              tabAktif === "riwayat" && [
                styles.tabButtonAktif,
                {
                  backgroundColor: colors.card,
                  shadowColor: isDark ? "#000" : "#64748B",
                },
              ],
            ]}
            onPress={() => setTabAktif("riwayat")}
          >
            <Ionicons
              name="time"
              size={16}
              color={tabAktif === "riwayat" ? colors.tint : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    tabAktif === "riwayat" ? colors.tint : colors.textSecondary,
                },
                tabAktif === "riwayat" && styles.tabTextAktif,
              ]}
            >
              Riwayat ({daftarRiwayat.length}/{MAKS_RIWAYAT_PENCARIAN})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              tabAktif === "favorit" && [
                styles.tabButtonAktif,
                {
                  backgroundColor: colors.card,
                  shadowColor: isDark ? "#000" : "#64748B",
                },
              ],
            ]}
            onPress={() => setTabAktif("favorit")}
          >
            <Ionicons
              name="heart"
              size={16}
              color={tabAktif === "favorit" ? "#E11D48" : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    tabAktif === "favorit" ? "#E11D48" : colors.textSecondary,
                },
                tabAktif === "favorit" && styles.tabTextAktif,
              ]}
            >
              Favorit ({daftarFavorit.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAMPILAN TAB 1: RIWAYAT PENCARIAN (UTS Nomor 2 & Nomor 3) */}
        {tabAktif === "riwayat" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionJudul, { color: colors.text }]}>
                  Riwayat Pencarian Terakhir
                </Text>
                <Text style={[styles.subJudul, { color: colors.textMuted }]}>
                  Maksimal {MAKS_RIWAYAT_PENCARIAN} pencarian tersimpan lokal
                </Text>
              </View>

              {daftarRiwayat.length > 0 && (
                <TouchableOpacity
                  onPress={handleBersihkanRiwayat}
                  style={[
                    styles.btnHapusSemua,
                    {
                      backgroundColor: colors.dangerBackground,
                      borderColor: colors.dangerBorder,
                    },
                  ]}
                >
                  <Ionicons name="trash-bin-outline" size={12} color={colors.danger} />
                  <Text style={[styles.teksHapusSemua, { color: colors.danger }]}>
                    Hapus Semua
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <RiwayatList
              daftarItem={dataItemRiwayat}
              onPilihKota={handlePilihKota}
              onHapusRiwayat={handleHapusItemRiwayat}
              onHapusCache={handleHapusCache}
            />
          </View>
        )}

        {/* TAMPILAN TAB 2: KOTA FAVORIT */}
        {tabAktif === "favorit" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionJudul, { color: colors.text }]}>
                  Daftar Kota Favorit
                </Text>
                <Text style={[styles.subJudul, { color: colors.textMuted }]}>
                  {daftarFavorit.length} kota ditandai
                </Text>
              </View>
            </View>

            {daftarFavorit.length === 0 ? (
              <View
                style={[
                  styles.emptyContainer,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Ionicons name="heart-outline" size={36} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Belum ada kota favorit
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                  Cari kota di Beranda dan tekan tombol &quot;Tambahkan ke Favorit&quot;
                </Text>
              </View>
            ) : (
              daftarFavorit.map((kota) => {
                const key = kota.nama.toLowerCase().trim();
                const cache = petaCache[key];

                return (
                  <View
                    key={kota.id}
                    style={[
                      styles.itemFavorit,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.itemFavoritInfo}
                      onPress={() => handlePilihKota(kota.nama)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.iconFavorit,
                          {
                            backgroundColor: isDark ? "#4c0519" : "#FFE4E6",
                          },
                        ]}
                      >
                        <Ionicons name="heart" size={18} color="#E11D48" />
                      </View>

                      <View style={styles.favoritTeksWrapper}>
                        <View style={styles.favoritNamaRow}>
                          <Text
                            style={[
                              styles.namaKotaFavorit,
                              { color: colors.text },
                            ]}
                          >
                            {kota.nama}
                          </Text>
                          {cache?.cuaca?.saatIni?.suhu !== undefined && (
                            <Text
                              style={[
                                styles.suhuFavoritBadge,
                                { color: colors.tint },
                              ]}
                            >
                              {cache.cuaca.saatIni.suhu}°C
                            </Text>
                          )}
                        </View>

                        {cache ? (
                          <View style={styles.cacheFavRow}>
                            <Ionicons
                              name="server"
                              size={11}
                              color={isDark ? "#4ade80" : "#16A34A"}
                            />
                            <Text
                              style={[
                                styles.cacheFavText,
                                { color: isDark ? "#4ade80" : "#16A34A" },
                              ]}
                            >
                              Cache Tersimpan
                            </Text>
                          </View>
                        ) : (
                          <Text
                            style={[
                              styles.noCacheFavText,
                              { color: colors.textMuted },
                            ]}
                          >
                            Ketuk untuk memuat cuaca
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Aksi Kota Favorit: Hapus Cache & Hapus Favorit */}
                    <View style={styles.favoritAksi}>
                      {cache && (
                        <TouchableOpacity
                          onPress={() => konfirmasiHapusCacheFavorit(kota.nama)}
                          style={[
                            styles.btnHapusCacheFav,
                            {
                              backgroundColor: isDark ? "#451a03" : "#FEF3C7",
                              borderColor: isDark ? "#78350f" : "#FDE68A",
                            },
                          ]}
                          accessibilityLabel={`Hapus cache ${kota.nama}`}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={12}
                            color={isDark ? "#fbbf24" : "#B45309"}
                          />
                          <Text
                            style={[
                              styles.btnHapusCacheFavText,
                              { color: isDark ? "#fbbf24" : "#B45309" },
                            ]}
                          >
                            Hapus Cache
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() => konfirmasiHapusFavorit(kota)}
                        style={[
                          styles.btnHapusFav,
                          {
                            backgroundColor: colors.dangerBackground,
                            borderColor: colors.dangerBorder,
                          },
                        ]}
                        accessibilityLabel={`Hapus ${kota.nama} dari favorit`}
                      >
                        <Ionicons
                          name="close-outline"
                          size={16}
                          color={colors.danger}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  bannerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  bannerText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  tabButtonAktif: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  tabTextAktif: {
    fontWeight: "700",
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionJudul: {
    fontSize: 17,
    fontWeight: "700",
  },
  subJudul: {
    fontSize: 12,
    marginTop: 2,
  },
  btnHapusSemua: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  teksHapusSemua: {
    fontSize: 11,
    fontWeight: "600",
  },
  itemFavorit: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  itemFavoritInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconFavorit: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  favoritTeksWrapper: {
    flex: 1,
    gap: 3,
  },
  favoritNamaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 4,
  },
  namaKotaFavorit: {
    fontSize: 16,
    fontWeight: "700",
  },
  suhuFavoritBadge: {
    fontSize: 14,
    fontWeight: "700",
  },
  cacheFavRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cacheFavText: {
    fontSize: 11,
    fontWeight: "600",
  },
  noCacheFavText: {
    fontSize: 11,
  },
  favoritAksi: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  btnHapusCacheFav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnHapusCacheFavText: {
    fontSize: 11,
    fontWeight: "600",
  },
  btnHapusFav: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: "center",
    maxWidth: 240,
  },
});