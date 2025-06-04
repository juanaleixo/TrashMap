import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { useColorScheme } from 'react-native';

export default function UserScreen() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const dynamicStyles = useUserScreenStyles();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <View style={dynamicStyles.container}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={dynamicStyles.container}>
                <Text style={dynamicStyles.text}>Nenhum usuário autenticado.</Text>
            </View>
        );
    }

    return (
        <View style={dynamicStyles.container}>
            <Text style={dynamicStyles.title}>Usuário</Text>
            <Text style={dynamicStyles.text}>Nome: {user.displayName || 'Não informado'}</Text>
            <Text style={dynamicStyles.text}>Email: {user.email || 'Não informado'}</Text>
            <View style={{ marginTop: 24 }}>
                <Button
                    title="Logout"
                    onPress={async () => {
                        const auth = getAuth();
                        try {
                            await auth.signOut();
                        } catch (error) {
                            // Trate o erro se necessário
                        }
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', // default light background
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#222', // default light text
    },
});

export function useUserScreenStyles() {
    const colorScheme = useColorScheme();
    return {
        container: [
            styles.container,
            colorScheme === 'dark' && { backgroundColor: '#121212' },
        ],
        title: [
            styles.title,
            colorScheme === 'dark' && { color: '#fff' },
        ],
        text: {
            color: colorScheme === 'dark' ? '#fff' : '#222',
        },
    };
}