import { View, Button } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const redirectTo = Linking.createURL("/auth/callback");

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) return console.error(error);

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === "success" && result.url) {
      const { error: redirectError } =
        await supabase.auth.exchangeCodeForSession(result.url);
      if (redirectError) console.error(redirectError);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button title="Entrar com Google" onPress={signInWithGoogle} />
    </View>
  );
}
