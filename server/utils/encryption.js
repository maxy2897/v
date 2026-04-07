import crypto from 'crypto';

// Validar que la clave existe y tiene el tamaño correcto al arrancar
const getEncryptionKey = () => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        // En desarrollo no explotamos para no bloquear al usuario, pero avisamos
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️ ENCRYPTION_KEY no definida. Usando clave de desarrollo insegura.');
            return Buffer.alloc(32, 'dev_key');
        }
        throw new Error('❌ CRÍTICO: ENCRYPTION_KEY no definida en las variables de entorno.');
    }

    const keyBuffer = Buffer.from(key);
    if (keyBuffer.length !== 32) {
        throw new Error(`❌ CRÍTICO: ENCRYPTION_KEY debe tener exactamente 32 bytes. Actual: ${keyBuffer.length}`);
    }
    return keyBuffer;
};

const ENCRYPTION_KEY = getEncryptionKey();
const IV_LENGTH = 12; // GCM usa 12 bytes para el IV

/**
 * Cifra un texto usando AES-256-GCM (Autenticado)
 * @param {string} text Texto en claro
 * @returns {string} Formato iv:tag:encrypted
 */
export const encrypt = (text) => {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag().toString('hex');
        
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
};

/**
 * Descifra un texto cifrado en formato iv:tag:encrypted
 * @param {string} text Texto cifrado
 * @returns {string} Texto en claro
 */
export const decrypt = (text) => {
    if (!text || !text.includes(':')) return text;
    
    const parts = text.split(':');
    
    // Si no tiene 3 partes (IV:TAG:CONTENT), intentamos ver si es el formato viejo (CBC)
    // Pero lo ideal es que a partir de ahora todo sea GCM
    if (parts.length !== 3) return text;

    try {
        const [ivHex, authTagHex, encryptedHex] = parts;
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
        
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        // Si falla (por ejemplo, los datos estaban en formato viejo CBC), devolvemos original
        return text;
    }
};
