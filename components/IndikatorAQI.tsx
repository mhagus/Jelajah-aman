// components/IndikatorAQI.tsx
import { View, Text, StyleSheet } from "react-native";
import { LaporanUdara } from "../types/cuaca";

export interface IndikatorAQIProps {
  laporan?: LaporanUdara;
  kota?: string;
  indeksAQI?: number;
  tingkat?: "BAIK" | "SEDANG" | "TIDAK_SEHAT" | "BERBAHAYA";
  diperbaruiPada?: string;
}

export default function IndikatorAQI(props: IndikatorAQIProps) {
  const data: LaporanUdara = props.laporan
    ? props.laporan
    : {
        kota: props.kota ?? "",
        indeksAQI: props.indeksAQI ?? 0,
        tingkat: props.tingkat ?? "BAIK",
        diperbaruiPada: props.diperbaruiPada,
      };

  const { kota, indeksAQI, tingkat, diperbaruiPada } = data;

  const getWarnaAQI = (statusTingkat: LaporanUdara["tingkat"]) => {
    switch (statusTingkat) {
      case "BAIK":
        return "green";
      case "SEDANG":
        return "orange";
      case "TIDAK_SEHAT":
        return "red";
      case "BERBAHAYA":
        return "purple";
      default:
        return "black";
    }
  };

  const warnaTeks = getWarnaAQI(tingkat);

  return (
    <View style={styles.container}>
      <Text style={styles.kotaText}>Kota: {kota}</Text>
      <Text style={styles.aqiText}>Indeks AQI: {indeksAQI}</Text>
      <Text style={[styles.tingkatText, { color: warnaTeks }]}>
        Tingkat: {tingkat}
      </Text>
      {diperbaruiPada ? (
        <Text style={styles.diperbaruiText}>Diperbarui: {diperbaruiPada}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#F4F7FA",
    gap: 4,
  },
  kotaText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  aqiText: {
    fontSize: 16,
  },
  tingkatText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  diperbaruiText: {
    fontSize: 12,
    color: "#666",
  },
});
