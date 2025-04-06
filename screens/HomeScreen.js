import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDicaDoDia } from "../hooks/useDicaDoDia";
import { useMateriais } from "../hooks/useMateriais";

const HomeScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const bgColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const cardColor = isDarkMode ? "#1a1a1a" : "#f2f2f2";

  const { dica, loading: loadingDica } = useDicaDoDia();
  const { materiais, loading: loadingMateriais } = useMateriais();

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.header, { color: textColor }]}>
        Olá, reciclador! ♻️
      </Text>

      {/* Bloco de Impacto */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Seu Impacto
        </Text>
        <Text style={[styles.sectionText, { color: textColor }]}>
          Você reciclou 12 itens este mês!
        </Text>
        <Text style={[styles.sectionText, { color: textColor }]}>
          Isso representa 3,5kg de resíduos ♻️
        </Text>
      </View>

      {/* Dica do Dia */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Dica do Dia 📚
        </Text>
        {loadingDica ? (
          <Text style={[styles.sectionText, { color: textColor }]}>
            Carregando...
          </Text>
        ) : (
          <Text style={[styles.sectionText, { color: textColor }]}>
            {dica || "Nenhuma dica disponível hoje."}
          </Text>
        )}
      </View>

      {/* Botão para Mapa */}
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate("Mapa")}
        >
          <Text style={styles.mapButtonText}>Ver Mapa de Coleta</Text>
        </TouchableOpacity>

        {/* Materiais em Destaque */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Materiais em Destaque
        </Text>
        {loadingMateriais ? (
          <Text style={[styles.sectionText, { color: textColor }]}>
            Carregando materiais...
          </Text>
        ) : (
          <FlatList
            data={materiais.slice(0, 5)}
            renderItem={({ item }) => (
              <View
                style={[styles.materialCard, { backgroundColor: cardColor }]}
              >
                <Text style={[styles.materialTitle, { color: textColor }]}>
                  {item.name}
                </Text>
                <Text style={[styles.materialInfo, { color: textColor }]}>
                  {item.decomposition_time || "Tempo não informado"}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 110,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  mapButton: {
    backgroundColor: "#34c759",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  materialCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
  },
  materialTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  materialInfo: {
    fontSize: 14,
  },
});

export default HomeScreen;
