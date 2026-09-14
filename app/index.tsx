// app/index.tsx
import { useState } from "react";
import { View } from "react-native";
import WeatherCard from "../components/WeatherCard";
import SearchBox from "../components/SearchBox";
import RiwayatList from "../components/RiwayatList";
import IndikatorAQI from "../components/IndikatorAQI";
import { LaporanUdara } from "../types/cuaca";

export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);

  function handleCari(kota: string) {
    setKotaAktif(kota);
    if (!riwayat.includes(kota)) {
      setRiwayat([...riwayat, kota]);
    }
  }

  const contohLaporanUdara: LaporanUdara = {
    kota: kotaAktif,
    indeksAQI: 42,
    tingkat: "BAIK",
    diperbaruiPada: "2026-09-15 10:00",
  };

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <SearchBox onCari={handleCari} />
      <WeatherCard kota={kotaAktif} suhu={29} tingkatAQI="BAIK" />
      <IndikatorAQI laporan={contohLaporanUdara} />
      <RiwayatList daftarKota={riwayat} />
    </View>
  );
}