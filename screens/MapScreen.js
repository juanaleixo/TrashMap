import React, { useEffect, useRef, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { supabase } from "../lib/supabase";
import * as Location from "expo-location";
import BottomSheet, { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRoute } from "@react-navigation/native";
import { useColorScheme } from "react-native";

export default function MapScreen() {
  const route = useRoute(); // Obtemos os parâmetros da rota
  const { selectedPonto, centerOnPonto } = route.params || {};
  const mapRef = useRef(null); // Referência para o MapView

  const [initialRegion, setInitialRegion] = useState({
    latitude: -14.235004, // Latitude central aproximada do Brasil
    longitude: -51.92528, // Longitude central aproximada do Brasil
    latitudeDelta: 40, // Abrangência maior para cobrir o Brasil
    longitudeDelta: 40, // Abrangência maior para cobrir o Brasil
  });

  const [pontos, setPontos] = useState([]);
  const [selectedPontoState, setSelectedPontoState] = useState(null); // renomeado para evitar conflito
  const [show, setShow] = useState(false);

  const bottomSheetRef = useRef(null);
  const colorScheme = useColorScheme(); // Obtém o esquema de cores atual (light ou dark)
  const isDarkMode = colorScheme === "dark";

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status == "granted") {
      const location = await Location.getCurrentPositionAsync({});
      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } else {
      console.log("Permissão de localização negada.");
    }
  };

  const fetchPontos = async () => {
    const { data, error } = await supabase.rpc("listar_pontos_mapa");
    if (error) {
      console.error("Erro ao buscar pontos:", error);
    } else {
      console.log("Pontos recebidos:", data);
      setPontos(data);
    }
  };

  const showTrue = async () => {
    setShow(true);
  };

  // Busca ao montar o componente
  useEffect(() => {
    const initialize = async () => {
      await getUserLocation();
      await fetchPontos();
      showTrue();
    };
    initialize();
  }, []);

  // Atualiza o estado com os parâmetros recebidos para centralizar o mapa
  useEffect(() => {
    if (selectedPonto && centerOnPonto) {
      console.log("Parâmetro recebido:", selectedPonto);
      setSelectedPontoState(selectedPonto);
      handleMarkerPress(selectedPonto);
    }
  }, [selectedPonto, centerOnPonto]);

  const handleMarkerPress = (ponto) => {
    setSelectedPontoState(ponto);
    bottomSheetRef.current?.expand();
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: ponto.latitude - 0.005, // offset para subir o marcador
          longitude: ponto.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500 // Duração da animação
      );
    }
  };

  const handleClose = () => {
    bottomSheetRef.current?.close();
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          longitude: currentRegion.longitude,
          latitude: currentRegion.latitude + 0.005,
          latitudeDelta: currentRegion.latitudeDelta,
          longitudeDelta: currentRegion.longitudeDelta,
        },
        500 // Duração da animação
      );
    }
    setSelectedPontoState(null);
  };

  // Adiciona o estado currentRegion para acompanhar a região atual do mapa
  const [currentRegion, setCurrentRegion] = useState(initialRegion);
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  return (
    <GestureHandlerRootView style={styles.container}>
      {show && (
        <MapView
          ref={mapRef}
          style={styles.map}
                    showsUserLocation={true}
          initialRegion={initialRegion}
          onRegionChangeComplete={(region) => setCurrentRegion(region)}
        >
          {pontos.map((ponto) => (
            <Marker
              key={ponto.id}
              coordinate={{
                latitude: ponto.latitude,
                longitude: ponto.longitude,
              }}
              onPress={() => handleMarkerPress(ponto)}
            />
          ))}
        </MapView>
      )}
      
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => setSelectedPontoState(null)}
        backgroundStyle={{
          backgroundColor: isDarkMode ? "#333" : "#fff", // Ajusta a cor de fundo
        }}>
        <BottomSheetView>
          {selectedPontoState && (
            <View style={styles.sheetContent}>
              <View style={styles.sheetHeader}>
                <Text
                  style={[
                    styles.sheetTitle,
                    { color: isDarkMode ? "#fff" : "#000" }, // Ajusta a cor do texto
                  ]}
                >
                  {selectedPontoState.name}
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <Text
                    style={[
                      styles.closeText,
                      { color: isDarkMode ? "#bbb" : "#667" }, // Ajusta a cor do botão de fechar
                    ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  styles.materialsText,
                  { color: isDarkMode ? "#ddd" : "#000" }, // Ajusta a cor do texto
                ]}
              >
                Materiais aceitos:{" "}
                {selectedPontoState.accepted_materials
                  ? selectedPontoState.accepted_materials.join(", ")
                  : "N/A"}
              </Text>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  container: { flex: 1 },
  sheetContent: {
    padding: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeText: {
    fontSize: 22,
    color: "#667",
  },
  materialsText: {
    fontSize: 16,
    marginTop: 10,
  },
});
