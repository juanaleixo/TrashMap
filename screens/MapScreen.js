import React, { useEffect, useFocusEffect, useCallback, useState } from "react";
import { StyleSheet, View, Modal, Text, Button } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { supabase } from "../lib/supabase";
import * as Location from "expo-location";

export default function MapScreen() {
  const [initialRegion, setInitialRegion] = useState({
    latitude: -14.235004, // Latitude central aproximada do Brasil
    longitude: -51.92528, // Longitude central aproximada do Brasil
    latitudeDelta: 40, // Abrangência maior para cobrir o Brasil
    longitudeDelta: 40, // Abrangência maior para cobrir o Brasil
  });

  const [pontos, setPontos] = useState([]);

  const [show, setShow] = useState(false);

  const [selectedPonto, setSelectedPonto] = useState(null);

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

  return (
    <View style={styles.container}>
      {show && (
        <MapView
          style={styles.map}
          showsUserLocation={true}
          region={initialRegion}
        >
          {pontos.map((ponto) => (
            <Marker
              key={ponto.id}
              coordinate={{
                latitude: ponto.latitude,
                longitude: ponto.longitude,
              }}
              title={ponto.name}
              onPress={() => setSelectedPonto(ponto)}
            />
          ))}
        </MapView>
      )}

{selectedPonto && (
      <Modal
        animationType="slide"
        visible={true}
        onRequestClose={() => setSelectedPonto(null)}
      >
        <View style={styles.modalView}>
          <Text>{selectedPonto.name}</Text>
          <Text>Materiais aceitos: Teste</Text>
          <Button title="Fechar" onPress={() => setSelectedPonto(null)} />
        </View>
      </Modal>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
