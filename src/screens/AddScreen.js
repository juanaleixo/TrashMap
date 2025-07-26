import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  View,
  TextInput,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 👈

export default function AddScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // ----------------------------------
  // Palette
  // ----------------------------------
  const palette = useMemo(
    () => ({
      background: isDark ? "#000" : "#fff",
      text: isDark ? "#fff" : "#222",
      inputBg: isDark ? "#181818" : "#f2f2f2",
      inputBorder: isDark ? "#333" : "#ccc",
      buttonBg: "#34c759",
      buttonText: "#fff",
      placeholder: isDark ? "#aaa" : "#888",
      note: isDark ? "#888" : "#999",
      outline: isDark ? "#444" : "#ddd",
      cardBg: isDark ? "#111" : "#fafafa",
      tabBg: isDark ? "#0d0d0d" : "#e9e9e9",
    }),
    [isDark]
  );

  // ----------------------------------
  // Tabs
  // ----------------------------------
  const [tab, setTab] = useState("form"); // "form" | "list"
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);

  const fetchPlaces = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("places_pending")
      .select("id, name, city, status")
      .order("created_at", { ascending: false });

    if (error) Alert.alert("Erro ao carregar locais", error.message);
    else setPlaces(data ?? []);

    setLoading(false);
  };

  useEffect(() => {
    if (tab === "list") fetchPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ----------------------------------
  // Form state
  // ----------------------------------
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    materials: "",
  });

  const handleChange = useCallback(
    (field) => (value) =>
      setForm((prev) => ({
        ...prev,
        [field]: value,
      })),
    []
  );

  // ----------------------------------
  // Submit
  // ----------------------------------
  const handleSubmit = async () => {
    const { name, description, address, city, materials } = form;

    if (!name || !address || !city || !materials) {
      return Alert.alert("Preencha todos os campos obrigatórios.");
    }
    if (!user?.id) {
      return Alert.alert("Faça login e tente novamente.");
    }

    const materialArray = materials
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    const { error } = await supabase.from("places_pending").insert([
      {
        user_id: user.id,
        name,
        description,
        address,
        city,
        materials: materialArray,
        status: "pending",
      },
    ]);

    if (error) {
      return Alert.alert("Erro ao criar local", error.message);
    }

    Alert.alert("Local enviado com sucesso!");
    setForm({
      name: "",
      description: "",
      address: "",
      city: "",
      materials: "",
    });
    setTab("list");
  };

  // ----------------------------------
  // Delete
  // ----------------------------------
  const handleDelete = (id) => {
    Alert.alert("Excluir local", "Tem certeza que deseja excluir este local?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("places_pending")
            .delete()
            .eq("id", id);
          if (error) Alert.alert("Erro ao excluir", error.message);
          else fetchPlaces();
        },
      },
    ]);
  };

  const styles = getStyles(palette);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ---------- TAB HEADER ---------- */}
        <View style={[styles.tabsRow, { backgroundColor: palette.tabBg }]}>
          <TabButton
            label="Adicionar"
            active={tab === "form"}
            onPress={() => setTab("form")}
            palette={palette}
          />
          <TabButton
            label="Meus Locais"
            active={tab === "list"}
            onPress={() => setTab("list")}
            palette={palette}
          />
        </View>

        {/* ---------- TAB CONTENT ---------- */}
        {tab === "form" ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.header}>Adicionar Novo Local</Text>

            <View style={styles.form}>
              <Label color={palette.text}>Nome*</Label>
              <Input
                value={form.name}
                onChangeText={handleChange("name")}
                placeholder="Ex: Ponto de coleta do bairro"
                palette={palette}
              />

              <Label color={palette.text}>Descrição</Label>
              <Input
                value={form.description}
                onChangeText={handleChange("description")}
                placeholder="Informações adicionais (opcional)"
                palette={palette}
                multiline
                minHeight={60}
              />

              <Label color={palette.text}>Endereço*</Label>
              <Input
                value={form.address}
                onChangeText={handleChange("address")}
                placeholder="Rua, Nº, Bairro"
                palette={palette}
              />

              <Label color={palette.text}>Cidade*</Label>
              <Input
                value={form.city}
                onChangeText={handleChange("city")}
                placeholder="Ex: Fernandópolis, SP"
                palette={palette}
              />

              <Label color={palette.text}>
                Materiais aceitos* (separe por vírgula)
              </Label>
              <Input
                value={form.materials}
                onChangeText={handleChange("materials")}
                placeholder="Ex: Papel, Plástico"
                palette={palette}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: palette.buttonBg,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Criar Local</Text>
              </Pressable>

              <Text style={styles.note}>* Campos obrigatórios</Text>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingVertical: 16 },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="large" color={palette.text} />
            ) : places.length === 0 ? (
              <Text style={{ color: palette.note }}>
                Nenhum local cadastrado.
              </Text>
            ) : (
              places.map(({ id, name, city, status }) => (
                <View
                  key={id}
                  style={[styles.card, { backgroundColor: palette.cardBg }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{name}</Text>
                    <Text style={styles.cardSub}>{city}</Text>
                    <Text style={styles.cardStatus}>Status: {status}</Text>
                  </View>

                  <Pressable
                    onPress={() => handleDelete(id)}
                    style={({ pressed }) => [
                      { padding: 8, opacity: pressed ? 0.6 : 1 },
                    ]}
                  >
                    <Text style={{ fontSize: 18, color: "red" }}>🗑️</Text>
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ----------------------------------
// TabButton
// ----------------------------------
const TabButton = ({ label, active, onPress, palette }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      { flex: 1, alignItems: "center", paddingVertical: 12 },
      pressed && { opacity: 0.7 },
    ]}
  >
    <Text
      style={{
        fontWeight: "600",
        color: active ? palette.buttonBg : palette.note,
      }}
    >
      {label}
    </Text>
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: active ? palette.buttonBg : "transparent",
      }}
    />
  </Pressable>
);

// ----------------------------------
// Reusable sub-components
// ----------------------------------
const Label = ({ children, color }) => (
  <Text style={{ color, fontSize: 16, fontWeight: "600", marginBottom: 6 }}>
    {children}
  </Text>
);

const Input = ({ palette, multiline = false, minHeight, ...props }) => (
  <TextInput
    {...props}
    multiline={multiline}
    placeholderTextColor={palette.placeholder}
    style={{
      borderWidth: 1,
      borderColor: palette.inputBorder,
      borderRadius: 12,
      backgroundColor: palette.inputBg,
      color: palette.text,
      padding: 12,
      fontSize: 16,
      marginBottom: 12,
      minHeight,
    }}
  />
);

// ----------------------------------
// Styles
// ----------------------------------
const getStyles = (p) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: p.background,
      paddingHorizontal: 24,
    },
    flex: { flex: 1 },

    tabsRow: {
      flexDirection: "row",
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 16,
    },

    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 32,
    },

    header: {
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 24,
      color: p.text,
      textAlign: "center",
    },

    form: {
      width: "100%",
      maxWidth: 420,
    },

    button: {
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: p.buttonText,
    },

    note: {
      fontSize: 13,
      color: p.note,
      alignSelf: "center",
      marginTop: 8,
    },

    /* ----- List cards ----- */
    card: {
      flexDirection: "row",
      gap: 12,
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: p.outline,
      width: "100%",
      maxWidth: 420,
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: p.text,
    },
    cardSub: {
      fontSize: 14,
      color: p.note,
      marginTop: 2,
    },
    cardStatus: {
      fontSize: 14,
      marginTop: 6,
      color: p.text,
    },
  });
