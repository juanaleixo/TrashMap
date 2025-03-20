import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

const HomeScreen = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (  
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
      <Text style={[styles.text, { color: isDarkMode ? 'white' : 'black' }]}>Tela Início</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeScreen;