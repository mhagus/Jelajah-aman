// types/laporanUdara.ts
export type TingkatAQI = "BAIK" | "SEDANG" | "TIDAK_SEHAT" | "BERBAHAYA";

export interface LaporanUdara {
  kota: string;
  indeksAQI: number;
  tingkat: TingkatAQI;
  diperbaruiPada?: string;
  isOffline?: boolean;
  isEstimasi?: boolean;
}
