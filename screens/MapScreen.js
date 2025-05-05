import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet from "@gorhom/bottom-sheet";
import { supabase } from "../lib/supabase";
import * as Location from "expo-location";
import { useColorScheme } from "react-native";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN);

export default function MapScreen() {
  const [pontos, setPontos] = useState([]);
  const [selectedPonto, setSelectedPonto] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const bottomSheetRef = useRef(null);
  const isDarkMode = useColorScheme() === "dark";

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation([location.coords.longitude, location.coords.latitude]);
      }
      const { data } = await supabase.rpc("listar_pontos_mapa");
      setPontos(data || []);
    })();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={
          isDarkMode ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street
        }
      >
        {userLocation && (
          <MapboxGL.Camera zoomLevel={12} centerCoordinate={userLocation} />
        )}
        {pontos.map((p) => (
          <MapboxGL.PointAnnotation
            key={p.id}
            id={String(p.id)}
            coordinate={[p.longitude, p.latitude]}
            onSelected={() => {
              setSelectedPonto(p);
              bottomSheetRef.current?.expand();
            }}
          >
            <View style={styles.marker} />
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["25%", "50%"]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: isDarkMode ? "#333" : "#fff" }}
      >
        {selectedPonto && (
          <View style={styles.sheet}>
            <Text
              style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}
            >
              {selectedPonto.name}
            </Text>
            <Text style={{ color: isDarkMode ? "#ddd" : "#000" }}>
              Materiais: {selectedPonto.accepted_materials?.join(", ") || "N/A"}
            </Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
              <Text style={{ color: isDarkMode ? "#bbb" : "#667" }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
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
    borderRadius: 10,
    backgroundColor: "#219653",
    borderWidth: 2,
    borderColor: "#fff",
  },
  sheet: { padding: 20 },
  title: { fontSize: 18, fontWeight: "bold" },
});
