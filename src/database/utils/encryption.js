const crypto = require('crypto');

// Constants
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const HASH_ALGORITHM = 'sha256';

/**
 * Encrypts sensitive data using AES-256-CBC encryption
 * @param {string} data - The data to be encrypted
 * @returns {string} Encrypted data in the format 'iv:encryptedData'
 * @throws {Error} If encryption fails
 * 
 * Requirements addressed:
 * - Data Security (8. SECURITY CONSIDERATIONS/8.2 DATA SECURITY)
 *   Implements data encryption for sensitive information using industry-standard encryption libraries.
 */
function encrypt(data) {
  if (!data) {
    throw new Error('Data to encrypt is required');
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypts data that was encrypted using the encrypt function
 * @param {string} encryptedData - The data to be decrypted in the format 'iv:encryptedData'
 * @returns {string} Decrypted data
 * @throws {Error} If decryption fails
 * 
 * Requirements addressed:
 * - Data Security (8. SECURITY CONSIDERATIONS/8.2 DATA SECURITY)
 *   Implements data decryption for sensitive information using industry-standard encryption libraries.
 */
function decrypt(encryptedData) {
  if (!encryptedData) {
    throw new Error('Encrypted data is required');
  }

  try {
    const [ivHex, encryptedHex] = encryptedData.split(':');
    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Hashes a password using PBKDF2 with a salt
 * @param {string} password - The password to be hashed
 * @returns {string} Hashed password in the format 'salt:hashedPassword'
 * @throws {Error} If password hashing fails
 * 
 * Requirements addressed:
 * - Data Security (8. SECURITY CONSIDERATIONS/8.2 DATA SECURITY)
 *   Implements secure password hashing using industry-standard cryptographic functions.
 */
function hashPassword(password) {
  if (!password) {
    throw new Error('Password is required');
  }

  try {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, HASH_ALGORITHM).toString('hex');
    return `${salt}:${hash}`;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Verifies a password against a stored hash
 * @param {string} password - The password to be verified
 * @param {string} storedHash - The stored hash in the format 'salt:hashedPassword'
 * @returns {boolean} True if the password matches, false otherwise
 * @throws {Error} If password verification fails
 * 
 * Requirements addressed:
 * - Data Security (8. SECURITY CONSIDERATIONS/8.2 DATA SECURITY)
 *   Implements secure password verification using industry-standard cryptographic functions.
 */
function verifyPassword(password, storedHash) {
  if (!password || !storedHash) {
    throw new Error('Password and stored hash are required');
  }

  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) {
      throw new Error('Invalid stored hash format');
    }

    const verifyHash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, HASH_ALGORITHM).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
}

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword
};