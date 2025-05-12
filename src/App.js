import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar, useColorScheme } from "react-native";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TabNavigator from "./navigation/TabNavigator";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";

function Main() {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;
  if (!user) return <LoginScreen />;

  return <TabNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar
          barStyle={
            useColorScheme() === "dark" ? "light-content" : "dark-content"
          }
          backgroundColor="transparent"
          translucent
        />
        <Main />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
