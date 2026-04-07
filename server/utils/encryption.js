import crypto from 'crypto';

// La clave debe ser de 32 bytes (256 bits)
// En producción, esto DEBE estar en process.env.ENCRYPTION_KEY
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'bb_secret_encryption_key_32bytes_!!'; 
const IV_LENGTH = 16; // Para AES, siempre es 16

/**
 * Cifra un texto usando AES-256-CBC
 * @param {string} text Texto en claro
 * @returns {string} Texto cifrado en formato iv:encrypted
 */
export const encrypt = (text) => {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
};

/**
 * Descifra un texto cifrado en formato iv:encrypted
 * @param {string} text Texto cifrado
 * @returns {string} Texto en claro
 */
export const decrypt = (text) => {
    if (!text || !text.includes(':')) return text;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        // Si falla el descifrado (ej: no estaba cifrado), devolvemos el texto original
        return text;
    }
};
