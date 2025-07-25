import React, { useState, useMemo, useCallback } from "react";
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
  useColorScheme,
  StyleSheet,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function AddScreen() {
  const { user } = useAuth(); // usuário autenticado via Supabase
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  /** -------------------------------------------------------
   * Palette resolved once per render, memoized for performance
   * ------------------------------------------------------ */
  const palette = useMemo(
    () => ({
      background: isDark ? "#000" : "#fff",
      text: isDark ? "#fff" : "#222",
      inputBg: isDark ? "#181818" : "#fafafa",
      inputBorder: isDark ? "#333" : "#ccc",
      buttonBg: "#34c759",
      buttonText: "#fff",
      placeholder: isDark ? "#aaa" : "#888",
      note: isDark ? "#aaa" : "#888",
    }),
    [isDark]
  );

  /** -------------------------------------------------------
   * Form state & helpers
   * ------------------------------------------------------ */
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

  const handleSubmit = async () => {
    const { name, description, address, city, materials } = form;

    if (!name || !address || !city || !materials) {
      return Alert.alert("Preencha todos os campos obrigatórios.");
    }

    if (!user?.id) {
      return Alert.alert(
        "Usuário não autenticado. Faça login e tente novamente."
      );
    }

    // prepara array de materiais sem espaços extras e ignora vazios
    const materialArray = materials
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    const { error } = await supabase.from("places_pending").insert([
      {
        user_id: user.id, // coluna FK pro usuário
        name,
        description,
        address,
        city,
        materials: materialArray, // coluna do tipo text[]
        status: "pending",
      },
    ]);

    if (error) {
      return Alert.alert("Erro ao criar local", error.message);
    }

    Alert.alert("Local enviado para criação com sucesso!");
    setForm({
      name: "",
      description: "",
      address: "",
      city: "",
      materials: "",
    });
  };

  /** -------------------------------------------------------
   * Styles are generated from the palette so they update on theme change
   * ------------------------------------------------------ */
  const styles = getStyles(palette);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------------------------------------------------
 * Reusable sub-components
 * -------------------------------------------------------- */
const Label = ({ children, color }) => (
  <Text
    style={{
      color,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 6,
    }}
  >
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

/* ---------------------------------------------------------
 * Style generator returns a StyleSheet object based on the active palette
 * -------------------------------------------------------- */
const getStyles = (p) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: p.background,
      paddingHorizontal: 24,
    },
    flex: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 32,
      paddingHorizontal: 24,
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
      marginTop: 24,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: p.buttonText,
    },
    note: {
      fontSize: 13,
      alignSelf: "center",
      marginTop: 8,
      color: p.note,
    },
  });
