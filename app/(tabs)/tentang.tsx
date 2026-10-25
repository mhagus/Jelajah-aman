// app/(tabs)/tentang.tsx - Halaman Tentang Aplikasi
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../context/ThemeContext";

export default function TabTentang() {
  const { colors, isDark } = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View
            style={[
              styles.logoWrapper,
              { backgroundColor: isDark ? "#0c4a6e" : "#E0F2FE" },
            ]}
          >
            <Ionicons name="partly-sunny" size={44} color={colors.tint} />
          </View>
          <Text style={[styles.namaAplikasi, { color: colors.text }]}>
            Jelajah Aman
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Pemantau Cuaca & Kualitas Udara Terintegrasi
          </Text>
          <View
            style={[
              styles.badgeVersi,
              { backgroundColor: colors.surfaceSubtle },
            ]}
          >
            <Text style={[styles.versiText, { color: colors.tint }]}>
              Versi 1.0.0 • Edisi UTS PBP 2026
            </Text>
          </View>
        </View>

        {/* Fitur Utama UTS */}
        <View style={styles.section}>
          <Text style={[styles.sectionJudul, { color: colors.text }]}>
            Fitur Utama Aplikasi
          </Text>

          <View
            style={[
              styles.fiturCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.fiturItem}>
              <View
                style={[
                  styles.fiturIcon,
                  { backgroundColor: isDark ? "#0c4a6e" : "#E0F2FE" },
                ]}
              >
                <Ionicons name="compass-outline" size={18} color={colors.tint} />
              </View>
              <View style={styles.fiturTextGroup}>
                <Text style={[styles.fiturTitle, { color: colors.text }]}>
                  Pencarian Kota Adaptif
                </Text>
                <Text
                  style={[styles.fiturDesc, { color: colors.textSecondary }]}
                >
                  Mencari data cuaca kota via API saat online, dan otomatis
                  beralih ke database lokal saat offline.
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.fiturItem}>
              <View
                style={[
                  styles.fiturIcon,
                  { backgroundColor: isDark ? "#052e16" : "#DCFCE7" },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={isDark ? "#4ade80" : "#16A34A"}
                />
              </View>
              <View style={styles.fiturTextGroup}>
                <Text style={[styles.fiturTitle, { color: colors.text }]}>
                  Riwayat Pencarian Cepat
                </Text>
                <Text
                  style={[styles.fiturDesc, { color: colors.textSecondary }]}
                >
                  Menyimpan hingga 10 pencarian terakhir secara lokal. Cukup ketuk
                  untuk menampilkan cuaca kota tersebut kembali.
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.fiturItem}>
              <View
                style={[
                  styles.fiturIcon,
                  { backgroundColor: isDark ? "#451a03" : "#FEF3C7" },
                ]}
              >
                <Ionicons
                  name="server-outline"
                  size={18}
                  color={isDark ? "#fbbf24" : "#D97706"}
                />
              </View>
              <View style={styles.fiturTextGroup}>
                <Text style={[styles.fiturTitle, { color: colors.text }]}>
                  Cache Offline & Manajemen
                </Text>
                <Text
                  style={[styles.fiturDesc, { color: colors.textSecondary }]}
                >
                  Menyimpan hasil cuaca di cache lokal. Lengkap dengan tombol
                  hapus cache dan dialog konfirmasi Alert.
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.fiturItem}>
              <View
                style={[
                  styles.fiturIcon,
                  { backgroundColor: isDark ? "#312e81" : "#EEF2FF" },
                ]}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={18}
                  color={isDark ? "#818cf8" : "#4F46E5"}
                />
              </View>
              <View style={styles.fiturTextGroup}>
                <Text style={[styles.fiturTitle, { color: colors.text }]}>
                  Tema Gelap / Terang Dinamis
                </Text>
                <Text
                  style={[styles.fiturDesc, { color: colors.textSecondary }]}
                >
                  Mendukung mode Terang, Gelap, dan Ikuti Sistem yang berubah
                  secara instan ke seluruh antarmuka aplikasi.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Informasi Pengembang */}
        <View style={styles.section}>
          <Text style={[styles.sectionJudul, { color: colors.text }]}>
            Informasi Pengembang
          </Text>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.infoBaris}>
              <Ionicons name="person-circle-outline" size={20} color={colors.tint} />
              <View style={styles.infoTeks}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Nama Mahasiswa
                </Text>
                <Text style={[styles.infoNilai, { color: colors.text }]}>
                  Muhammad Agus
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.infoBaris}>
              <Ionicons name="school-outline" size={20} color={colors.tint} />
              <View style={styles.infoTeks}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Mata Kuliah
                </Text>
                <Text style={[styles.infoNilai, { color: colors.text }]}>
                  Pemrograman Berbasis Perangkat Bergerak (PBP)
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.infoBaris}>
              <Ionicons name="code-slash-outline" size={20} color={colors.tint} />
              <View style={styles.infoTeks}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Teknologi
                </Text>
                <Text style={[styles.infoNilai, { color: colors.text }]}>
                  React Native • Expo Router • TypeScript
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
  heroCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  namaAplikasi: {
    fontSize: 22,
    fontWeight: "bold",
  },
  tagline: {
    fontSize: 13,
    textAlign: "center",
  },
  badgeVersi: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  versiText: {
    fontSize: 11,
    fontWeight: "600",
  },
  section: {
    gap: 10,
  },
  sectionJudul: {
    fontSize: 16,
    fontWeight: "700",
  },
  fiturCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  fiturItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  fiturIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  fiturTextGroup: {
    flex: 1,
    gap: 3,
  },
  fiturTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  fiturDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  infoBaris: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoTeks: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
  },
  infoNilai: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 1,
  },
});
