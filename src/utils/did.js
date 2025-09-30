// src/utils/did.js
const crypto = require("crypto");
const { submitMessage } = require("./hedera");

// Generate an anchored DID for a user and submit to Hedera
async function generateAnchoredDID(userId, role) {
  // 1. Generate keypair
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "P-256",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  // 2. Derive hash of public key → DID
  const hash = crypto.createHash("sha256").update(publicKey).digest("hex");
  const did = `did:haid:${hash.slice(0, 32)}`; // shorten for readability

  // 3. Anchor DID on Hedera
  let hederaTx = null;
  if (process.env.HEDERA_TOPIC_ID) {
    hederaTx = await submitMessage(process.env.HEDERA_TOPIC_ID, {
      type: "did_created",
      userId,
      did,
      role,
      timestamp: Date.now(),
    });
  }

  return { did, publicKey, privateKey, hederaTx };
}

module.exports = { generateAnchoredDID };
