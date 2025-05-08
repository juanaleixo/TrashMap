import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme, // ...novo import para modo escuro...
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  useEffect(() => {
    const fetchResults = async () => {
      if (searchText.trim() === "") {
        setResults([]);
        return;
      }

      const { data, error } = await supabase
        .from("places_with_coordinates")
        .select("id, name, latitude, longitude, accepted_materials")
        .ilike("name", `%${searchText}%`); // Busca case-insensitive

      if (error) {
        console.error("Erro ao buscar dados:", error);
      } else {
        setResults(data);
      }
    };

    fetchResults();
  }, [searchText]);

  const handleResultPress = (item) => {
    // Navega para o MapScreen passando o ponto selecionado
    navigation.navigate("Mapa", { selectedPontoSearch: item });
  };

  return (
    <View
      style={[
        styles.container,
        { marginTop: insets.top },
        isDarkMode && { backgroundColor: "#121212" },
      ]}
    >
      <TextInput
        style={[
          styles.input,
          isDarkMode && {
            color: "white",
            borderColor: "#444",
            backgroundColor: "#333",
          },
        ]}
        placeholder="Pesquisar..."
        placeholderTextColor={isDarkMode ? "lightgray" : "gray"}
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleResultPress(item)}
          >
            <Text style={[styles.resultText, isDarkMode && { color: "white" }]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
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
});

export default SearchScreen;
