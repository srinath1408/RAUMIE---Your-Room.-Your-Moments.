import { decryptMedia } from '@/utils/crypto';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, View } from 'react-native';

interface MediaItemProps {
    roomId: string; // Id<"rooms"> string
    url: string | null;
    encryption: {
        iv: string;
        keyVersion?: string;
    };
    mimeType: string;
}

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 3 - 2; // 3 columns

export function MediaItem({ roomId, url, encryption, mimeType }: MediaItemProps) {
    const [decryptedUri, setDecryptedUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function load() {
            if (!url) {
                if (mounted) setLoading(false);
                return;
            }

            try {
                // 1. Download Encrypted Blob
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const encryptedBytes = new Uint8Array(arrayBuffer);

                // 2. Decrypt
                const uri = await decryptMedia(encryptedBytes, encryption.iv, roomId);

                if (mounted) {
                    if (uri) setDecryptedUri(uri);
                    else setError(true);
                }
            } catch (e) {
                console.error("Failed to load media", e);
                if (mounted) setError(true);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => { mounted = false; };
    }, [url, roomId, encryption.iv]);

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="small" />
            </View>
        );
    }

    if (error || !decryptedUri) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: '#eee' }]}>
                {/* Visual placeholder for error/decryption fail */}
            </View>
        );
    }

    return (
        <Image
            source={{ uri: decryptedUri }}
            style={styles.container}
            resizeMode="cover"
        />
    );
}

const styles = StyleSheet.create({
    container: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        margin: 1,
        backgroundColor: '#f0f0f0',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});
