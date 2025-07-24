import { View, Button } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const redirectUri = makeRedirectUri({
    native: "com.juanaleixo.trashmap:/oauthredirect",
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token, access_token } = response.params;
      supabase.auth
        .signInWithIdToken({
          provider: "google",
          token: id_token,
          access_token,
        })
        .catch(console.error);
    }
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button title="Entrar com Google" onPress={() => promptAsync()} />
    </View>
  );
}
