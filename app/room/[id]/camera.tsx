import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { encryptMedia, generateRoomKey, getRoomKey, saveEncryptedFileToCache, storeRoomKey } from '@/utils/crypto';
import { FontAwesome } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const [photo, setPhoto] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const roomId = id as Id<"rooms">;

    // Convex mutations
    const generateUploadUrl = useMutation(api.media.generateUploadUrl);
    const sendImage = useMutation(api.media.sendImage);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    async function takePicture() {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.7, // Compress initial JPEG
                    // skipProcessing: true, // Removed to ensure valid image generation
                });
                console.log("Photo taken:", photo?.uri);
                if (photo) {
                    setPhoto(photo.uri);
                }
            } catch (e) {
                console.error("Failed to take picture", e);
                alert("Failed to take picture");
            }
        }
    }

    async function handleSend() {
        if (!photo) return;
        setIsUploading(true);

        try {
            // 1. Resize/Compress (Optional but recommended)
            const manipResult = await ImageManipulator.manipulateAsync(
                photo,
                [{ resize: { width: 1080 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );

            // 2. Ensure Room Key Exists (Phase 3 Constraint: Local Only)
            let key = await getRoomKey(roomId);
            if (!key) {
                // If we don't have a key, generate one.
                // Note: In a real multi-user app, this key must be shared via QR code or invite link.
                // For Phase 3, we generate it locally.
                const base64Key = await generateRoomKey();
                await storeRoomKey(roomId, base64Key);
            }

            // 3. Encrypt
            const encrypted = await encryptMedia(manipResult.uri, roomId);
            if (!encrypted) throw new Error("Encryption failed");

            // 4. Get Upload URL
            const postUrl = await generateUploadUrl();

            // 5. Upload File (Bypassing Blob issues)
            const tempUri = await saveEncryptedFileToCache(encrypted.blob);

            const result = await (FileSystem as any).uploadAsync(postUrl, tempUri, {
                httpMethod: 'POST',
                headers: { "Content-Type": "application/octet-stream" },
            });

            // Clean up temp file
            await (FileSystem as any).deleteAsync(tempUri, { idempotent: true });

            if (result.status !== 200) throw new Error("Upload failed: " + result.status);

            const { storageId } = JSON.parse(result.body);

            // 6. Save Metadata
            await sendImage({
                roomId,
                storageId: storageId as Id<"_storage">,
                mimeType: "image/jpeg",
                encryption: {
                    iv: encrypted.iv,
                    keyVersion: "v1",
                }
            });

            router.back();

        } catch (e: any) {
            console.error("Upload error details:", e);
            alert(`Failed to upload photo: ${e.message || e}`);
        } finally {
            setIsUploading(false);
        }
    }

    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photo }} style={styles.preview} resizeMode="contain" />
                <View style={styles.controls}>
                    {isUploading ? (
                        <ActivityIndicator size="large" color="#fff" />
                    ) : (
                        <>
                            <TouchableOpacity style={styles.button} onPress={() => setPhoto(null)}>
                                <FontAwesome name="trash" size={32} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={handleSend}>
                                <FontAwesome name="send" size={32} color="white" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <FontAwesome name="refresh" size={32} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={takePicture}>
                        <View style={styles.shutter} />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black'
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white'
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    button: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        padding: 10,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    shutter: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        borderWidth: 4,
        borderColor: 'gray'
    },
    preview: {
        flex: 1,
        width: '100%',
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
    }
});
