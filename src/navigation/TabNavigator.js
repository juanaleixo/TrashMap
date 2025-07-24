import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme, Platform } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import MapScreen from "../screens/MapScreen";
import SearchScreen from "../screens/SearchScreen";
import UserScreen from "../screens/UserScreen";
import AddScreen from "../screens/AddScreen";

const Tab = createBottomTabNavigator();

const CustomAddButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={styles.addButtonContainer}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <View style={styles.addButton}>{children}</View>
  </TouchableOpacity>
);

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isMobile = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <Tab.Navigator
        lazy={false}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Início") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Pesquisa") {
              iconName = focused ? "search" : "search-outline";
            } else if (route.name === "Mapa") {
              iconName = focused ? "map" : "map-outline";
            } else if (route.name === "Perfil") {
              iconName = focused ? "person" : "person-outline";
            } else if (route.name === "Adicionar") {
              return (
                <Ionicons
                  name="add"
                  size={36}
                  color="#fff"
                  style={{}}
                />
              );
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
        <Tab.Screen name="Pesquisa" component={SearchScreen} />
        <Tab.Screen
          name="Adicionar"
          component={AddScreen}
          options={{
            tabBarLabel: "",
            tabBarButton: (props) => (
              <CustomAddButton {...props}>
                <Ionicons name="add" size={36} color="#fff" />
              </CustomAddButton>
            ),
          }}
        />
        <Tab.Screen name="Mapa" component={MapScreen} />
        <Tab.Screen name="Perfil" component={UserScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  addButtonContainer: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1E90FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default TabNavigator;
