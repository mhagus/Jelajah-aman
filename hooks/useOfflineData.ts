// hooks/useOfflineData.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { useNetworkStatus } from "./useNetworkStatus";
import {
  ambilCacheCuaca,
  ambilKotaAktif,
  ambilRiwayatPencarian,
  bersihkanSeluruhCache,
  hapusCacheKota,
  hapusRiwayatPencarian,
  ItemCacheKota,
  simpanCacheCuaca,
  simpanKotaAktif,
  simpanRiwayatPencarian,
} from "../services/offlineStorage";
import { ambilCuaca } from "../services/weatherService";
import { ambilKualitasUdara } from "../services/airQualityService";
import { dapatkanEstimasiCuacaDanAQI, DAFTAR_KOTA_INDONESIA } from "../constants/cities";
import { HasilGeocoding } from "../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../types/weather";

export interface StateDataOffline {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string;
  kotaAktif: HasilGeocoding | null;
  cuaca: DataCuacaLengkap | null;
  kualitasUdara: DataKualitasUdara | null;
  isDataCached: boolean;
  isDataEstimasi: boolean;
  terakhirDiperbarui: string | null;
  riwayatPencarian: HasilGeocoding[];
  sedangMemuat: boolean;
  pesanError: string | null;
  pilihKota: (kota: HasilGeocoding) => Promise<void>;
  muatUlangData: () => Promise<void>;
  hapusRiwayat: (id?: number) => Promise<void>;
  hapusCache: (namaKota: string, idKota?: number) => Promise<boolean>;
  bersihkanSemuaCache: () => Promise<void>;
}

export function useOfflineData(): StateDataOffline {
  const { isConnected, isInternetReachable, connectionType } = useNetworkStatus();

  const [kotaAktif, setKotaAktif] = useState<HasilGeocoding | null>(null);
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(null);
  const [isDataCached, setIsDataCached] = useState(false);
  const [isDataEstimasi, setIsDataEstimasi] = useState(false);
  const [terakhirDiperbarui, setTerakhirDiperbarui] = useState<string | null>(null);
  const [riwayatPencarian, setRiwayatPencarian] = useState<HasilGeocoding[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  // Muat data awal (fallback cache dan riwayat saat aplikasi dibuka)
  useEffect(() => {
    let aktif = true;

    async function inisialisasiDataAwal() {
      try {
        const [riwayat, kotaTersimpan] = await Promise.all([
          ambilRiwayatPencarian(),
          ambilKotaAktif(),
        ]);

        if (!aktif) return;
        setRiwayatPencarian(riwayat);

        // Jika ada kota terakhir yang tersimpan, muat data cuaca dari cache
        const kotaTarget =
          kotaTersimpan ||
          (riwayat.length > 0 ? riwayat[0] : DAFTAR_KOTA_INDONESIA[0]);

        if (kotaTarget) {
          setKotaAktif(kotaTarget);
          const cache = await ambilCacheCuaca(kotaTarget.name);

          if (!aktif) return;
          if (cache) {
            setCuaca(cache.cuaca);
            setKualitasUdara(cache.kualitasUdara);
            setIsDataCached(true);
            setIsDataEstimasi(Boolean(cache.isEstimasi));
            setTerakhirDiperbarui(cache.disimpanPada);
          } else {
            // Gunakan estimasi default jika belum ada cache
            const estimasi = dapatkanEstimasiCuacaDanAQI(kotaTarget);
            setCuaca(estimasi.cuaca);
            setKualitasUdara(estimasi.kualitasUdara);
            setIsDataCached(false);
            setIsDataEstimasi(true);
            setTerakhirDiperbarui(null);
          }
        }
      } catch (err) {
        console.error("Gagal inisialisasi data offline:", err);
      }
    }

    inisialisasiDataAwal();

    return () => {
      aktif = false;
    };
  }, []);

  const pilihKota = useCallback(
    async (kota: HasilGeocoding) => {
      const idSaatIni = ++requestIdRef.current;
      setKotaAktif(kota);
      setSedangMemuat(true);
      setPesanError(null);

      // Simpan kota aktif & masukkan ke riwayat pencarian
      await simpanKotaAktif(kota);
      const riwayatBaru = await simpanRiwayatPencarian(kota);
      setRiwayatPencarian(riwayatBaru);

      // KONDISI 1: MODE OFFLINE (isConnected === false)
      if (!isConnected) {
        try {
          const cache = await ambilCacheCuaca(kota.name);
          if (idSaatIni !== requestIdRef.current) return;

          if (cache) {
            // Kota pernah dicari sebelumnya, gunakan cache
            setCuaca(cache.cuaca);
            setKualitasUdara(cache.kualitasUdara);
            setIsDataCached(true);
            setIsDataEstimasi(Boolean(cache.isEstimasi));
            setTerakhirDiperbarui(cache.disimpanPada);
          } else {
            // Kota baru dicari saat offline -> gunakan estimasi lokal
            const estimasi = dapatkanEstimasiCuacaDanAQI(kota);
            setCuaca(estimasi.cuaca);
            setKualitasUdara(estimasi.kualitasUdara);
            setIsDataCached(false);
            setIsDataEstimasi(true);
            setTerakhirDiperbarui(null);

            // Simpan estimasi ini ke cache bertanda isEstimasi: true
            await simpanCacheCuaca(
              kota,
              estimasi.cuaca,
              estimasi.kualitasUdara,
              true
            );
          }
        } finally {
          if (idSaatIni === requestIdRef.current) {
            setSedangMemuat(false);
          }
        }
        return;
      }

      // KONDISI 2: MODE ONLINE (isConnected === true)
      try {
        const [dataCuaca, dataAQI] = await Promise.all([
          ambilCuaca(kota.latitude, kota.longitude),
          ambilKualitasUdara(kota.latitude, kota.longitude),
        ]);

        if (idSaatIni !== requestIdRef.current) return;

        setCuaca(dataCuaca);
        setKualitasUdara(dataAQI);
        setIsDataCached(false);
        setIsDataEstimasi(false);
        const waktuSekarang = new Date().toISOString();
        setTerakhirDiperbarui(waktuSekarang);

        // Perbarui cache lokal dengan data online terbaru
        await simpanCacheCuaca(kota, dataCuaca, dataAQI, false);
      } catch (err) {
        if (idSaatIni !== requestIdRef.current) return;

        // Fallback jika API gagal (misal koneksi terputus saat request)
        const cache = await ambilCacheCuaca(kota.name);
        if (cache) {
          setCuaca(cache.cuaca);
          setKualitasUdara(cache.kualitasUdara);
          setIsDataCached(true);
          setIsDataEstimasi(Boolean(cache.isEstimasi));
          setTerakhirDiperbarui(cache.disimpanPada);
          setPesanError("Koneksi gagal. Menampilkan data tersimpan terakhir.");
        } else {
          const estimasi = dapatkanEstimasiCuacaDanAQI(kota);
          setCuaca(estimasi.cuaca);
          setKualitasUdara(estimasi.kualitasUdara);
          setIsDataCached(false);
          setIsDataEstimasi(true);
          setPesanError("Gagal mengambil data terkini. Menampilkan estimasi data lokal.");
        }
      } finally {
        if (idSaatIni === requestIdRef.current) {
          setSedangMemuat(false);
        }
      }
    },
    [isConnected]
  );

  const muatUlangData = useCallback(async () => {
    if (kotaAktif) {
      await pilihKota(kotaAktif);
    }
  }, [kotaAktif, pilihKota]);

  const hapusRiwayat = useCallback(async (id?: number) => {
    await hapusRiwayatPencarian(id);
    const sisa = await ambilRiwayatPencarian();
    setRiwayatPencarian(sisa);
  }, []);

  const hapusCache = useCallback(
    async (namaKota: string, idKota?: number): Promise<boolean> => {
      const berhasil = await hapusCacheKota(namaKota, idKota);
      if (
        kotaAktif &&
        kotaAktif.name.toLowerCase().trim() === namaKota.toLowerCase().trim()
      ) {
        setIsDataCached(false);
      }
      return berhasil;
    },
    [kotaAktif]
  );

  const bersihkanSemuaCache = useCallback(async () => {
    await bersihkanSeluruhCache();
    setIsDataCached(false);
  }, []);

  return {
    isConnected,
    isInternetReachable,
    connectionType,
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
    hapusCache,
    bersihkanSemuaCache,
  };
}
