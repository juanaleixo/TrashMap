import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import { useColorScheme } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function UserScreen() {
  const { user, loading, logout } = useAuth();
  const dynamicStyles = useUserScreenStyles();

  if (loading) {
    return (
      <View style={dynamicStyles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.text}>Nenhum usuário autenticado.</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Usuário</Text>
      <Text style={dynamicStyles.text}>
        Nome: {user.user_metadata?.full_name ?? "Não informado"}
      </Text>
      <Text style={dynamicStyles.text}>
        Email: {user.email ?? "Não informado"}
      </Text>

      <View style={{ marginTop: 24 }}>
        <Button
          title="Logout"
          onPress={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) console.error("Erro ao deslogar:", error);
            logout(); // atualiza contexto
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
  },
});

export function useUserScreenStyles() {
  const colorScheme = useColorScheme();
  return {
    container: [
      styles.container,
      colorScheme === "dark" && { backgroundColor: "#121212" },
    ],
    title: [styles.title, colorScheme === "dark" && { color: "#fff" }],
    text: {
      color: colorScheme === "dark" ? "#fff" : "#222",
    },
  };
}
