// src/utils/generateDid.js
const { nanoid } = require('nanoid');

function generateSimulatedDid() {
  return `did:haid:${nanoid(8)}`;
}

function generateTransactionId() {
  return `txn-${nanoid(8)}`;
}

module.exports = { generateSimulatedDid, generateTransactionId };
