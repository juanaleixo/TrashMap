// hooks/useUserLocation.js
import { useCallback, useRef } from "react";
import * as Location from "expo-location";

export function useUserLocation() {
  const locRef = useRef(null);

  const askPermissionIfNeeded = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      await Location.requestForegroundPermissionsAsync();
    }
  }, []);

  const centerOnUserLocation = useCallback(async () => {
    await askPermissionIfNeeded();
    const loc =
      (await Location.getLastKnownPositionAsync()) ||
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }));
    locRef.current = loc.coords;
    return loc.coords;
  }, []);

  return {
    userLocation: locRef.current,
    askPermissionIfNeeded,
    centerOnUserLocation,
  };
}