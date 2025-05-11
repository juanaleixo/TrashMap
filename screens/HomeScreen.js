import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useDicaDoDia } from "../hooks/useDicaDoDia";
import { useMateriais } from "../hooks/useMateriais";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const bgColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const cardColor = isDarkMode ? "#1a1a1a" : "#f2f2f2";

  // ↔️  Cache states
  const [materiaisData, setMateriaisData] = useState([]);
  const [dicaData, setDicaData] = useState(null);
  const [cacheLoaded, setCacheLoaded] = useState(false);

  const { dica, loading: loadingDica } = useDicaDoDia();
  const { materiais, loading: loadingMateriais } = useMateriais();

  // 🔄  Load cache on mount
  useEffect(() => {
    (async () => {
      try {
        const cachedMat = await AsyncStorage.getItem("materiais_cache");
        if (cachedMat) setMateriaisData(JSON.parse(cachedMat));
        const cachedDica = await AsyncStorage.getItem("dica_cache");
        if (cachedDica) setDicaData(cachedDica);
      } catch (e) {
        console.warn("Falha ao ler cache:", e);
      } finally {
        setCacheLoaded(true);
      }
    })();
  }, []);

  // 📦  Update cache when fresh data arrives
  useEffect(() => {
    if (!loadingMateriais && materiais.length) {
      setMateriaisData(materiais);
      AsyncStorage.setItem("materiais_cache", JSON.stringify(materiais)).catch(console.warn);
    }
  }, [loadingMateriais, materiais]);

  useEffect(() => {
    if (!loadingDica && dica) {
      setDicaData(dica);
      AsyncStorage.setItem("dica_cache", dica).catch(console.warn);
    }
  }, [loadingDica, dica]);

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: bgColor, paddingTop: insets.top + 50 },
      ]}
    >
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
        {(!cacheLoaded && loadingDica) ? (
          <Text style={[styles.sectionText, { color: textColor }]}>
            Carregando...
          </Text>
        ) : (
          <Text style={[styles.sectionText, { color: textColor }]}>
            {dica || dicaData || "Nenhuma dica disponível hoje."}
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
        {(!cacheLoaded && loadingMateriais && !materiaisData.length) ? (
          <Text style={[styles.sectionText, { color: textColor }]}>
            Carregando materiais...
          </Text>
        ) : (
          <FlatList
            data={(materiais.length ? materiais : materiaisData).slice(0, 20)}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.materialCard,
                  { backgroundColor: item.color || cardColor },
                ]}
              >
                <Text
                  style={[styles.materialTitle, { color: item.textColor }]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[styles.materialInfo, { color: item.textColor }]}
                >
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
    padding: 12,
    borderRadius: 16,
    marginRight: 16,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  materialInfo: {
    fontSize: 13,
    color: "#444",
    opacity: 0.9,
  },
});

export default HomeScreen;
