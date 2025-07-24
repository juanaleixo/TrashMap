import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AddScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AddScreen Dummy</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 24,
    color: "#333",
  },
});

export default AddScreen;
