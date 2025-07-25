import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** Único client da aplicação — com sessão persistida no AsyncStorage */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true, // renova perto do vencimento
    persistSession: true, // mantém login entre fechamentos do app
    detectSessionInUrl: false, // RN não precisa ler URL ao abrir
  },
});
