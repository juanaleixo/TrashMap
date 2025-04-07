import "dotenv/config";

export default {
  name: "TrashMap",
  slug: "trashmap",
  version: "0.0.1",
  newArchitecture: true,
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  icon: "./assets/images/icon.png",
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/foreground.png",
      backgroundColor: "#8fff00",
    },
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    package: "com.juanaleixo.trashmap",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.juanaleixo.trashmap",
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        "Este aplicativo usa sua localização para mostrar pontos de coleta de lixo próximos.",
    },
  },
  extra: {
    eas: {
      projectId: "fc4b1265-c01e-48dd-91ae-3c2f2191d157",
    },
  },
  owner: "juanaleixo",
};
