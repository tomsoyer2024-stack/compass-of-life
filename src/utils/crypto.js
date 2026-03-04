/**
 * Enterprise Grade Crypto Utility
 * Standard: AES-GCM (256-bit)
 * KDF: PBKDF2 (100,000 iterations)
 * 
 * Logic:
 * 1. User enters password.
 * 2. We derive a Key using PBKDF2 + Salt.
 * 3. This Key encrypts the data (AES-GCM).
 * 4. We NEVER store the password or the Key.
 * 5. We store the Salt and the Encrypted Data (IV + Ciphertext).
 */

const ALGORITHM = 'AES-GCM';
const KDF = 'PBKDF2';
const SALT_LEN = 16;
const IV_LEN = 12; // Standard for GCM
const ITERATIONS = 100000;
const HASH = 'SHA-256';

// --- Utils ---
const buffToHex = (buff) => Array.from(new Uint8Array(buff)).map(b => b.toString(16).padStart(2, '0')).join('');
const hexToBuff = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

// Text Encoder/Decoder
const enc = new TextEncoder();
const dec = new TextDecoder();

/**
 * Derives a CryptoKey from a password and salt.
 */
export const deriveKey = async (password, saltHex) => {
    const salt = saltHex ? hexToBuff(saltHex) : crypto.getRandomValues(new Uint8Array(SALT_LEN));

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: KDF },
        false,
        ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: KDF,
            salt: salt,
            iterations: ITERATIONS,
            hash: HASH
        },
        keyMaterial,
        { name: ALGORITHM, length: 256 },
        true, // extractable (we might need to export it for session usage, though strictly keeping it internal is better)
        ['encrypt', 'decrypt']
    );

    return { key, salt: buffToHex(salt) };
};

/**
 * Encrypts an object/string.
 * Returns: { cipher: hex_string, iv: hex_string, salt: hex_string }
 */
export const encryptData = async (data, password, existingSalt = null) => {
    try {
        const { key, salt } = await deriveKey(password, existingSalt);
        const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
        const encodedData = enc.encode(JSON.stringify(data));

        const encryptedContent = await crypto.subtle.encrypt(
            {
                name: ALGORITHM,
                iv: iv
            },
            key,
            encodedData
        );

        return {
            cipher: buffToHex(encryptedContent),
            iv: buffToHex(iv),
            salt: salt
        };
    } catch (e) {
        console.error("Crypto Error:", e);
        throw new Error("Encryption failed");
    }
};

/**
 * Decrypts data.
 * Returns: Original Data Object
 */
export const decryptData = async (cipherHex, ivHex, saltHex, password) => {
    try {
        const { key } = await deriveKey(password, saltHex);
        const iv = hexToBuff(ivHex);
        const cipher = hexToBuff(cipherHex);

        const decryptedContent = await crypto.subtle.decrypt(
            {
                name: ALGORITHM,
                iv: iv
            },
            key,
            cipher
        );

        return JSON.parse(dec.decode(decryptedContent));
    } catch (e) {
        console.error("Decryption Error:", e);
        throw new Error("Invalid Password or Corrupted Data");
    }
};

/**
 * Verifies if the password is correct by trying to decrypt a "Check Payload".
 * Useful for AuthGate.
 */
export const verifyPassword = async (password, vaultData) => {
    if (!vaultData || !vaultData.check) return false;
    try {
        // We try to decrypt the 'check' property which is just a known string like "OK"
        const result = await decryptData(vaultData.check.cipher, vaultData.check.iv, vaultData.check.salt, password);
        return result === 'VALID_VAULT';
    } catch {
        return false;
    }
};
