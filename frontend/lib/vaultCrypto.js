/**
 * Client-Side Zero-Knowledge Encryption Engine for PennyPal Local Vault (.finpal)
 * Uses native Web Crypto API (crypto.subtle) with PBKDF2 (SHA-256) and AES-GCM (256-bit).
 * Financial data is encrypted/decrypted strictly in-browser without any cloud transmission.
 */

// Helpers for Base64 <-> Uint8Array conversion
function uint8ToBase64(uint8) {
  let binary = "";
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64Str) {
  const binary = atob(base64Str);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives an AES-GCM 256-bit CryptoKey from user password using PBKDF2 with SHA-256.
 */
async function deriveAesGcmKey(password, saltUint8, iterations = 100000) {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltUint8,
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a plaintext JavaScript object into a `.finpal` encrypted container.
 * @param {Object} payload - Plaintext financial ledger object
 * @param {string} password - User-chosen backup password
 * @returns {Promise<string>} JSON string of the encrypted .finpal file
 */
export async function encryptVaultPayload(payload, password) {
  if (!password || password.length < 6) {
    throw new Error("Backup password must be at least 6 characters long.");
  }

  // 1. Generate cryptographically secure random salt (16 bytes) and IV (12 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 100000;

  // 2. Derive 256-bit AES-GCM key
  const aesKey = await deriveAesGcmKey(password, salt, iterations);

  // 3. Serialize and encrypt payload
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(JSON.stringify(payload));

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    plaintextBytes
  );

  // 4. Wrap into clean JSON container
  const container = {
    format: "pennypal_backup",
    version: 1,
    createdAt: new Date().toISOString(),
    kdf: {
      algorithm: "PBKDF2",
      hash: "SHA-256",
      iterations,
      salt: uint8ToBase64(salt),
    },
    cipher: {
      algorithm: "AES-GCM",
      iv: uint8ToBase64(iv),
      ciphertext: uint8ToBase64(new Uint8Array(ciphertextBuffer)),
    },
  };

  return JSON.stringify(container, null, 2);
}

/**
 * Decrypt a `.finpal` encrypted file text into the plaintext JavaScript object.
 * @param {string|Object} fileContent - File text or parsed JSON container
 * @param {string} password - User backup password
 * @returns {Promise<Object>} Plaintext financial ledger object
 */
export async function decryptVaultPayload(fileContent, password) {
  if (!password) {
    throw new Error("Please enter your backup password.");
  }

  let container;
  if (typeof fileContent === "string") {
    try {
      container = JSON.parse(fileContent);
    } catch {
      throw new Error("Invalid backup file: Not valid JSON.");
    }
  } else {
    container = fileContent;
  }

  // Validate container format
  const validFormats = ["pennypal_backup", "finpal_backup", "finpal"];
  if (!container || !validFormats.includes(container.format)) {
    throw new Error("Unrecognized backup file format. Must be a valid .finpal backup.");
  }

  if (!container.kdf || !container.cipher || !container.cipher.ciphertext) {
    throw new Error("Corrupted backup file: Missing cryptographic parameters.");
  }

  const salt = base64ToUint8(container.kdf.salt);
  const iv = base64ToUint8(container.cipher.iv);
  const ciphertext = base64ToUint8(container.cipher.ciphertext);
  const iterations = container.kdf.iterations || 100000;

  // Derive key using the file's salt
  const aesKey = await deriveAesGcmKey(password, salt, iterations);

  // Attempt AES-GCM decryption
  let decryptedBuffer;
  try {
    decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      aesKey,
      ciphertext
    );
  } catch (err) {
    // In AES-GCM, any wrong key or tampered ciphertext triggers an authentication failure
    throw new Error("Incorrect backup password or corrupted backup file.");
  }

  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decryptedBuffer);

  try {
    const payload = JSON.parse(jsonString);
    if (!payload || !payload.vault) {
      throw new Error("Backup file does not contain a valid vault payload.");
    }
    return payload;
  } catch (err) {
    throw new Error("Failed to parse decrypted vault data.");
  }
}
