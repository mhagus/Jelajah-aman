// app/tambah-favorit.tsx
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { tambahFavorit } from "../services/favoritStorage";

export default function ModalTambahFavorit() {
  const { colors, isDark } = useAppTheme();
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  async function simpan() {
    await tambahFavorit({
      id: Number(id || Date.now()),
      nama: nama || "Kota Favorit",
      latitude: Number(lat || 0),
      longitude: Number(lon || 0),
    });
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.modalCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: isDark ? "#4c0519" : "#FFE4E6" },
          ]}
        >
          <Ionicons name="heart" size={36} color="#E11D48" />
        </View>

        <Text style={[styles.judulModal, { color: colors.text }]}>
          Tambah ke Favorit
        </Text>
        <Text style={[styles.subjudulModal, { color: colors.textSecondary }]}>
          Apakah Anda ingin menambahkan kota{" "}
          <Text style={{ fontWeight: "700", color: colors.text }}>
            {nama}
          </Text>{" "}
          ke daftar kota favorit?
        </Text>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={[
              styles.btnBatal,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.btnBatalText, { color: colors.textSecondary }]}>
              Batal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btnSimpan,
              { backgroundColor: isDark ? "#065f46" : "#0D9488" },
            ]}
            onPress={simpan}
          >
            <Text style={styles.btnSimpanText}>Simpan Favorit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  judulModal: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subjudulModal: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  btnGroup: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 12,
  },
  btnBatal: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnBatalText: {
    fontSize: 14,
    fontWeight: "600",
  },
  btnSimpan: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSimpanText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
