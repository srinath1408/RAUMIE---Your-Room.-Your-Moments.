import { Colors } from '@/constants/Colors';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    useWarmUpBrowser();
    const router = useRouter();

    const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' });
    const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' });

    const onSelectAuth = async (strategy: 'google' | 'apple') => {
        try {
            const selectedFlow = strategy === 'google' ? startGoogleFlow : startAppleFlow;

            const { createdSessionId, setActive } = await selectedFlow();

            if (createdSessionId) {
                if (setActive) {
                    await setActive({ session: createdSessionId });
                    router.replace('/(tabs)');
                }
            } else {
                // Handle existing session or verification needed
            }
        } catch (err) {
            console.error('OAuth error', err);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Raumie</Text>
                <Text style={styles.subtitle}>Your Room. Your Moments.</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.btn, styles.btnGoogle]}
                    onPress={() => onSelectAuth('google')}
                >
                    <Text style={styles.btnText}>Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, styles.btnApple]}
                    onPress={() => onSelectAuth('apple')}
                >
                    <Text style={[styles.btnText, styles.textApple]}>Continue with Apple</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.footer}>
                By continuing, you agree to our Terms and Privacy Policy.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        padding: 24,
        justifyContent: 'space-between',
        paddingVertical: 80,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: Colors.light.text,
        fontFamily: 'SpaceMono', // Example, strictly should use custom font if available
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.light.icon,
        marginTop: 8,
    },
    actions: {
        gap: 16,
    },
    btn: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    btnGoogle: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        // Shadow for elevation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    btnApple: {
        backgroundColor: '#000',
    },
    btnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    textApple: {
        color: '#fff',
    },
    footer: {
        textAlign: 'center',
        color: Colors.light.tabIconDefault,
        fontSize: 12,
    },
});
