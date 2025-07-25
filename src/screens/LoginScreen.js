import { useEffect } from "react";
import { View, Button } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
  WebBrowser.maybeCompleteAuthSession();

  const redirectTo = Linking.createURL("/auth/callback");

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) return console.error(error);

    await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  }

  useEffect(() => {
    const sub = Linking.addEventListener("url", async ({ url }) => {
      const { error } = await supabase.auth.handleRedirectURL(url);
      if (error) console.error(error);
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button title="Entrar com Google" onPress={signInWithGoogle} />
    </View>
  );
}
