// hooks/usePontos.js
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { supabase } from "../lib/supabase";

const CACHE_KEY = "pontos_cache_v1";
const MAX_AGE_HOURS = 6;

export function usePontos() {
  const [pontos, setPontos] = useState([]);

  const load = useCallback(async () => {
    // 1) tenta cache
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < MAX_AGE_HOURS * 3600e3) setPontos(data);
    }

    // 2) se on-line → Supabase
    const net = await NetInfo.fetch();
    if (net.isConnected) {
      const { data, error } = await supabase.rpc("listar_pontos_mapa");
      if (!error && data) {
        setPontos(data);
        AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ ts: Date.now(), data })
        ).catch(console.warn);
      }
    }
  }, []);

  useEffect(() => {
    load().catch(console.warn);
  }, []);

  return { pontos, refreshPontos: load };
}
