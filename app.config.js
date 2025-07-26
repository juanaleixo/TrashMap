export default {
  expo: {
    name: "TrashMap",
    slug: "trashmap",
    version: "0.0.3",
    newArchitecture: true,
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    assetBundlePatterns: ["**/*"],
    icon: "./assets/images/icon-1024.png",
    scheme: "trashmap",
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon-foreground.png",
        backgroundImage: "./assets/images/icon-background.png",
        monochromeImage: "./assets/images/icon-mono.png",
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      package: "com.trashmap",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.trashmap",
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
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            extraMavenRepos: [
              "https://api.mapbox.com/downloads/v2/releases/maven",
            ],
          },
        },
      ],
    ],
    owner: "juanaleixo",
  },
};
