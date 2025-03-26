import React, { useEffect, useRef, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { supabase } from "../lib/supabase";
import * as Location from "expo-location";
import BottomSheet from "@gorhom/bottom-sheet";

export default function MapScreen() {
  const [initialRegion, setInitialRegion] = useState({
    latitude: -14.235004, // Latitude central aproximada do Brasil
    longitude: -51.92528, // Longitude central aproximada do Brasil
    latitudeDelta: 40, // Abrangência maior para cobrir o Brasil
    longitudeDelta: 40, // Abrangência maior para cobrir o Brasil
  });

  const [pontos, setPontos] = useState([]);

  const [selectedPonto, setSelectedPonto] = useState(null);
  const [show, setShow] = useState(false);
  const bottomSheetRef = useRef(null);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permissão de localização negada.");
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setInitialRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
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

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const handleMarkerPress = (ponto) => {
    setSelectedPonto(ponto);
    bottomSheetRef.current?.expand();
  };

  const handleClose = () => {
    bottomSheetRef.current?.close();
    setSelectedPonto(null);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {show && (
        <MapView
          style={styles.map}
          showsUserLocation={true}
          initialRegion={initialRegion}
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
        onClose={() => setSelectedPonto(null)}
      >
        {selectedPonto && (
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{selectedPonto.name}</Text>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.materialsText}>
              Materiais aceitos: Plástico, Papel, Vidro
            </Text>
          </View>
        )}
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
    color: "#666",
  },
  materialsText: {
    fontSize: 16,
    marginTop: 10,
  },
});
