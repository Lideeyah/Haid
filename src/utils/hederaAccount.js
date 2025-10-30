const { AccountBalanceQuery } = require("@hashgraph/sdk");

/**
 * Get the HBAR balance for a Hedera account
 * @param {string} accountId
 * @returns {Promise<number>} balance in HBAR
 */
async function getHbarBalance(accountId) {
  const balance = await new AccountBalanceQuery()
    .setAccountId(accountId)
    .execute(client);
  // Convert tinybars to HBAR (1 HBAR = 100,000,000 tinybars)
  return balance.hbars.toTinybars().toNumber() / 100_000_000;
}
// src/utils/hederaAccount.js
const { Client, PrivateKey, AccountCreateTransaction, Hbar } = require("@hashgraph/sdk");
require("dotenv").config();

const operatorId = process.env.OPERATOR_ID;
// const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

/**
 * Create a new Hedera account with a specified initial balance
 * @param {number|string} initialBalance - Amount of HBAR to fund the new account
 * @returns {Promise<{accountId: string, privateKey: string, publicKey: string}>}
 */
async function createHederaAccount(initialBalance = 1) {
  const newKey = PrivateKey.generateED25519();
  const response = await new AccountCreateTransaction()
    .setKey(newKey.publicKey)
    .setInitialBalance(new Hbar(Number(initialBalance)))
    .execute(client);
  const receipt = await response.getReceipt(client);
  const newAccountId = receipt.accountId.toString();
  return {
    accountId: newAccountId,
    privateKey: newKey.toStringRaw(),
    publicKey: newKey.publicKey.toStringRaw()
  };
}


const { TransferTransaction } = require("@hashgraph/sdk");

/**
 * Transfer HBAR from one account to another
 * @param {Object} params
 * @param {string} params.senderAccountId
 * @param {string} params.senderPrivateKey
 * @param {string} params.recipientAccountId
 * @param {number|string} params.amount (in HBAR)
 * @returns {Promise<{transactionId: string, status: string}>}
 */
async function transferHbar({ senderAccountId, senderPrivateKey, recipientAccountId, amount }) {
  const senderKey = PrivateKey.fromString(senderPrivateKey);
  const tx = await new TransferTransaction()
    .addHbarTransfer(senderAccountId, -Number(amount))
    .addHbarTransfer(recipientAccountId, Number(amount))
    .freezeWith(client)
    .sign(senderKey);
  const submitTx = await tx.execute(client);
  const receipt = await submitTx.getReceipt(client);
  return {
    transactionId: submitTx.transactionId.toString(),
    status: receipt.status.toString(),
  };
}

module.exports = { createHederaAccount, transferHbar, getHbarBalance };
