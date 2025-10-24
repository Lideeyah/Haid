// acceptanceTests.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);

require("dotenv").config();

const {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
} = require("@hashgraph/sdk");

// Operator setup
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

console.log(" Operator loaded:", operatorId.toString());

// Topic IDs from .env
const eventsTopicId = process.env.HAID_EVENTS_TOPIC_ID;
const scansTopicId = process.env.HAID_SCANS_TOPIC_ID;

// ------------------- Utilities -------------------

async function createTopic(name) {
  const tx = await new TopicCreateTransaction().setTopicMemo(name).execute(client);
  const receipt = await tx.getReceipt(client);
  console.log(`Topic created [${name}] -> ${receipt.topicId.toString()}`);
  return receipt.topicId;
}

async function sendMessage(topicId, message) {
  const tx = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(JSON.stringify(message))
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log(`Message sent to ${topicId} with status ${receipt.status.toString()}`);
}

// Check if DID already exists (simple demo by scanning topic)
async function checkDuplicateDID(did, topicId) {
  return new Promise((resolve, reject) => {
    let found = false;
    new TopicMessageQuery()
      .setTopicId(topicId)
      .setStartTime(0) // from beginning
      .subscribe(client, null, (msg) => {
        const data = Buffer.from(msg.contents, "utf8").toString();
        try {
          const parsed = JSON.parse(data);
          if (parsed.did === did) {
            found = true;
          }
        } catch {}
      });

    // Allow some time to stream old messages
    setTimeout(() => resolve(found), 3000);
  });
}

// ------------------- Workflows -------------------

async function registerDID(did, topicId) {
  const exists = await checkDuplicateDID(did, topicId);
  if (exists) {
    console.log(`DID already registered: ${did}`);
    return;
  }
  await sendMessage(topicId, { type: "DID_REGISTRATION", did, timestamp: Date.now() });
  console.log(`DID registered: ${did}`);
}

async function logEvent(eventType, data, topicId) {
  await sendMessage(topicId, { type: eventType, data, timestamp: Date.now() });
  console.log(`Event logged: ${eventType}`);
}

async function issueVoucher(voucherId, recipient, topicId) {
  await sendMessage(topicId, { type: "VOUCHER", voucherId, recipient, timestamp: Date.now() });
  console.log(` Voucher issued: ${voucherId} -> ${recipient}`);
}

// ------------------- Acceptance Tests -------------------

export async function runAcceptanceTests() {
  console.log(" Starting acceptance tests...");

  // Test DID registration
  await registerDID("did:hedera:test:1234", eventsTopicId);

  // Test duplicate check
  await registerDID("did:hedera:test:1234", eventsTopicId);

  // Log scan event
  await logEvent("SCAN", { deviceId: "scanner-001", location: "Lagos" }, scansTopicId);

  // Issue voucher
  await issueVoucher("voucher-2025-001", "did:hedera:test:5678", eventsTopicId);

  console.log(" All acceptance tests finished.");
}

// Run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAcceptanceTests().catch((err) => {
    console.error(" Error in acceptance tests:", err);
    process.exit(1);
  });
}
