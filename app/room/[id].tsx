import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from 'convex/react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

export default function RoomScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    // Cast to Id to make TS happy, Convex handles runtime string check
    const roomId = id as Id<"rooms">;
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const room = useQuery(api.rooms.getRoom, { roomId });

    if (room === undefined) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    if (room === null) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.text }]}>Room not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: room.name,
                    headerRight: () => (
                        <Pressable>
                            <FontAwesome name="cog" size={24} color={theme.text} />
                        </Pressable>
                    )
                }}
            />
            <View style={[styles.container, styles.center]}>
                <FontAwesome name="photo" size={48} color={theme.tabIconDefault} style={{ marginBottom: 16 }} />
                <Text style={[styles.placeholderText, { color: theme.text }]}>Room Feed</Text>
                <Text style={[styles.codeText, { color: theme.tint }]}>Code: {room.code}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 18, fontWeight: 'bold' },
    placeholderText: { fontSize: 24, fontWeight: 'bold' },
    codeText: { marginTop: 8, fontSize: 18, fontFamily: 'SpaceMono' }
});
