// app/(tabs)/pengaturan.tsx
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { ThemeMode } from "../../constants/theme";
import { useAppTheme } from "../../context/ThemeContext";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import {
  ambilRiwayatPencarian,
  ambilSemuaItemCache,
  bersihkanSeluruhCache,
  hapusRiwayatPencarian,
} from "../../services/offlineStorage";

interface OpsiTema {
  id: ThemeMode;
  judul: string;
  deskripsi: string;
  ikon: keyof typeof Ionicons.glyphMap;
}

const DAFTAR_OPSI_TEMA: OpsiTema[] = [
  {
    id: "light",
    judul: "Mode Terang",
    deskripsi: "Tampilan cerah dan nyaman digunakan pada kondisi terang",
    ikon: "sunny-outline",
  },
  {
    id: "dark",
    judul: "Mode Gelap",
    deskripsi: "Tampilan gelap yang ramah mata dan menghemat daya baterai",
    ikon: "moon-outline",
  },
  {
    id: "system",
    judul: "Ikuti Sistem",
    deskripsi: "Menyesuaikan otomatis dengan setelan tampilan perangkat Anda",
    ikon: "phone-portrait-outline",
  },
];

export default function TabPengaturan() {
  const { themeMode, resolvedTheme, isDark, colors, setThemeMode } = useAppTheme();
  const { isConnected } = useNetworkStatus();

  const [jumlahCache, setJumlahCache] = useState(0);
  const [jumlahRiwayat, setJumlahRiwayat] = useState(0);

  const muatStatistik = useCallback(async () => {
    try {
      const [cacheItems, riwayatItems] = await Promise.all([
        ambilSemuaItemCache(),
        ambilRiwayatPencarian(),
      ]);
      setJumlahCache(cacheItems.length);
      setJumlahRiwayat(riwayatItems.length);
    } catch (e) {
      console.error("Gagal memuat data statistik pengaturan:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatStatistik();
    }, [muatStatistik])
  );

  function handleBersihkanSemuaCache() {
    const aksiHapus = async () => {
      await bersihkanSeluruhCache();
      setJumlahCache(0);
      const pesan = "Seluruh cache data cuaca berhasil dibersihkan.";
      if (Platform.OS === "web") {
        alert(pesan);
      } else {
        Alert.alert("Sukses", pesan);
      }
    };

    if (Platform.OS === "web") {
      const yakin = window.confirm(
        "Apakah Anda yakin ingin menghapus seluruh cache cuaca dari perangkat?"
      );
      if (yakin) {
        aksiHapus();
      }
    } else {
      Alert.alert(
        "Hapus Seluruh Cache Cuaca",
        "Seluruh data cuaca yang tersimpan offline akan dihapus. Anda perlu terhubung ke internet untuk mengambil data baru.",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus Semua Cache",
            style: "destructive",
            onPress: aksiHapus,
          },
        ]
      );
    }
  }

  function handleBersihkanSemuaRiwayat() {
    const aksiHapus = async () => {
      await hapusRiwayatPencarian();
      setJumlahRiwayat(0);
      const pesan = "Seluruh riwayat pencarian telah dibersihkan.";
      if (Platform.OS === "web") {
        alert(pesan);
      } else {
        Alert.alert("Sukses", pesan);
      }
    };

    if (Platform.OS === "web") {
      const yakin = window.confirm("Hapus seluruh riwayat pencarian?");
      if (yakin) {
        aksiHapus();
      }
    } else {
      Alert.alert(
        "Hapus Riwayat Pencarian",
        "Daftar pencarian terakhir akan dikosongkan.",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus Riwayat",
            style: "destructive",
            onPress: aksiHapus,
          },
        ]
      );
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* BAGIAN 1: MODE TAMPILAN (UTS Nomor 4) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={18} color={colors.tint} />
            <Text style={[styles.sectionJudul, { color: colors.text }]}>
              Mode Tampilan (Tema)
            </Text>
          </View>
          <Text style={[styles.sectionDeskripsi, { color: colors.textSecondary }]}>
            Pilih tema tampilan yang diinginkan. Perubahan diterapkan secara
            instan ke seluruh layar aplikasi.
          </Text>

          <View style={styles.opsiList}>
            {DAFTAR_OPSI_TEMA.map((opsi) => {
              const isSelected = themeMode === opsi.id;
              return (
                <TouchableOpacity
                  key={opsi.id}
                  style={[
                    styles.opsiCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isSelected ? colors.tint : colors.cardBorder,
                    },
                    isSelected && {
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setThemeMode(opsi.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.opsiIkonWrapper,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? "#0c4a6e"
                            : "#E0F2FE"
                          : colors.surfaceSubtle,
                      },
                    ]}
                  >
                    <Ionicons
                      name={opsi.ikon}
                      size={20}
                      color={isSelected ? colors.tint : colors.icon}
                    />
                  </View>

                  <View style={styles.opsiContent}>
                    <View style={styles.opsiTitleRow}>
                      <Text
                        style={[
                          styles.opsiJudul,
                          {
                            color: isSelected ? colors.tint : colors.text,
                            fontWeight: isSelected ? "700" : "600",
                          },
                        ]}
                      >
                        {opsi.judul}
                      </Text>
                      {isSelected && (
                        <View
                          style={[
                            styles.badgeAktif,
                            {
                              backgroundColor: isDark ? "#0c4a6e" : "#E0F2FE",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeAktifText,
                              { color: colors.tint },
                            ]}
                          >
                            Aktif ({resolvedTheme === "dark" ? "Gelap" : "Terang"})
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.opsiDeskripsi,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {opsi.deskripsi}
                    </Text>
                  </View>

                  <View style={styles.radioWrapper}>
                    <View
                      style={[
                        styles.radioLingkarLuar,
                        {
                          borderColor: isSelected ? colors.tint : colors.cardBorder,
                        },
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.radioLingkarDalam,
                            { backgroundColor: colors.tint },
                          ]}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* BAGIAN 2: PENYIMPANAN & CACHE KOTA (UTS Nomor 3) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="server-outline" size={18} color={colors.tint} />
            <Text style={[styles.sectionJudul, { color: colors.text }]}>
              Penyimpanan & Cache Lokal
            </Text>
          </View>

          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.infoRow}>
              <View style={styles.infoLabelGroup}>
                <Ionicons
                  name="cloud-done-outline"
                  size={16}
                  color={colors.tint}
                />
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Kota Tersimpan di Cache
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.tint }]}>
                {jumlahCache} Kota
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelGroup}>
                <Ionicons name="time-outline" size={16} color={colors.tint} />
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Riwayat Pencarian
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.tint }]}>
                {jumlahRiwayat} / 10
              </Text>
            </View>
          </View>

          {/* Tombol Aksi Cache */}
          <View style={styles.btnAksiGroup}>
            <TouchableOpacity
              style={[
                styles.btnHapusSemua,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.dangerBorder,
                },
              ]}
              onPress={handleBersihkanSemuaCache}
              disabled={jumlahCache === 0}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={jumlahCache === 0 ? colors.textMuted : colors.danger}
              />
              <Text
                style={[
                  styles.btnHapusSemuaText,
                  {
                    color:
                      jumlahCache === 0 ? colors.textMuted : colors.danger,
                  },
                ]}
              >
                Hapus Seluruh Cache Cuaca
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btnHapusSemua,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={handleBersihkanSemuaRiwayat}
              disabled={jumlahRiwayat === 0}
            >
              <Ionicons
                name="close-circle-outline"
                size={16}
                color={jumlahRiwayat === 0 ? colors.textMuted : colors.textSecondary}
              />
              <Text
                style={[
                  styles.btnHapusSemuaText,
                  {
                    color:
                      jumlahRiwayat === 0
                        ? colors.textMuted
                        : colors.textSecondary,
                  },
                ]}
              >
                Kosongkan Riwayat Pencarian
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BAGIAN 3: STATUS JARINGAN */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wifi-outline" size={18} color={colors.tint} />
            <Text style={[styles.sectionJudul, { color: colors.text }]}>
              Status Jaringan
            </Text>
          </View>

          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.infoRow}>
              <View style={styles.infoLabelGroup}>
                <Ionicons
                  name={isConnected ? "checkmark-circle" : "alert-circle"}
                  size={16}
                  color={isConnected ? colors.success : colors.warning}
                />
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Koneksi Internet
                </Text>
              </View>
              <View
                style={[
                  styles.badgeKoneksi,
                  {
                    backgroundColor: isConnected
                      ? colors.successBackground
                      : colors.warningBackground,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeKoneksiText,
                    {
                      color: isConnected ? colors.success : colors.warning,
                    },
                  ]}
                >
                  {isConnected ? "Online" : "Offline"}
                </Text>
              </View>
            </View>
          </View>
        </View>
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
    gap: 20,
    paddingBottom: 32,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionJudul: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionDeskripsi: {
    fontSize: 12,
    lineHeight: 17,
  },
  opsiList: {
    gap: 10,
  },
  opsiCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  opsiIkonWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  opsiContent: {
    flex: 1,
    gap: 3,
  },
  opsiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  opsiJudul: {
    fontSize: 15,
  },
  badgeAktif: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAktifText: {
    fontSize: 10,
    fontWeight: "700",
  },
  opsiDeskripsi: {
    fontSize: 11,
    lineHeight: 15,
  },
  radioWrapper: {
    paddingLeft: 4,
  },
  radioLingkarLuar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioLingkarDalam: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  infoBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  btnAksiGroup: {
    gap: 8,
  },
  btnHapusSemua: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnHapusSemuaText: {
    fontSize: 13,
    fontWeight: "600",
  },
  badgeKoneksi: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeKoneksiText: {
    fontSize: 11,
    fontWeight: "700",
  },
});