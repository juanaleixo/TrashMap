import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { supabase } from "../lib/supabase";
import * as Location from "expo-location";
import { useColorScheme } from "react-native";
import { useRoute } from "@react-navigation/native";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN);

export default function MapScreen() {
  const route = useRoute();

  const { selectedPontoSearch } = route.params || {};

  const [pontos, setPontos] = useState([]);
  const [selectedPonto, setSelectedPonto] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const bottomSheetRef = useRef(null);
  const cameraRef = useRef(null);
  const isDarkMode = useColorScheme() === "dark";

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        cameraRef.current?.setCamera({
          centerCoordinate: [
            location.coords.longitude,
            location.coords.latitude,
          ],
          animationMode: "flyTo",
          zoomLevel: 12,
          animationDuration: 1000,
        });
      }
      const { data } = await supabase.rpc("listar_pontos_mapa");
      setPontos(data || []);
    })();
  }, []);

  // Atualiza o estado com os parâmetros recebidos para centralizar o mapa
  useEffect(() => {
    if (selectedPontoSearch) {
      setSelectedPonto(selectedPontoSearch);
      setTimeout(() => {
        handleMarkerPress(selectedPontoSearch);
      }, 200);
    }
  }, [selectedPontoSearch]);

  const handleMarkerPress = (ponto) => {
    setSelectedPonto(ponto);
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [ponto.longitude, ponto.latitude - 0.005],
        zoomLevel: 12,
        animationDuration: 500,
      });
    }
    bottomSheetRef.current?.expand();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={
          isDarkMode ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street
        }
        logoEnabled={false}
      >
        <MapboxGL.Camera ref={cameraRef} />
        {pontos.map((p) => (
          <MapboxGL.PointAnnotation
            key={p.id}
            id={String(p.id)}
            coordinate={[p.longitude, p.latitude]}
            onSelected={() => {
              handleMarkerPress(p);
            }}
          >
            <View style={styles.marker} />
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["10%", "25%"]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: isDarkMode ? "#333" : "#fff" }}
      >
        <BottomSheetView>
          {selectedPonto && (
            <View style={{ padding: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={[
                    { fontSize: 18, fontWeight: "bold" },
                    { color: isDarkMode ? "#fff" : "#000" },
                  ]}
                >
                  {selectedPonto.name}
                </Text>
                <TouchableOpacity
                  onPress={() => bottomSheetRef.current?.close()}
                >
                  <Text
                    style={[
                      { fontSize: 30 },
                      { color: isDarkMode ? "#bbb" : "#667" },
                    ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  { fontSize: 16, marginTop: 10 },
                  { color: isDarkMode ? "#ddd" : "#000" },
                ]}
              >
                Materiais aceitos:{" "}
                {selectedPonto.accepted_materials
                  ? selectedPonto.accepted_materials.join(", ")
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
  container: { flex: 1 },
  map: { flex: 1 },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 30,
    backgroundColor: "#219653",
    borderWidth: 2,
    borderColor: "#fff",
  },
  sheet: { padding: 20 },
  title: { fontSize: 18, fontWeight: "bold" },
});
