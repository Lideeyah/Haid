// wallets.js - DID and Wallet Management for HAID
import crypto from "crypto";

// In-memory stores (replace with DB in production)
const didStore = new Map();       // wristbandId -> DID
const walletStore = new Map();    // walletId -> wallet details
const balances = new Map();       // walletId -> token balances
const vcStore = new Map();        // did -> issued VCs

// --- Utility Functions ---
function generateKeypair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  return {
    publicKey: publicKey.export({ type: "spki", format: "pem" }),
    privateKey: privateKey.export({ type: "pkcs8", format: "pem" })
  };
}

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// --- DID Functions ---

/**
 * Create a DID for a refugee wristband
 * @param {string} wristbandId - Unique wristband identifier (e.g., "WB-000001")
 * @returns {object} - DID object with keys and wristband mapping
 */
export function createDID(wristbandId) {
  // Check if DID already exists for this wristband
  if (didStore.has(wristbandId)) {
    console.log(`⚠️ DID already exists for wristband: ${wristbandId}`);
    return didStore.get(wristbandId);
  }

  const { publicKey, privateKey } = generateKeypair();
  const did = `did:hedera:testnet:${sha256(publicKey).slice(0, 16)}`;
  
  const didObject = {
    did,
    wristbandId,
    publicKey,
    privateKey,
    createdAt: new Date().toISOString(),
    status: "active"
  };
  
  didStore.set(wristbandId, didObject);
  console.log(`✅ DID created: ${did} for wristband ${wristbandId}`);
  
  return didObject;
}

/**
 * Get DID by wristband ID
 * @param {string} wristbandId - Wristband identifier
 * @returns {object|null} - DID object or null if not found
 */
export function getDID(wristbandId) {
  return didStore.get(wristbandId) || null;
}

/**
 * Get DID by did string
 * @param {string} did - DID string
 * @returns {object|null} - DID object or null if not found
 */
export function getDIDByString(did) {
  for (const [wristbandId, didObj] of didStore.entries()) {
    if (didObj.did === did) {
      return didObj;
    }
  }
  return null;
}

/**
 * List all DIDs
 * @returns {Array} - Array of all DID objects
 */
export function listAllDIDs() {
  return Array.from(didStore.values());
}

/**
 * Deactivate a DID (for lost/stolen wristbands)
 * @param {string} wristbandId - Wristband identifier
 * @returns {boolean} - Success status
 */
export function deactivateDID(wristbandId) {
  const didObj = didStore.get(wristbandId);
  if (didObj) {
    didObj.status = "deactivated";
    didObj.deactivatedAt = new Date().toISOString();
    console.log(`🔒 DID deactivated: ${didObj.did}`);
    return true;
  }
  return false;
}

// --- Wallet Functions ---

/**
 * Create a wallet for NGO, Volunteer, or Beneficiary
 * @param {string} role - Role type: "NGO", "Volunteer", "Beneficiary", "Auditor"
 * @param {object} ownerMeta - Metadata about the owner (e.g., {org: "ngo_alpha"})
 * @returns {object} - Wallet object with address and keys
 */
export function createWallet(role, ownerMeta = {}) {
  const walletId = `wallet_${crypto.randomBytes(6).toString("hex")}`;
  const { publicKey, privateKey } = generateKeypair();
  
  const wallet = {
    walletId,
    role,
    ownerMeta,
    address: sha256(publicKey).slice(0, 32),
    publicKey,
    privateKey,
    createdAt: new Date().toISOString(),
    status: "active"
  };
  
  walletStore.set(walletId, wallet);
  balances.set(walletId, {}); // Initialize empty balance
  
  console.log(`✅ Wallet created: ${walletId} for role ${role}`);
  return wallet;
}

/**
 * Get wallet by ID
 * @param {string} walletId - Wallet identifier
 * @returns {object|null} - Wallet object or null
 */
export function getWallet(walletId) {
  return walletStore.get(walletId) || null;
}

/**
 * Get balance for a wallet
 * @param {string} walletId - Wallet identifier
 * @returns {object} - Token balances (e.g., {"HAID-FOOD": 10})
 */
export function getBalance(walletId) {
  return balances.get(walletId) || {};
}

/**
 * Transfer tokens between wallets (for voucher distribution)
 * @param {string} fromWalletId - Source wallet
 * @param {string} toWalletId - Destination wallet
 * @param {string} tokenSymbol - Token type (e.g., "HAID-FOOD")
 * @param {number} amount - Amount to transfer
 * @returns {object} - Transaction details
 */
export function transferToken(fromWalletId, toWalletId, tokenSymbol, amount) {
  if (!balances.has(fromWalletId) || !balances.has(toWalletId)) {
    throw new Error("Invalid wallet IDs");
  }
  
  const fromBal = balances.get(fromWalletId);
  const toBal = balances.get(toWalletId);
  
  if ((fromBal[tokenSymbol] || 0) < amount) {
    throw new Error(`Insufficient balance: ${tokenSymbol}`);
  }
  
  fromBal[tokenSymbol] -= amount;
  toBal[tokenSymbol] = (toBal[tokenSymbol] || 0) + amount;
  
  const txId = sha256(`${Date.now()}-${fromWalletId}-${toWalletId}`);
  
  console.log(`💸 Transfer: ${amount} ${tokenSymbol} from ${fromWalletId} to ${toWalletId}`);
  
  return {
    txId,
    from: fromWalletId,
    to: toWalletId,
    tokenSymbol,
    amount,
    timestamp: new Date().toISOString(),
    status: "completed"
  };
}

/**
 * Mint tokens to a wallet (NGO creates vouchers)
 * @param {string} walletId - Wallet to receive tokens
 * @param {string} tokenSymbol - Token type
 * @param {number} amount - Amount to mint
 * @returns {object} - Mint transaction details
 */
export function mintToken(walletId, tokenSymbol, amount) {
  if (!balances.has(walletId)) {
    throw new Error("Invalid wallet ID");
  }
  
  const walletBal = balances.get(walletId);
  walletBal[tokenSymbol] = (walletBal[tokenSymbol] || 0) + amount;
  
  console.log(`🪙 Minted ${amount} ${tokenSymbol} to wallet ${walletId}`);
  
  return {
    walletId,
    tokenSymbol,
    amount,
    timestamp: new Date().toISOString()
  };
}

// --- Verifiable Credential Functions (Guardian Integration Simulation) ---

/**
 * Issue a Verifiable Credential (VC) for a DID
 * Simulates Guardian VC issuance for hackathon
 * @param {string} did - DID to issue VC to
 * @param {string} credentialType - Type (e.g., "RefugeeWristbandCredential")
 * @param {object} claims - Claims to include in VC
 * @returns {object} - Verifiable Credential
 */
export function issueVerifiableCredential(did, credentialType, claims) {
  const vcId = `vc_${crypto.randomBytes(8).toString("hex")}`;
  
  const vc = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://guardian.hedera.com/vc/v1"
    ],
    id: `https://haid.org/credentials/${vcId}`,
    type: ["VerifiableCredential", credentialType],
    issuer: {
      id: "did:hedera:testnet:ngo_alpha",
      name: "HAID NGO Alpha"
    },
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: did,
      ...claims
    },
    proof: {
      type: "Ed25519Signature2020",
      created: new Date().toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod: `did:hedera:testnet:ngo_alpha#key-1`,
      proofValue: sha256(JSON.stringify({ did, claims, timestamp: Date.now() }))
    }
  };
  
  // Store VC
  if (!vcStore.has(did)) {
    vcStore.set(did, []);
  }
  vcStore.get(did).push(vc);
  
  console.log(`✅ VC Issued: ${vcId} (${credentialType}) for ${did}`);
  return vc;
}

/**
 * Get all VCs for a DID
 * @param {string} did - DID to query
 * @returns {Array} - Array of VCs
 */
export function getVerifiableCredentials(did) {
  return vcStore.get(did) || [];
}

/**
 * Verify a VC's proof (simplified for hackathon)
 * @param {object} vc - Verifiable Credential
 * @returns {boolean} - Verification status
 */
export function verifyVC(vc) {
  // Simplified verification: check structure and proof exists
  const hasRequiredFields = vc.id && vc.issuer && vc.credentialSubject && vc.proof;
  const hasValidProof = vc.proof.proofValue && vc.proof.proofValue.length === 64;
  
  return hasRequiredFields && hasValidProof;
}

// --- Export all stores for debugging/inspection ---
export function getAllStores() {
  return {
    dids: Array.from(didStore.entries()),
    wallets: Array.from(walletStore.entries()),
    balances: Array.from(balances.entries()),
    vcs: Array.from(vcStore.entries())
  };
}

// --- Demo/Test Runner (if run directly) ---
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("\n=== HAID Wallet & DID Demo ===\n");
  
  // 1. Create DID for refugee wristband
  console.log("1️⃣ Creating DID for refugee wristband...");
  const didObj = createDID("WB-123456");
  console.log("   DID:", didObj.did);
  console.log("   Wristband:", didObj.wristbandId);
  
  // 2. Issue VC for the DID
  console.log("\n2️⃣ Issuing Verifiable Credential...");
  const vc = issueVerifiableCredential(
    didObj.did,
    "RefugeeWristbandCredential",
    {
      wristbandId: "WB-123456",
      fullName: "John Doe",
      registrationDate: "2025-10-24",
      camp: "Camp Alpha",
      registeredBy: "NGO Alpha"
    }
  );
  console.log("   VC ID:", vc.id);
  console.log("   VC Valid:", verifyVC(vc));
  
  // 3. Create wallets
  console.log("\n3️⃣ Creating wallets...");
  const ngoWallet = createWallet("NGO", { org: "ngo_alpha", name: "Alpha Relief Org" });
  const beneficiaryWallet = createWallet("Beneficiary", { did: didObj.did });
  console.log("   NGO Wallet:", ngoWallet.walletId);
  console.log("   Beneficiary Wallet:", beneficiaryWallet.walletId);
  
  // 4. Mint vouchers to NGO
  console.log("\n4️⃣ Minting aid vouchers to NGO...");
  mintToken(ngoWallet.walletId, "HAID-FOOD", 100);
  mintToken(ngoWallet.walletId, "HAID-WATER", 50);
  mintToken(ngoWallet.walletId, "HAID-MEDICAL", 25);
  console.log("   NGO Balance:", getBalance(ngoWallet.walletId));
  
  // 5. Transfer voucher to beneficiary
  console.log("\n5️⃣ Distributing aid to beneficiary...");
  const tx = transferToken(ngoWallet.walletId, beneficiaryWallet.walletId, "HAID-FOOD", 3);
  console.log("   Transfer TX:", tx.txId);
  console.log("   Amount:", tx.amount, tx.tokenSymbol);
  
  // 6. Check final balances
  console.log("\n6️⃣ Final balances:");
  console.log("   NGO:", getBalance(ngoWallet.walletId));
  console.log("   Beneficiary:", getBalance(beneficiaryWallet.walletId));
  
  // 7. List all DIDs
  console.log("\n7️⃣ All registered DIDs:");
  console.log("   Count:", listAllDIDs().length);
  
  console.log("\n=== Demo Complete ===\n");
}