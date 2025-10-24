// src/hts/htsWorkflow.js
import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenMintTransaction,
  TransferTransaction,
  TokenBurnTransaction,
  TokenType,
  TokenSupplyType,
  AccountId
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

// Load operator credentials
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

// Connect to Hedera testnet
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function htsWorkflow() {
  try {
    // 1️⃣ Create token (HAID-FOOD voucher)
    console.log("🚀 Creating token...");
    const createTx = await new TokenCreateTransaction()
      .setTokenName("HAID Food Voucher")
      .setTokenSymbol("HAID-FOOD")
      .setTokenType(TokenType.FungibleCommon) // fungible = many identical units
      .setDecimals(0)                         // 1 token = 1 meal, no fractions
      .setInitialSupply(0)                    // start at 0
      .setTreasuryAccountId(operatorId)       // operator is treasury
      .setSupplyType(TokenSupplyType.Finite)  // limited supply
      .setMaxSupply(1000000)                  // max 1,000,000 vouchers
      .setAdminKey(operatorKey)               // optional admin control
      .setSupplyKey(operatorKey)              // supply key needed to mint/burn
      .freezeWith(client)
      .sign(operatorKey);

    const createResponse = await createTx.execute(client);
    const createReceipt = await createResponse.getReceipt(client);
    const tokenId = createReceipt.tokenId.toString();
    console.log(`✅ Token created: ${tokenId}`);

    // 2️⃣ Mint tokens
    console.log("🚀 Minting 100 vouchers...");
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setAmount(100) // mint 100 units
      .freezeWith(client)
      .sign(operatorKey);

    const mintResponse = await mintTx.execute(client);
    await mintResponse.getReceipt(client);
    console.log("✅ Minted 100 vouchers");

    // 3️⃣ Transfer token (to yourself for demo)
    console.log("🚀 Transferring 1 voucher...");
    const transferTx = await new TransferTransaction()
      .addTokenTransfer(tokenId, operatorId, -1) // subtract from treasury
      .addTokenTransfer(tokenId, operatorId, 1)  // add to same account (demo)
      .freezeWith(client)
      .sign(operatorKey);

    const transferResponse = await transferTx.execute(client);
    await transferResponse.getReceipt(client);
    console.log("✅ Transferred 1 voucher (demo)");

    // 4️⃣ Burn token
    console.log("🚀 Burning 1 voucher...");
    const burnTx = await new TokenBurnTransaction()
      .setTokenId(tokenId)
      .setAmount(1) // burn 1 unit
      .freezeWith(client)
      .sign(operatorKey);

    const burnResponse = await burnTx.execute(client);
    await burnResponse.getReceipt(client);
    console.log("✅ Burned 1 voucher");

    console.log("🎉 HTS workflow complete!");
  } catch (err) {
    console.error("❌ Error in workflow:", err);
  }
}

htsWorkflow();
