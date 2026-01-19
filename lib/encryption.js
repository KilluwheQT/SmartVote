import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'smartvote-secure-key-2024';

export const encryptVote = (voteData) => {
  const jsonString = JSON.stringify(voteData);
  return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
};

export const decryptVote = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedString);
};

export const hashData = (data) => {
  return CryptoJS.SHA256(JSON.stringify(data)).toString();
};

export const generateVoteReceipt = (voterId, electionId, timestamp) => {
  const receiptData = `${voterId}-${electionId}-${timestamp}-${Math.random()}`;
  return CryptoJS.SHA256(receiptData).toString().substring(0, 16).toUpperCase();
};

export const verifyIntegrity = (data, hash) => {
  const computedHash = hashData(data);
  return computedHash === hash;
};
