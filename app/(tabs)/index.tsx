// app/(tabs)/index.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AtribusiCuaca from "../../components/AtribusiCuaca";
import OfflineBanner from "../../components/OfflineBanner";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import { cariKotaLokal } from "../../constants/cities";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useAppTheme } from "../../context/ThemeContext";
import { useDebounce } from "../../hooks/use-debounce";
import { useOfflineData } from "../../hooks/useOfflineData";
import {
  ambilKoordinatSaatIni,
  mintaIzinLokasi,
} from "../../services/locationService";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { cariKota } from "../../services/geocodingService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { HasilGeocoding } from "../../types/geocoding";

export default function HalamanUtama() {
  const { colors, isDark } = useAppTheme();
  const params = useLocalSearchParams<{ cariKota?: string }>();

  const {
    isConnected,
    kotaAktif,
    cuaca,
    kualitasUdara,
    isDataCached,
    isDataEstimasi,
    terakhirDiperbarui,
    riwayatPencarian,
    sedangMemuat,
    pesanError,
    pilihKota,
    muatUlangData,
    hapusRiwayat,
  } = useOfflineData();

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [sumberHasilLokal, setSumberHasilLokal] = useState(false);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [sudahFavorit, setSudahFavorit] = useState(false);

  const teksTertunda = useDebounce(teksCari, 350);
  const terakhirDicariRef = useRef<string | null>(null);

  // UTS Tugas 2: Memastikan saat salah satu riwayat kota diklik di tab riwayat,
  // aplikasi otomatis memunculkan pencarian kota tersebut di Beranda
  useEffect(() => {
    if (params.cariKota && params.cariKota !== terakhirDicariRef.current) {
      const nama = params.cariKota.trim();
      terakhirDicariRef.current = nama;

      // 1. Coba cari di riwayat yang sudah ada
      const dariRiwayat = riwayatPencarian.find(
        (k) => k.name.toLowerCase().trim() === nama.toLowerCase().trim()
      );
      if (dariRiwayat) {
        pilihKota(dariRiwayat);
        return;
      }

      // 2. Coba cari di database kota lokal Indonesia
      const dariLokal = cariKotaLokal(nama);
      if (dariLokal.length > 0) {
        pilihKota(dariLokal[0]);
        return;
      }

      // 3. Jika online, coba panggil API geocoding
      if (isConnected) {
        cariKota(nama)
          .then((hasil) => {
            if (hasil && hasil.length > 0) {
              pilihKota(hasil[0]);
            } else {
              pilihKota({
                id: Date.now(),
                name: nama,
                latitude: -6.2088,
                longitude: 106.8456,
                country: "Indonesia",
              });
            }
          })
          .catch(() => {
            pilihKota({
              id: Date.now(),
              name: nama,
              latitude: -6.2088,
              longitude: 106.8456,
              country: "Indonesia",
            });
          });
      }
    }
  }, [params.cariKota, riwayatPencarian, isConnected, pilihKota]);

  // Periksa status favorit setiap kali tab/kota berganti
  useFocusEffect(
    useCallback(() => {
      if (!kotaAktif) return;

      ambilSemuaFavorit().then((favs) => {
        setSudahFavorit(favs.some((k) => k.id === kotaAktif.id));
      });
    }, [kotaAktif])
  );

  // Algoritma pencarian adaptif (Online API -> Fallback Lokal / Offline Langsung Lokal)
  useEffect(() => {
    let aktif = true;

    async function jalankanPencarian() {
      const kataKunci = teksTertunda.trim();
      if (!kataKunci) {
        if (aktif) {
          setHasilPencarian([]);
          setSumberHasilLokal(false);
        }
        return;
      }

      // KONDISI 1: Sedang OFFLINE -> Gunakan dataset kota lokal langsung
      if (!isConnected) {
        const lokal = cariKotaLokal(kataKunci);
        if (aktif) {
          setHasilPencarian(lokal);
          setSumberHasilLokal(true);
        }
        return;
      }

      // KONDISI 2: Sedang ONLINE -> Panggil API Geocoding eksternal
      try {
        const hasil = await cariKota(kataKunci);
        if (!aktif) return;

        if (hasil && hasil.length > 0) {
          setHasilPencarian(hasil);
          setSumberHasilLokal(false);
        } else {
          // Jika API tidak menemukan hasil, fallback ke dataset kota lokal
          const lokal = cariKotaLokal(kataKunci);
          setHasilPencarian(lokal);
          setSumberHasilLokal(true);
        }
      } catch {
        if (!aktif) return;
        // Fallback jika API geocoding gagal / timeout
        const lokal = cariKotaLokal(kataKunci);
        setHasilPencarian(lokal);
        setSumberHasilLokal(true);
      }
    }

    jalankanPencarian();

    return () => {
      aktif = false;
    };
  }, [teksTertunda, isConnected]);

  async function handlePilihKota(kota: HasilGeocoding) {
    setTeksCari("");
    setHasilPencarian([]);
    await pilihKota(kota);
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();

    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
      return;
    }

    if (status === "unavailable") {
      setPesanLokasi(
        "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual."
      );
      return;
    }

    setPesanLokasi(null);
    try {
      const koordinat = await ambilKoordinatSaatIni();
      await handlePilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "Indonesia",
      });
    } catch {
      setPesanLokasi("Gagal mendeteksi lokasi saat ini.");
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Global Status Jaringan Offline */}
        <OfflineBanner
          isOffline={!isConnected}
          onCobaLagi={muatUlangData}
          pesan="Anda sedang dalam mode offline. Menggunakan database kota & data cache."
        />

        {/* Input Pencarian dengan Indikator Mode Offline */}
        <SearchBox
          onCari={setTeksCari}
          isOffline={!isConnected}
          isUsingLocalData={sumberHasilLokal}
        />

        {/* Daftar Hasil Pencarian */}
        {hasilPencarian.length > 0 && (
          <View
            style={[
              styles.hasilPencarianContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.hasilHeader,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderBottomColor: colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[styles.hasilHeaderJudul, { color: colors.textSecondary }]}
              >
                Hasil Pencarian
              </Text>
              {sumberHasilLokal && (
                <View style={styles.badgeHasilLokal}>
                  <Ionicons name="folder-outline" size={10} color="#856404" />
                  <Text style={styles.badgeHasilLokalText}>Mode Offline</Text>
                </View>
              )}
            </View>

            {hasilPencarian.map((kota) => (
              <TouchableOpacity
                key={`${kota.id}-${kota.name}`}
                style={[
                  styles.itemKota,
                  { borderBottomColor: colors.cardBorder },
                ]}
                onPress={() => handlePilihKota(kota)}
              >
                <View style={styles.itemKotaInfo}>
                  <Text style={[styles.itemKotaNama, { color: colors.text }]}>
                    {kota.name}
                  </Text>
                  <Text
                    style={[
                      styles.itemKotaWilayah,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {kota.admin1 ? `${kota.admin1}, ` : ""}
                    {kota.country || "Indonesia"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.icon} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tombol Lokasi Saat Ini */}
        <TouchableOpacity
          style={[
            styles.btnLokasi,
            {
              backgroundColor: colors.tintSubtle,
              borderColor: colors.tint,
            },
          ]}
          onPress={gunakanLokasiSaatIni}
        >
          <Ionicons name="navigate-circle-outline" size={18} color={colors.tint} />
          <Text style={[styles.btnLokasiText, { color: colors.tint }]}>
            Gunakan Lokasi Saat Ini
          </Text>
        </TouchableOpacity>

        {pesanLokasi && (
          <Text style={[styles.pesanLokasi, { color: colors.textSecondary }]}>
            {pesanLokasi}
          </Text>
        )}

        {/* Riwayat Pencarian Cepat (Maksimal 10 item terbaru) */}
        {!teksCari && riwayatPencarian.length > 0 && (
          <View style={styles.riwayatContainer}>
            <View style={styles.riwayatHeader}>
              <View style={styles.riwayatHeaderLabel}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.riwayatJudul, { color: colors.textSecondary }]}>
                  Pencarian Terakhir ({riwayatPencarian.length}/10)
                </Text>
              </View>
              <TouchableOpacity onPress={() => hapusRiwayat()}>
                <Text style={[styles.hapusRiwayatText, { color: colors.danger }]}>
                  Hapus
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.riwayatChipsList}
            >
              {riwayatPencarian.map((item) => {
                const isActive = kotaAktif?.name === item.name;
                return (
                  <TouchableOpacity
                    key={`riwayat-${item.id}-${item.name}`}
                    style={[
                      styles.chipRiwayat,
                      {
                        backgroundColor: isActive
                          ? colors.tint
                          : colors.surfaceSubtle,
                        borderColor: isActive ? colors.tint : colors.cardBorder,
                      },
                    ]}
                    onPress={() => handlePilihKota(item)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: isActive
                            ? "#FFFFFF"
                            : colors.textSecondary,
                          fontWeight: isActive ? "700" : "500",
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Loading Indicator */}
        {sedangMemuat && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Memuat data cuaca...
            </Text>
          </View>
        )}

        {/* Pesan Error / Notifikasi */}
        {pesanError && (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: colors.dangerBackground,
                borderColor: colors.dangerBorder,
              },
            ]}
          >
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {pesanError}
            </Text>
            <Button
              title="Coba Lagi"
              color={colors.tint}
              onPress={muatUlangData}
            />
          </View>
        )}

        {/* Kartu Cuaca Utama */}
        {cuaca && kualitasUdara && kotaAktif && !sedangMemuat && (
          <View style={styles.cuacaContainer}>
            <WeatherCard
              kota={kotaAktif.name}
              suhu={cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(kualitasUdara.indeksAQI)}
              indeksAQI={kualitasUdara.indeksAQI}
              isOffline={!isConnected}
              isCached={isDataCached}
              isEstimasi={isDataEstimasi}
              terakhirDiperbarui={terakhirDiperbarui ?? undefined}
              catatanOffline="Data cuaca/AQI akan diperbarui saat kembali online"
            />

            {/* Tombol Tambahkan ke Favorit */}
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
                      id: String(kotaAktif.id),
                      nama: kotaAktif.name,
                      lat: String(kotaAktif.latitude),
                      lon: String(kotaAktif.longitude),
                    },
                  })
                }
              >
                <Ionicons name="heart-outline" size={18} color="#FFFFFF" />
                <Text style={styles.btnFavoritText}>Tambahkan ke Favorit</Text>
              </TouchableOpacity>
            )}

            {/* Detail Cuaca Tambahan */}
            <View
              style={[
                styles.detailCuacaCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Text style={[styles.detailCuacaBaris, { color: colors.text }]}>
                Kondisi: {labelKodeCuaca(cuaca.saatIni.kodeCuaca)} • Angin{" "}
                {cuaca.saatIni.kecepatanAngin} km/j
              </Text>
              {cuaca.harian.suhuMinimal.length > 0 &&
                cuaca.harian.suhuMaksimal.length > 0 && (
                  <Text
                    style={[
                      styles.detailCuacaBaris,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Rentang Hari Ini: {cuaca.harian.suhuMinimal[0]}°C -{" "}
                    {cuaca.harian.suhuMaksimal[0]}°C
                  </Text>
                )}
            </View>

            {/* Detail Polutan Kualitas Udara */}
            <Text style={[styles.polutanText, { color: colors.textSecondary }]}>
              PM2.5: {kualitasUdara.pm25} µg/m³ • PM10: {kualitasUdara.pm10} µg/m³
            </Text>
          </View>
        )}

        <AtribusiCuaca />
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
    gap: 14,
  },
  btnLokasi: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnLokasiText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pesanLokasi: {
    fontSize: 12,
    textAlign: "center",
  },
  hasilPencarianContainer: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  hasilHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  hasilHeaderJudul: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  badgeHasilLokal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeHasilLokalText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#856404",
  },
  itemKota: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemKotaInfo: {
    gap: 2,
  },
  itemKotaNama: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemKotaWilayah: {
    fontSize: 12,
  },
  riwayatContainer: {
    gap: 8,
  },
  riwayatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  riwayatHeaderLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  riwayatJudul: {
    fontSize: 12,
    fontWeight: "600",
  },
  hapusRiwayatText: {
    fontSize: 11,
    fontWeight: "600",
  },
  riwayatChipsList: {
    gap: 8,
  },
  chipRiwayat: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
  },
  cuacaContainer: {
    gap: 12,
  },
  btnFavorit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnFavoritText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  detailCuacaCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  detailCuacaBaris: {
    fontSize: 13,
  },
  polutanText: {
    fontSize: 11,
    textAlign: "center",
  },
});
