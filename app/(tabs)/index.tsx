import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { api } from '@/convex/_generated/api';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from 'convex/react';
import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function RoomsScreen() {
  const rooms = useQuery(api.rooms.getUserRooms);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  if (rooms === undefined) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="inbox" size={50} color={theme.tabIconDefault} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No rooms yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.icon }]}>Create or join a room to get started</Text>

            <View style={styles.emptyActions}>
              <Link href="/create-room" asChild>
                <Pressable style={[styles.btn, { backgroundColor: theme.tint }]}>
                  <Text style={styles.btnText}>Create Room</Text>
                </Pressable>
              </Link>
              <Link href="/join-room" asChild>
                <Pressable style={[styles.btn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.tint }]}>
                  <Text style={[styles.btnText, { color: theme.tint }]}>Join Room</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Link href={`/room/${item._id}`} asChild>
            <Pressable style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                {item.type === 'temporary' && <FontAwesome name="hourglass-1" size={14} color={theme.text} style={{ opacity: 0.5 }} />}
              </View>
              <Text style={[styles.cardSubtitle, { color: theme.text }]}>
                {item.role === 'owner' ? 'Owner' : 'Member'} • Code: {item.code}
              </Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 12,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyActions: {
    gap: 12,
  },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  }

});
