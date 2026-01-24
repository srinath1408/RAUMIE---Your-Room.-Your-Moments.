import { MediaItem } from '@/components/MediaItem';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from 'convex/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function RoomScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    // Cast to Id to make TS happy, Convex handles runtime string check
    const roomId = id as Id<"rooms">;
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

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

            {/* Media Feed directly in the main view */}
            <MediaFeed roomId={roomId} theme={theme} />

            {/* Camera FAB */}
            <Pressable
                style={[styles.fab, { backgroundColor: theme.tint }]}
                onPress={() => router.push(`/room/${roomId}/camera`)}
            >
                <FontAwesome name="camera" size={24} color="#fff" />
            </Pressable>

            {/* Room Code Overlay (Small) */}
            <View style={styles.codeOverlay}>
                <Text style={[styles.codeText, { color: theme.text }]}>{room.code}</Text>
            </View>
        </View>
    );
}

function MediaFeed({ roomId, theme }: { roomId: Id<"rooms">, theme: any }) {
    const mediaList = useQuery(api.media.list, { roomId });

    if (mediaList === undefined) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator />
            </View>
        );
    }

    if (mediaList.length === 0) {
        return (
            <View style={[styles.container, styles.center]}>
                <FontAwesome name="photo" size={48} color={theme.tabIconDefault} style={{ marginBottom: 16 }} />
                <Text style={[styles.placeholderText, { color: theme.text }]}>No photos yet</Text>
                <Text style={{ color: theme.text, marginTop: 8 }}>Tap the camera to start sharing!</Text>
            </View>
        )
    }

    return (
        <FlatList
            data={mediaList}
            keyExtractor={(item) => item._id}
            numColumns={3}
            renderItem={({ item }) => (
                <MediaItem
                    roomId={roomId}
                    url={item.url}
                    encryption={{
                        iv: item.encryption.iv,
                        keyVersion: item.encryption.keyVersion
                    }}
                    mimeType={item.mimeType}
                />
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 18, fontWeight: 'bold' },
    placeholderText: { fontSize: 24, fontWeight: 'bold' },
    codeText: { fontSize: 14, fontFamily: 'SpaceMono', fontWeight: 'bold', opacity: 0.8 },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    codeOverlay: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        alignItems: 'center',
        //zIndex: -1, // Behind content? Or top? Feed might cover it. 
        // Let's put it on top but small
        zIndex: 10,
        pointerEvents: 'none' // Let clicks pass through
    }
});
