import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useMateriais } from "../hooks/useMateriais";

const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [showFilter, setShowFilter] = useState(false);
  const bottomSheetRef = useRef(null);

  const { materiais, loading: loadingMateriais } = useMateriais();

  const [selectedMaterials, setSelectedMaterials] = useState([]); // ids selecionados

  const toggleMaterial = (id) => {
    setSelectedMaterials((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (searchText.trim() === "") {
        setResults([]);
        return;
      }

      let query = supabase
        .from("places_with_coordinates")
        .select(
          "id, name, latitude, longitude, accepted_materials, accepted_materials_id"
        )
        .ilike("name", `%${searchText}%`);

      if (selectedMaterials?.length > 0) {
        query = query.contains("accepted_materials_id", selectedMaterials);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar dados:", error);
      } else {
        setResults(data);
      }
    };

    fetchResults();
  }, [searchText, selectedMaterials]);

  const handleResultPress = (item) => {
    // Navega para o MapScreen passando o ponto selecionado
    navigation.navigate("Mapa", { selectedPontoSearch: item });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          bottomSheetRef.current?.close();
          setShowFilter(false);
        }}
      >
        <View
          style={[
            styles.container,
            { marginTop: insets.top },
            isDarkMode && { backgroundColor: "#121212" },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginHorizontal: 20,
              marginTop: 20,
            }}
          >
            <TextInput
              style={[
                styles.input,
                { flex: 1, marginTop: 0, marginHorizontal: 0 },
                isDarkMode && {
                  color: "white",
                  borderColor: "#444",
                  backgroundColor: "#333",
                },
              ]}
              placeholder="Pesquisar..."
              placeholderTextColor={isDarkMode ? "lightgray" : "gray"}
              value={searchText}
              onFocus={() => {
                if (showFilter) {
                  setShowFilter(false);
                  bottomSheetRef.current?.close();
                }
              }}
              onChangeText={setSearchText}
            />
            <TouchableOpacity
              style={{
                marginLeft: 10,
                padding: 6,
                borderRadius: 8,
                backgroundColor: isDarkMode ? "#222" : "#eee",
              }}
              onPress={() => {
                Keyboard.dismiss();
                if (showFilter) {
                  setShowFilter(false);
                  bottomSheetRef.current?.close();
                } else {
                  setShowFilter(true);
                  bottomSheetRef.current?.expand();
                }
              }}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={isDarkMode ? "white" : "#333"}
              />
            </TouchableOpacity>
          </View>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleResultPress(item)}
              >
                <Text
                  style={[styles.resultText, isDarkMode && { color: "white" }]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableWithoutFeedback>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["10%", "25%"]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: isDarkMode ? "#333" : "#fff" }}
      >
        <BottomSheetView>
          <View
            style={{
              padding: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <FlatList
              data={materiais.slice(0, 20)}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleMaterial(item.id)}
                    style={[
                      styles.materialCard,
                      { backgroundColor: item.color || cardColor },
                      selectedMaterials.includes(item.id) &&
                        styles.materialCardSelected,
                    ]}
                  >
                    {selectedMaterials.includes(item.id) && (
                      <View style={styles.checkContainer}>
                        <Ionicons name="checkmark" size={16} color="#5E35B1" />
                      </View>
                    )}
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
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: {
    marginTop: 20,
    marginHorizontal: 20,
    height: 30,
    borderColor: "gray",
    borderWidth: 2,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    marginHorizontal: 10,
  },
  resultText: {
    fontSize: 16,
  },
  materialCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  materialCardSelected: {
    opacity: 0.85,
    elevation: 4,
  },
  checkContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    position: "absolute",
    top: 6,
    right: 6,
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

export default SearchScreen;
