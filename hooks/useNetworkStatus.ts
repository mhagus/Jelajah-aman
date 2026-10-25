// hooks/useNetworkStatus.ts
import { useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

export interface StatusJaringan {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string;
  refreshNetworkStatus: () => Promise<boolean>;
}

export function useNetworkStatus(): StatusJaringan {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    return true; // Default optimistik pada mobile sampai NetInfo memberikan state
  });

  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [connectionType, setConnectionType] = useState<string>("unknown");

  const tanganiPerubahanStatus = useCallback((state: NetInfoState) => {
    // Pada web, terkadang isConnected bernilai boolean atau null, sinkronkan dengan navigator.onLine
    if (Platform.OS === "web" && typeof navigator !== "undefined") {
      const webOnline = navigator.onLine;
      setIsConnected(webOnline);
      setIsInternetReachable(webOnline);
    } else {
      const terhubung = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsConnected(terhubung);
      setIsInternetReachable(state.isInternetReachable);
    }
    setConnectionType(state.type);
  }, []);

  useEffect(() => {
    // 1. Berlangganan NetInfo (Mobile & Web)
    const unsubscribe = NetInfo.addEventListener(tanganiPerubahanStatus);

    // Ambil status awal segera
    NetInfo.fetch().then(tanganiPerubahanStatus).catch(() => {
      // Fallback jika fetch gagal
      if (Platform.OS === "web" && typeof navigator !== "undefined") {
        setIsConnected(navigator.onLine);
      }
    });

    // 2. Listener tambahan khusus platform Web untuk keandalan maksimal
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const onOnline = () => {
        setIsConnected(true);
        setIsInternetReachable(true);
      };
      const onOffline = () => {
        setIsConnected(false);
        setIsInternetReachable(false);
      };

      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);

      return () => {
        unsubscribe();
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
      };
    }

    return () => {
      unsubscribe();
    };
  }, [tanganiPerubahanStatus]);

  const refreshNetworkStatus = useCallback(async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      let status = Boolean(state.isConnected && state.isInternetReachable !== false);
      if (Platform.OS === "web" && typeof navigator !== "undefined") {
        status = navigator.onLine;
      }
      setIsConnected(status);
      return status;
    } catch {
      return isConnected;
    }
  }, [isConnected]);

  return {
    isConnected,
    isInternetReachable,
    connectionType,
    refreshNetworkStatus,
  };
}
