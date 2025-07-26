// src/screens/MapScreen.js
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useColorScheme } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { usePontos } from "../hooks/usePontos";
import { useUserLocation } from "../hooks/useUserLocation";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN);

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SNAP_POINTS = ["10%", "30%"];

export default function MapScreen() {
  const route = useRoute();
  const { selectedPontoSearch } = route.params || {};

  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  /* ---------- dados ----------- */
  const { pontos, refreshPontos } = usePontos(); // custom hook
  const {
    userLocation,
    centerOnUserLocation, // callback memoizado
    askPermissionIfNeeded,
  } = useUserLocation();

  /* ---------- estado UI -------- */
  const [selectedId, setSelectedId] = useState(null);
  const bottomSheetRef = useRef(null);
  const cameraRef = useRef(null);

  const animateIdx = useSharedValue(-1);
  const animatePos = useSharedValue(0);

  /* ---------- efeitos init ------ */
  React.useEffect(() => {
    askPermissionIfNeeded().catch(console.warn);
  }, []);

  React.useEffect(() => {
    if (!selectedPontoSearch) return;

    const t = setTimeout(() => {
      handleMarkerPress(selectedPontoSearch.id, {
        longitude: selectedPontoSearch.longitude,
        latitude: selectedPontoSearch.latitude,
      });
    }, 200);

    return () => clearTimeout(t);
  }, [selectedPontoSearch, handleMarkerPress]);

  /* ---------- handlers ---------- */
  const handleMarkerPress = useCallback(
    (id, coords) => {
      setSelectedId(id);
      cameraRef.current?.setCamera({
        centerCoordinate: [coords.longitude, coords.latitude],
        zoomLevel: 13,
        animationDuration: 250,
      });
      bottomSheetRef.current?.expand();
    },
    [cameraRef, bottomSheetRef]
  );

  const handleMapPress = useCallback(() => {
    bottomSheetRef.current?.close();
    setSelectedId(null);
  }, []);

  // centra assim que o estilo do mapa terminar de carregar
  const handleMapReady = useCallback(async () => {
    try {
      const coords = await centerOnUserLocation();
      // se conseguir a posição → foca nela; senão fica no default (Brasil)
      if (coords && cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [coords.longitude, coords.latitude],
          zoomLevel: 12,
          animationDuration: 0,
        });
      }
    } catch {
      /* silencioso: fallback já é Brasil */
    }
  }, [centerOnUserLocation]);

  /* ---------- memo ---------- */
  const selectedPonto = useMemo(
    () => pontos.find((p) => p.id === selectedId),
    [pontos, selectedId]
  );

  const mapPaddingStyle = useAnimatedStyle(() => ({
    paddingBottom: Math.max(
      0,
      SCREEN_HEIGHT - animatePos.value - 60 - insets.bottom
    ),
  }));

  /* ---------- render ---------- */
  return (
    <View style={styles.flex1}>
      {/* Mapa */}
      <Animated.View style={[styles.flex1, mapPaddingStyle]}>
        <MapboxGL.MapView
          style={styles.map}
          styleURL={isDark ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street}
          attributionEnabled={false}
          logoEnabled={false}
          scaleBarEnabled={false}
          onPress={handleMapPress}
          surfaceView={false}
          onDidFinishLoadingMap={handleMapReady}
        >
          <MapboxGL.Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: [-51.9253, -14.235],
              zoomLevel: 4,
            }}
          />

          <MapboxGL.UserLocation visible={true} />

          {/* Marcadores via GeoJSON → SymbolLayer */}
          <MapboxGL.ShapeSource
            id="pontos"
            shape={{
              type: "FeatureCollection",
              features: pontos.map((p) => ({
                type: "Feature",
                id: p.id,
                properties: { pontoId: p.id },
                geometry: {
                  type: "Point",
                  coordinates: [p.longitude, p.latitude],
                },
              })),
            }}
            onPress={(e) => {
              const { properties, geometry } = e.features[0];
              handleMarkerPress(properties.pontoId, {
                longitude: geometry.coordinates[0],
                latitude: geometry.coordinates[1],
              });
            }}
          >
            <MapboxGL.CircleLayer
              id="ponto-circle"
              style={{
                circleRadius: 6,
                circleColor: "#219653",
                circleStrokeWidth: 2,
                circleStrokeColor: "#ffffff",
              }}
            />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
      </Animated.View>

      {/* Botão “localizar” */}
      <TouchableOpacity
        accessibilityLabel="Centralizar no usuário"
        hitSlop={16}
        style={[
          styles.locBtn,
          {
            backgroundColor: isDark ? "#219653" : "#fff",
            borderColor: isDark ? "#fff" : "#219653",
            bottom: 30,
          },
        ]}
        onPress={async () => {
          try {
            const coords = await centerOnUserLocation();
            if (coords) {
              cameraRef.current?.setCamera({
                centerCoordinate: [coords.longitude, coords.latitude],
                zoomLevel: 13,
                animationDuration: 400,
              });
            }
          } catch (e) {
            Alert.alert("Ops", "Não foi possível encontrar sua localização.");
          }
        }}
      >
        <Ionicons
          name="locate-outline"
          size={22}
          color={isDark ? "#fff" : "#219653"}
        />
      </TouchableOpacity>

      {/* Bottom-sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        animateOnMount={false}
        animatedIndex={animateIdx}
        animatedPosition={animatePos}
        backgroundStyle={{ backgroundColor: isDark ? "#333" : "#fff" }}
      >
        <BottomSheetView>
          {selectedPonto && (
            <View style={styles.sheetContent}>
              <View style={styles.sheetHeader}>
                <Text
                  style={[
                    styles.sheetTitle,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  {selectedPonto.name}
                </Text>
                <TouchableOpacity hitSlop={12} onPress={handleMapPress}>
                  <Text style={{ fontSize: 26, color: "#999" }}>×</Text>
                </TouchableOpacity>
              </View>

              <Text
                style={[styles.sheetText, { color: isDark ? "#ccc" : "#333" }]}
              >
                Materiais aceitos:{" "}
                {selectedPonto.accepted_materials?.join(", ") || "N/D"}
              </Text>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

/* ---------- estilos ---------- */
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  map: { flex: 1 },
  locBtn: {
    position: "absolute",
    right: 18,
    borderWidth: 2,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  sheetContent: { padding: 20 },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sheetTitle: { fontSize: 18, fontWeight: "600" },
  sheetText: { marginTop: 8, fontSize: 16 },
});
