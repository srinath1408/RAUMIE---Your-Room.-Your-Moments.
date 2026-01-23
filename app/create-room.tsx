import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

export default function CreateRoomScreen() {
    const { isLoaded, isSignedIn } = useAuth();
    const [name, setName] = useState('');
    const [isTemporary, setIsTemporary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const createRoom = useMutation(api.rooms.create);

    const handleCreate = async () => {
        if (!name.trim()) return;
        setIsSubmitting(true);
        try {
            // Generate a mock encryptionKeyId for now (Phase 2).
            const encryptionKeyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const result = await createRoom({
                name: name.trim(),
                type: isTemporary ? 'temporary' : 'normal',
                encryptionKeyId,
            });

            router.replace(`/room/${result.roomId}`);
        } catch (err) {
            console.error(err);
            alert('Failed to create room. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.label, { color: theme.text }]}>Room Name</Text>
            <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="e.g. Weekend Trip, Besties"
                placeholderTextColor={theme.icon}
                value={name}
                onChangeText={setName}
                autoFocus
            />

            <View style={styles.row}>
                <View style={styles.textContainer}>
                    <Text style={[styles.label, { color: theme.text }]}>Temporary Room</Text>
                    <Text style={[styles.subLabel, { color: theme.icon }]}>Auto-deletes when empty</Text>
                </View>
                <Switch
                    value={isTemporary}
                    onValueChange={setIsTemporary}
                    trackColor={{ false: '#767577', true: theme.tint }}
                />
            </View>

            <Pressable
                style={[styles.btn, { backgroundColor: theme.tint, opacity: !name.trim() || isSubmitting || !isLoaded || !isSignedIn ? 0.5 : 1 }]}
                onPress={handleCreate}
                disabled={!name.trim() || isSubmitting || !isLoaded || !isSignedIn}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.btnText}>Create Room</Text>
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
    subLabel: {
        fontSize: 14,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    textContainer: {
        flex: 1,
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
