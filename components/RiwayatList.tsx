// components/RiwayatList.tsx
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";

export interface InfoRiwayatItem {
  id?: number;
  nama: string;
  adminWilayah?: string;
  isCached?: boolean;
  suhuCached?: number;
  waktuDisimpan?: string;
}

interface RiwayatListProps {
  daftarItem: (string | InfoRiwayatItem)[];
  onPilihKota: (namaKota: string) => void;
  onHapusRiwayat?: (namaKota: string) => void;
  onHapusCache?: (namaKota: string) => void;
}

export default function RiwayatList({
  daftarItem,
  onPilihKota,
  onHapusRiwayat,
  onHapusCache,
}: RiwayatListProps) {
  const { colors, isDark } = useAppTheme();

  if (daftarItem.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Ionicons name="time-outline" size={36} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Belum ada riwayat pencarian kota
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
          Pencarian kota yang Anda lakukan akan otomatis tersimpan di sini
        </Text>
      </View>
    );
  }

  function handleKonfirmasiHapusCache(namaKota: string) {
    if (!onHapusCache) return;

    if (Platform.OS === "web") {
      const yakin = window.confirm(
        `Hapus cache untuk ${namaKota}?\nData cuaca offline untuk kota ini akan dihapus dari perangkat.`
      );
      if (yakin) {
        onHapusCache(namaKota);
      }
    } else {
      Alert.alert(
        "Hapus Cache Cuaca",
        `Apakah Anda yakin ingin menghapus data cache cuaca untuk "${namaKota}"? Data offline untuk kota ini tidak akan tersedia sampai dicari kembali saat online.`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus Cache",
            style: "destructive",
            onPress: () => onHapusCache(namaKota),
          },
        ]
      );
    }
  }

  function formatWaktu(iso?: string) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      });
    } catch {
      return "";
    }
  }

  return (
    <View style={styles.container}>
      {daftarItem.map((item, index) => {
        const itemObj: InfoRiwayatItem =
          typeof item === "string" ? { nama: item } : item;

        return (
          <View
            key={`${itemObj.nama}-${index}`}
            style={[
              styles.itemCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            {/* Bagian Klik: Memunculkan Pencarian Kota (UTS Nomor 2) */}
            <TouchableOpacity
              style={styles.mainClickable}
              onPress={() => onPilihKota(itemObj.nama)}
              accessibilityLabel={`Pilih kota ${itemObj.nama} untuk melihat cuaca`}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconLingkaran,
                  { backgroundColor: isDark ? "#0c4a6e" : "#E0F2FE" },
                ]}
              >
                <Ionicons name="location" size={18} color={colors.tint} />
              </View>

              <View style={styles.infoWrapper}>
                <View style={styles.namaRow}>
                  <Text style={[styles.kotaText, { color: colors.text }]}>
                    {itemObj.nama}
                  </Text>
                  {itemObj.suhuCached !== undefined && (
                    <Text style={[styles.suhuBadge, { color: colors.tint }]}>
                      {itemObj.suhuCached}°C
                    </Text>
                  )}
                </View>

                {itemObj.adminWilayah ? (
                  <Text
                    style={[styles.wilayahText, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {itemObj.adminWilayah}
                  </Text>
                ) : null}

                {/* Indikator Status Cache */}
                <View style={styles.metaRow}>
                  {itemObj.isCached ? (
                    <View
                      style={[
                        styles.badgeCache,
                        {
                          backgroundColor: isDark ? "#052e16" : "#DCFCE7",
                          borderColor: isDark ? "#14532d" : "#86EFAC",
                        },
                      ]}
                    >
                      <Ionicons
                        name="server"
                        size={10}
                        color={isDark ? "#4ade80" : "#15803d"}
                      />
                      <Text
                        style={[
                          styles.badgeCacheText,
                          { color: isDark ? "#4ade80" : "#15803d" },
                        ]}
                      >
                        Cache Tersedia
                      </Text>
                      {itemObj.waktuDisimpan ? (
                        <Text
                          style={[
                            styles.badgeTimeText,
                            { color: isDark ? "#86efac" : "#166534" },
                          ]}
                        >
                          • {formatWaktu(itemObj.waktuDisimpan)}
                        </Text>
                      ) : null}
                    </View>
                  ) : (
                    <Text style={[styles.noCacheText, { color: colors.textMuted }]}>
                      Belum ada cache offline
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Bagian Aksi: Tombol Hapus Cache (UTS Nomor 3) & Tombol Hapus Riwayat */}
            <View style={styles.actionButtons}>
              {/* Tombol Hapus Cache */}
              {itemObj.isCached && onHapusCache ? (
                <TouchableOpacity
                  onPress={() => handleKonfirmasiHapusCache(itemObj.nama)}
                  style={[
                    styles.btnHapusCache,
                    {
                      backgroundColor: isDark ? "#451a03" : "#FEF3C7",
                      borderColor: isDark ? "#78350f" : "#FDE68A",
                    },
                  ]}
                  accessibilityLabel={`Hapus cache untuk ${itemObj.nama}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={13}
                    color={isDark ? "#fbbf24" : "#B45309"}
                  />
                  <Text
                    style={[
                      styles.btnHapusCacheText,
                      { color: isDark ? "#fbbf24" : "#B45309" },
                    ]}
                  >
                    Hapus Cache
                  </Text>
                </TouchableOpacity>
              ) : null}

              {/* Tombol Hapus Dari Riwayat */}
              {onHapusRiwayat ? (
                <TouchableOpacity
                  onPress={() => onHapusRiwayat(itemObj.nama)}
                  style={styles.btnHapusRiwayat}
                  accessibilityLabel={`Hapus ${itemObj.nama} dari daftar riwayat`}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  mainClickable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginRight: 8,
  },
  iconLingkaran: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  infoWrapper: {
    flex: 1,
    gap: 3,
  },
  namaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 4,
  },
  kotaText: {
    fontSize: 16,
    fontWeight: "700",
  },
  suhuBadge: {
    fontSize: 14,
    fontWeight: "700",
  },
  wilayahText: {
    fontSize: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  badgeCache: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeCacheText: {
    fontSize: 10,
    fontWeight: "700",
  },
  badgeTimeText: {
    fontSize: 9,
    fontWeight: "500",
  },
  noCacheText: {
    fontSize: 10,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  btnHapusCache: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnHapusCacheText: {
    fontSize: 11,
    fontWeight: "600",
  },
  btnHapusRiwayat: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
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