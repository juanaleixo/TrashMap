import { SafeAreaProvider } from "react-native-safe-area-context";
import TabNavigator from "./navigation/TabNavigator";
import { StatusBar } from "react-native";
import { useColorScheme } from "react-native";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={
          useColorScheme() === "dark" ? "light-content" : "dark-content"
        }
        backgroundColor="transparent"
        translucent
      />
      <TabNavigator />
    </SafeAreaProvider>
  );
}
