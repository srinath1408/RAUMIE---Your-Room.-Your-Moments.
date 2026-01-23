import { Text, View } from '@/components/Themed';
import { StyleSheet } from 'react-native';

export default function FriendsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Friends</Text>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            {/* List of friends will go here */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
