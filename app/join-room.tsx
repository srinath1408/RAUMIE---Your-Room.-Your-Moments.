import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function JoinRoomScreen() {
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const joinRoom = useMutation(api.rooms.join);

    const handleJoin = async () => {
        if (code.length < 6) return;
        setIsSubmitting(true);
        try {
            const result = await joinRoom({
                code: code.toUpperCase(), // Normalize to uppercase
            });

            router.replace(`/room/${result.roomId}`);
        } catch (err) {
            console.error(err);
            alert('Failed to join room. Check the code and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.label, { color: theme.text }]}>Enter Room Code</Text>
            <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
                placeholder="6-character code"
                placeholderTextColor={theme.icon}
                value={code}
                onChangeText={(text) => setCode(text.toUpperCase())} // Auto-uppercase
                autoFocus
                maxLength={6}
            />

            <Pressable
                style={[styles.btn, { backgroundColor: theme.tint, opacity: code.length < 6 || isSubmitting ? 0.5 : 1 }]}
                onPress={handleJoin}
                disabled={code.length < 6 || isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.btnText}>Join Room</Text>
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 24,
        // Monospace font for code entry looks better
        fontFamily: 'SpaceMono',
    },
    btn: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
