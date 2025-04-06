import "dotenv/config";

export default {
  name: "TrashMap",
  slug: "trashmap",
  version: "0.0.1",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  icon: "./assets/images/icon.png",
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
  android: {
    package: "com.juanaleixo.trashmap",
  },
  extra: {
    eas: {
      projectId: "fc4b1265-c01e-48dd-91ae-3c2f2191d157",
    },
  },
  owner: "juanaleixo",
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          extraManifests: [
            {
              "meta-data": {
                "android:name": "com.google.android.geo.API_KEY",
                "android:value": process.env.GOOGLE_MAPS_API_KEY,
              },
            },
          ],
        },
      },
    ],
  ],
};
