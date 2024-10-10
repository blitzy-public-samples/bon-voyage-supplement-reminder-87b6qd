const crypto = require('crypto');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Constants
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const HASH_ALGORITHM = 'sha256';

// Validate ENCRYPTION_KEY
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error('Invalid ENCRYPTION_KEY. It must be a 64-character hexadecimal string.');
}

/**
 * Encrypts sensitive data using AES-256 encryption
 * @param {string} data - The data to be encrypted
 * @returns {string} Encrypted data in hexadecimal format
 * @throws {Error} If encryption fails
 */
function encrypt(data) {
  if (!data) {
    throw new Error('Data to encrypt is required');
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(Buffer.from(data, 'utf8'));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypts data that was encrypted using the encrypt function
 * @param {string} encryptedData - The data to be decrypted
 * @returns {string} Decrypted data in its original form
 * @throws {Error} If decryption fails
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
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Hashes a password using a secure one-way hashing algorithm
 * @param {string} password - The password to be hashed
 * @returns {string} Hashed password
 * @throws {Error} If password hashing fails
 */
function hashPassword(password) {
  if (!password) {
    throw new Error('Password is required');
  }

  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, HASH_ALGORITHM);
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Verifies a password against its hashed version
 * @param {string} password - The password to verify
 * @param {string} hashedPassword - The stored hashed password
 * @returns {boolean} True if the password matches, false otherwise
 * @throws {Error} If password verification fails
 */
function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) {
    throw new Error('Password and hashed password are required');
  }

  try {
    const [salt, storedHash] = hashedPassword.split(':');
    if (!salt || !storedHash) {
      throw new Error('Invalid hashed password format');
    }

    const hash = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), PBKDF2_ITERATIONS, KEY_LENGTH, HASH_ALGORITHM);
    return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), hash);
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