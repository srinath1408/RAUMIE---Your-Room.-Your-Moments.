import { gcm } from '@noble/ciphers/aes';
import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';

// Polyfill for randomBytes using the global crypto object (polyfilled by react-native-get-random-values)
function randomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

const ITEM_KEY_PREFIX = 'room_key_';
const KEY_LENGTH_BYTES = 32; // 256 bits

export async function generateRoomKey(): Promise<string> {
    // Generate random 256-bit key
    const key = randomBytes(KEY_LENGTH_BYTES);

    // Convert to Base64 to store in SecureStore
    const base64Key = btoa(String.fromCharCode(...key));
    return base64Key;
}

export async function storeRoomKey(roomId: string, base64Key: string) {
    await SecureStore.setItemAsync(`${ITEM_KEY_PREFIX}${roomId}`, base64Key);
}

export async function getRoomKey(roomId: string): Promise<Uint8Array | null> {
    const base64Key = await SecureStore.getItemAsync(`${ITEM_KEY_PREFIX}${roomId}`);
    if (!base64Key) return null;

    const binaryString = atob(base64Key);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export async function encryptMedia(fileUri: string, roomId: string): Promise<{ blob: Uint8Array, iv: string } | null> {
    const key = await getRoomKey(roomId);
    if (!key) throw new Error(`No key found for room ${roomId}`);

    // Read file as Base64 then convert to Uint8Array (Binary safe)
    const base64Data = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
    const binaryString = atob(base64Data);
    const data = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        data[i] = binaryString.charCodeAt(i);
    }

    const iv = randomBytes(12); // 96-bit IV for GCM

    // Encrypt using @noble/ciphers
    const aes = gcm(key, iv);
    const encryptedBuffer = aes.encrypt(data);

    return {
        blob: encryptedBuffer,
        iv: btoa(String.fromCharCode(...iv)), // Store IV as Base64
    };
}

export async function saveEncryptedFileToCache(data: Uint8Array): Promise<string> {
    const filename = `encrypted_${Date.now()}.bin`;
    const uri = FileSystem.cacheDirectory + filename;

    // Convert Uint8Array to Base64 manually to avoid stack overflow with large arrays
    let binary = '';
    const len = data.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(data[i]);
    }
    const base64 = btoa(binary);

    await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: 'base64',
    });

    return uri;
}

export async function decryptMedia(encryptedData: Uint8Array, ivBase64: string, roomId: string): Promise<string | null> {
    const key = await getRoomKey(roomId);
    if (!key) return null;

    const binaryIv = atob(ivBase64);
    const iv = new Uint8Array(binaryIv.length);
    for (let i = 0; i < binaryIv.length; i++) {
        iv[i] = binaryIv.charCodeAt(i);
    }

    try {
        const aes = gcm(key, iv);
        const decryptedBuffer = aes.decrypt(encryptedData);

        // Convert decrypted buffer back to a usable URI (e.g., Base64 Data URI)
        const decryptedBytes = new Uint8Array(decryptedBuffer);
        let binary = '';
        const len = decryptedBytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(decryptedBytes[i]);
        }
        const base64 = btoa(binary);

        // Return a data URI that Image components can render
        // Note: We need to know MIME type usually, assuming jpeg/png for now or passing it in
        return `data:image/jpeg;base64,${base64}`;
    } catch (e) {
        console.error("Decryption failed:", e);
        return null; // Return null on decryption failure (wrong key, etc)
    }
}
