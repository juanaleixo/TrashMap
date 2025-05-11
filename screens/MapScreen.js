import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapboxGL from "@rnmapbox/maps";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { supabase } from "../lib/supabase";
import * as Location from "expo-location";
import { useColorScheme } from "react-native";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN);

export default function MapScreen() {
  const route = useRoute();

  const { selectedPontoSearch } = route.params || {};

  const [pontos, setPontos] = useState([]);
  const [selectedPonto, setSelectedPonto] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const bottomSheetRef = useRef(null);
  const cameraRef = useRef(null);
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === "dark";

  const animatedIndex = useSharedValue(-1);
  const animatedPosition = useSharedValue(0);
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem("pontos_cache");
        if (cached) {
          setPontos(JSON.parse(cached));
        }
      } catch (e) {
        console.warn("Falha ao ler cache de pontos:", e);
      }

      // Verifica conectividade
      const netState = await NetInfo.fetch();

      if (netState.isConnected) {
        // Tem internet → busca dados atualizados
        const { data } = await supabase.rpc("listar_pontos_mapa");
        if (data) {
          setPontos(data);
          try {
            await AsyncStorage.setItem("pontos_cache", JSON.stringify(data));
          } catch (e) {
            console.warn("Falha ao salvar cache:", e);
          }
        }
      }

      centerOnUserLocation();
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
        centerCoordinate: [ponto.longitude, ponto.latitude],
        zoomLevel: 12,
        animationDuration: 200,
      });
    }
    bottomSheetRef.current?.expand();
  };

  const centerOnUserLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        const location =
          (await Location.getLastKnownPositionAsync()) ||
          (await Location.getCurrentPositionAsync({}));
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
    } catch (error) {
      console.warn("Erro ao centralizar no usuário:", error);
    }
  };

  const animatedMapStyle = useAnimatedStyle(() => {
    const bottomOffset = Math.max(
      0,
      SCREEN_HEIGHT - animatedPosition.value - 60 - insets.bottom
    );
    return {
      marginBottom: bottomOffset,
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <Animated.View style={[styles.map, animatedMapStyle]}>
        <MapboxGL.MapView
          style={StyleSheet.absoluteFill}
          styleURL={
            isDarkMode ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street
          }
          logoEnabled={false}
          attributionEnabled={false}
          scaleBarEnabled={false}
          onPress={() => {
            bottomSheetRef.current?.close();
            setSelectedPonto(null);
          }}
        >
          <MapboxGL.Camera
            centerCoordinate={[-51.9253, -14.235]}
            ref={cameraRef}
          />
          <MapboxGL.UserLocation visible={true} />
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
      </Animated.View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["10%", "25%"]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: isDarkMode ? "#333" : "#fff" }}
        animatedIndex={animatedIndex}
        animatedPosition={animatedPosition}
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
      <TouchableOpacity
        style={[
          styles.locationButton,
          {
            backgroundColor: isDarkMode ? "#219653" : "#fff",
            borderColor: isDarkMode ? "#fff" : "#219653",
          },
        ]}
        onPress={centerOnUserLocation}
        activeOpacity={0.8}
      >
        <Ionicons
          name="locate-outline"
          size={24}
          color={isDarkMode ? "#fff" : "#219653"}
        />
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: {
    width: 25,
    height: 25,
    borderRadius: 30,
    backgroundColor: "#219653",
    borderWidth: 2,
    borderColor: "#fff",
  },
  sheet: { padding: 20 },
  title: { fontSize: 18, fontWeight: "bold" },
  locationButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    borderWidth: 2,
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
