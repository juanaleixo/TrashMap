import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import MapScreen from "../screens/MapScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Início") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Mapa") {
              iconName = focused ? "map" : "map-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: isDarkMode ? "#1E90FF" : "#007AFF",
          tabBarInactiveTintColor: isDarkMode ? "lightgray" : "gray",
          tabBarStyle: {
            backgroundColor: isDarkMode ? "#121212" : "white",
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? "#333" : "#e0e0e0",
            paddingBottom: insets.bottom,
            height: 60 + insets.bottom,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Início" component={HomeScreen} />
        <Tab.Screen name="Mapa" component={MapScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default TabNavigator;
