import { View, Button } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { refreshUser, setUser } = useAuth();
  const redirectTo = Linking.createURL("/auth/callback");

  async function signInWithGoogle() {
    console.log("[DEBUG] Iniciando signInWithGoogle");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }, // deixa flowType automático
    });

    if (error) {
      console.error("[DEBUG] Erro ao iniciar OAuth:", error);
      return;
    }

    console.log("[DEBUG] URL de login gerada:", data.url);

    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    console.log("[DEBUG] Resultado openAuthSessionAsync:", res);

    if (res.type !== "success" || !res.url) {
      console.warn("[DEBUG] Login cancelado ou sem URL de retorno.");
      return;
    }

    console.log("[DEBUG] Processando URL de retorno...");

    /* -------- Fragmento #access_token -------- */
    if (res.url.includes("#access_token=")) {
      console.log("[DEBUG] URL contém fragmento (#access_token).");
      const fragment = res.url.split("#")[1] ?? "";
      const p = new URLSearchParams(fragment);
      const access_token = p.get("access_token");
      const refresh_token = p.get("refresh_token");

      if (!access_token || !refresh_token) {
        console.error("[DEBUG] Tokens não encontrados no fragmento.");
        return;
      }

      const { data: sessData, error: err } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (err) {
        console.error("[DEBUG] setSession error:", err);
        return;
      }

      console.log("[DEBUG] Sessão via setSession:", sessData.session);
      await refreshUser();
      setUser(sessData.session.user);
      return;
    }

    /* -------- Query ?code= (PKCE) -------- */
    if (res.url.includes("?code=")) {
      console.log("[DEBUG] URL contém ?code=. Trocando por sessão...");
      const { data: sessData, error: err } =
        await supabase.auth.exchangeCodeForSession(res.url);

      if (err) {
        console.error("[DEBUG] exchangeCodeForSession error:", err);
        return;
      }

      console.log(
        "[DEBUG] Sessão via exchangeCodeForSession:",
        sessData.session,
      );
      await refreshUser();
      setUser(sessData.session.user);
      return;
    }

    console.warn("[DEBUG] URL não contém fragmento nem code – nada a fazer.");
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button title="Entrar com Google" onPress={signInWithGoogle} />
    </View>
  );
}
