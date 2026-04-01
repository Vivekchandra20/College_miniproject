/**
 * E2EE utilities using tweetnacl
 */

import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

const getStorageKey = (userId, type) => `e2ee_${type}_${userId}`;

export const getOrCreateKeypair = async (userId) => {
  const publicKeyKey = getStorageKey(userId, 'publicKey');
  const privateKeyKey = getStorageKey(userId, 'privateKey');

  const storedPublicKey = localStorage.getItem(publicKeyKey);
  const storedPrivateKey = localStorage.getItem(privateKeyKey);

  if (storedPublicKey && storedPrivateKey) {
    return {
      publicKey: storedPublicKey,
      privateKey: storedPrivateKey,
    };
  }

  const keypair = nacl.box.keyPair();
  const publicKey = naclUtil.encodeBase64(keypair.publicKey);
  const privateKey = naclUtil.encodeBase64(keypair.secretKey);

  localStorage.setItem(publicKeyKey, publicKey);
  localStorage.setItem(privateKeyKey, privateKey);

  return { publicKey, privateKey };
};

export const encryptMessageForRecipients = async (content, recipients, senderKeypair) => {
  const messageBytes = naclUtil.decodeUTF8(content);
  const symmetricKey = nacl.randomBytes(nacl.secretbox.keyLength);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const cipherText = nacl.secretbox(messageBytes, nonce, symmetricKey);

  const senderSecretKey = naclUtil.decodeBase64(senderKeypair.privateKey);

  const encryptedKeys = recipients.map((recipient) => {
    const recipientPublicKey = naclUtil.decodeBase64(recipient.publicKey);
    const keyNonce = nacl.randomBytes(nacl.box.nonceLength);
    const encryptedKey = nacl.box(symmetricKey, keyNonce, recipientPublicKey, senderSecretKey);

    return {
      userId: recipient.userId,
      key: naclUtil.encodeBase64(encryptedKey),
      keyNonce: naclUtil.encodeBase64(keyNonce),
    };
  });

  return {
    cipherText: naclUtil.encodeBase64(cipherText),
    nonce: naclUtil.encodeBase64(nonce),
    keys: encryptedKeys,
  };
};

export const decryptMessageForUser = async (payload, userId, keypair, senderPublicKey) => {
  if (!payload?.cipherText || !payload?.nonce || !payload?.encryptedKeys?.length) {
    return null;
  }

  const keyEntry = payload.encryptedKeys.find((entry) => entry.user === userId || entry.userId === userId);
  if (!keyEntry) {
    return null;
  }

  const recipientSecretKey = naclUtil.decodeBase64(keypair.privateKey);
  const senderPublicKeyBytes = naclUtil.decodeBase64(senderPublicKey);
  const keyNonce = naclUtil.decodeBase64(keyEntry.keyNonce);
  const encryptedKey = naclUtil.decodeBase64(keyEntry.key);

  const symmetricKey = nacl.box.open(encryptedKey, keyNonce, senderPublicKeyBytes, recipientSecretKey);
  if (!symmetricKey) {
    return null;
  }

  const nonceBytes = naclUtil.decodeBase64(payload.nonce);
  const cipherTextBytes = naclUtil.decodeBase64(payload.cipherText);
  const messageBytes = nacl.secretbox.open(cipherTextBytes, nonceBytes, symmetricKey);

  if (!messageBytes) {
    return null;
  }

  return naclUtil.encodeUTF8(messageBytes);
};

export const buildEncryptedPayloadFromMessage = (message) => {
  return {
    cipherText: message.cipherText,
    nonce: message.nonce,
    encryptedKeys: message.encryptedKeys,
  };
};
