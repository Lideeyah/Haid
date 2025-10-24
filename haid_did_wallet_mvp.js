import crypto from "crypto";

// In-memory stores (replace with DB in real implementation)
const didStore = new Map();       // wristbandId -> DID
const walletStore = new Map();    // walletId -> wallet details
const balances = new Map();       // walletId -> token balances

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
export function createDID(wristbandId) {
  const { publicKey, privateKey } = generateKeypair();
  const did = `did:haid:${sha256(publicKey).slice(0, 16)}`;

  didStore.set(wristbandId, { did, publicKey, privateKey });

  return { did, publicKey, privateKey, wristbandId };
}

export function getDID(wristbandId) {
  return didStore.get(wristbandId);
}

// --- Wallet Functions ---
export function createWallet(role, ownerMeta = {}) {
  const walletId = `wallet_${crypto.randomBytes(6).toString("hex")}`;
  const { publicKey, privateKey } = generateKeypair();

  const wallet = {
    walletId,
    role,
    ownerMeta,
    address: sha256(publicKey).slice(0, 32),
    publicKey,
    privateKey
  };

  walletStore.set(walletId, wallet);
  balances.set(walletId, {}); // initialize empty balance

  return wallet;
}

export function getBalance(walletId) {
  return balances.get(walletId) || {};
}

export function transferToken(fromWalletId, toWalletId, tokenSymbol, amount) {
  if (!balances.has(fromWalletId) || !balances.has(toWalletId)) {
    throw new Error("Invalid wallet IDs");
  }

  const fromBal = balances.get(fromWalletId);
  const toBal = balances.get(toWalletId);

  if ((fromBal[tokenSymbol] || 0) < amount) {
    throw new Error("Insufficient balance");
  }

  fromBal[tokenSymbol] -= amount;
  toBal[tokenSymbol] = (toBal[tokenSymbol] || 0) + amount;

  return {
    txId: sha256(`${Date.now()}-${fromWalletId}-${toWalletId}`),
    from: fromWalletId,
    to: toWalletId,
    tokenSymbol,
    amount,
    timestamp: new Date().toISOString()
  };
}

export function mintToken(walletId, tokenSymbol, amount) {
  if (!balances.has(walletId)) throw new Error("Invalid wallet ID");
  const walletBal = balances.get(walletId);
  walletBal[tokenSymbol] = (walletBal[tokenSymbol] || 0) + amount;
  return { walletId, tokenSymbol, amount };
}

// --- Example Usage (if run directly) ---
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("=== Demo Start ===");

  // 1. Create DID for wristband
  const didObj = createDID("WB-123456");
  console.log("DID created:", didObj);

  // 2. Create NGO and beneficiary wallets
  const ngoWallet = createWallet("NGO", { org: "ngo_alpha" });
  const beneficiaryWallet = createWallet("Recipient", { did: didObj.did });

  console.log("NGO wallet:", ngoWallet);
  console.log("Beneficiary wallet:", beneficiaryWallet);

  // 3. Mint tokens (vouchers) to NGO wallet
  mintToken(ngoWallet.walletId, "HAID-FOOD", 10);
  console.log("NGO balance:", getBalance(ngoWallet.walletId));

  // 4. Transfer voucher to beneficiary
  const tx = transferToken(ngoWallet.walletId, beneficiaryWallet.walletId, "HAID-FOOD", 1);
  console.log("Transfer tx:", tx);

  // 5. Check balances
  console.log("NGO balance after:", getBalance(ngoWallet.walletId));
  console.log("Beneficiary balance:", getBalance(beneficiaryWallet.walletId));

  console.log("=== Demo End ===");
}
