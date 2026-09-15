// app/(tabs)/tentang.tsx - Halaman Tentang Aplikasi (Latihan Mandiri Tahap 10)
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../constants/styles";

export default function TabTentang() {
  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.sedang, gap: spacing.kecil }}>
      <Text
        accessibilityLabel="Judul Halaman Tentang Jelajah Aman"
        style={{ fontSize: typeScale.judul, fontWeight: "bold" }}
      >
        Jelajah Aman
      </Text>
      <Text style={{ fontSize: typeScale.subjudul }}>Versi 1.0.0</Text>
      <Text style={{ fontSize: typeScale.isi }}>
        Aplikasi Pemantau Cuaca & Kualitas Udara
      </Text>
      <Text style={{ fontSize: typeScale.keterangan, color: "#666" }}>
        Pengembang: Mahasiswa Praktikum Pemrograman Berbasis Platform
      </Text>
    </SafeAreaView>
  );
}
