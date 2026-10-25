// services/offlineStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HasilGeocoding } from "../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../types/weather";

const KUNCI_KOTA_AKTIF = "@jelajah_aman:kota_aktif";
const KUNCI_RIWAYAT_PENCARIAN = "@jelajah_aman:riwayat_pencarian";
const KUNCI_CACHE_CUACA = "@jelajah_aman:cache_cuaca_v1";

// Maksimal 10 riwayat pencarian terakhir sesuai instruksi UTS nomor 2
export const MAKS_RIWAYAT_PENCARIAN = 10;

export interface ItemCacheKota {
  kota: HasilGeocoding;
  cuaca: DataCuacaLengkap;
  kualitasUdara: DataKualitasUdara;
  disimpanPada: string; // ISO string
  isEstimasi?: boolean;
}

type PetaCache = Record<string, ItemCacheKota>;

/**
 * Menyimpan data kota aktif terakhir yang dipilih pengguna
 */
export async function simpanKotaAktif(kota: HasilGeocoding): Promise<void> {
  try {
    await AsyncStorage.setItem(KUNCI_KOTA_AKTIF, JSON.stringify(kota));
  } catch (error) {
    console.error("Gagal menyimpan kota aktif:", error);
  }
}

/**
 * Mengambil data kota aktif terakhir yang tersimpan
 */
export async function ambilKotaAktif(): Promise<HasilGeocoding | null> {
  try {
    const raw = await AsyncStorage.getItem(KUNCI_KOTA_AKTIF);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Gagal mengambil kota aktif:", error);
    return null;
  }
}

/**
 * Menyimpan cuaca dan kualitas udara ke cache lokal untuk suatu kota
 */
export async function simpanCacheCuaca(
  kota: HasilGeocoding,
  cuaca: DataCuacaLengkap,
  kualitasUdara: DataKualitasUdara,
  isEstimasi: boolean = false
): Promise<void> {
  try {
    const rawCache = await AsyncStorage.getItem(KUNCI_CACHE_CUACA);
    const petaCache: PetaCache = rawCache ? JSON.parse(rawCache) : {};

    const item: ItemCacheKota = {
      kota,
      cuaca,
      kualitasUdara,
      disimpanPada: new Date().toISOString(),
      isEstimasi,
    };

    // Gunakan normalisasi nama sebagai kunci cache
    const kunci = kota.name.toLowerCase().trim();
    petaCache[kunci] = item;

    // Juga simpan dengan kunci ID jika id valid
    if (kota.id && kota.id > 0) {
      petaCache[`id_${kota.id}`] = item;
    }

    await AsyncStorage.setItem(KUNCI_CACHE_CUACA, JSON.stringify(petaCache));
  } catch (error) {
    console.error("Gagal menyimpan cache cuaca:", error);
  }
}

/**
 * Mengambil cache cuaca dan kualitas udara untuk suatu kota berdasarkan nama atau ID
 */
export async function ambilCacheCuaca(
  namaAtauId: string | number
): Promise<ItemCacheKota | null> {
  try {
    const rawCache = await AsyncStorage.getItem(KUNCI_CACHE_CUACA);
    if (!rawCache) return null;

    const petaCache: PetaCache = JSON.parse(rawCache);

    if (typeof namaAtauId === "number") {
      if (petaCache[`id_${namaAtauId}`]) {
        return petaCache[`id_${namaAtauId}`];
      }
    }

    const kunci = String(namaAtauId).toLowerCase().trim();
    return petaCache[kunci] ?? null;
  } catch (error) {
    console.error("Gagal mengambil cache cuaca:", error);
    return null;
  }
}

/**
 * Menghapus cache cuaca spesifik untuk suatu kota (UTS Tugas 3)
 */
export async function hapusCacheKota(
  namaKota: string,
  idKota?: number
): Promise<boolean> {
  try {
    const rawCache = await AsyncStorage.getItem(KUNCI_CACHE_CUACA);
    if (!rawCache) return true;

    const petaCache: PetaCache = JSON.parse(rawCache);
    const kunci = namaKota.toLowerCase().trim();

    delete petaCache[kunci];

    if (idKota !== undefined && idKota > 0) {
      delete petaCache[`id_${idKota}`];
    }

    // Periksa kunci lain yang mungkin menyimpan kota dengan nama yang sama
    for (const k of Object.keys(petaCache)) {
      if (petaCache[k]?.kota?.name?.toLowerCase().trim() === kunci) {
        delete petaCache[k];
      }
    }

    await AsyncStorage.setItem(KUNCI_CACHE_CUACA, JSON.stringify(petaCache));
    return true;
  } catch (error) {
    console.error("Gagal menghapus cache kota:", error);
    return false;
  }
}

/**
 * Mengambil seluruh daftar item cache unik
 */
export async function ambilSemuaItemCache(): Promise<ItemCacheKota[]> {
  try {
    const rawCache = await AsyncStorage.getItem(KUNCI_CACHE_CUACA);
    if (!rawCache) return [];

    const petaCache: PetaCache = JSON.parse(rawCache);
    const uniqueMap = new Map<string, ItemCacheKota>();

    for (const item of Object.values(petaCache)) {
      if (item && item.kota?.name) {
        const key = item.kota.name.toLowerCase().trim();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      }
    }

    return Array.from(uniqueMap.values());
  } catch (error) {
    console.error("Gagal mengambil seluruh item cache:", error);
    return [];
  }
}

/**
 * Membersihkan seluruh data cache cuaca (Challenge / Reset)
 */
export async function bersihkanSeluruhCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KUNCI_CACHE_CUACA);
  } catch (error) {
    console.error("Gagal membersihkan seluruh cache:", error);
  }
}

/**
 * Menyimpan kota ke daftar riwayat pencarian (maksimal 10 item terbaru, tanpa duplikat - UTS Tugas 2)
 */
export async function simpanRiwayatPencarian(
  kota: HasilGeocoding
): Promise<HasilGeocoding[]> {
  try {
    const riwayatLama = await ambilRiwayatPencarian();
    // Hapus jika sudah ada sebelumnya agar berada di posisi paling atas
    const tanpaDuplikat = riwayatLama.filter(
      (item) => item.name.toLowerCase().trim() !== kota.name.toLowerCase().trim()
    );

    // Maksimal 10 pencarian terakhir sesuai instruksi UTS Nomor 2
    const riwayatBaru = [kota, ...tanpaDuplikat].slice(0, MAKS_RIWAYAT_PENCARIAN);
    await AsyncStorage.setItem(
      KUNCI_RIWAYAT_PENCARIAN,
      JSON.stringify(riwayatBaru)
    );
    return riwayatBaru;
  } catch (error) {
    console.error("Gagal menyimpan riwayat pencarian:", error);
    return [];
  }
}

/**
 * Mengambil seluruh daftar riwayat pencarian
 */
export async function ambilRiwayatPencarian(): Promise<HasilGeocoding[]> {
  try {
    const raw = await AsyncStorage.getItem(KUNCI_RIWAYAT_PENCARIAN);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Gagal mengambil riwayat pencarian:", error);
    return [];
  }
}

/**
 * Menghapus kota tertentu dari riwayat pencarian atau menghapus semua riwayat
 */
export async function hapusRiwayatPencarian(idKota?: number): Promise<void> {
  try {
    if (idKota !== undefined) {
      const daftar = await ambilRiwayatPencarian();
      const sisa = daftar.filter((k) => k.id !== idKota);
      await AsyncStorage.setItem(KUNCI_RIWAYAT_PENCARIAN, JSON.stringify(sisa));
    } else {
      await AsyncStorage.removeItem(KUNCI_RIWAYAT_PENCARIAN);
    }
  } catch (error) {
    console.error("Gagal menghapus riwayat pencarian:", error);
  }
}
