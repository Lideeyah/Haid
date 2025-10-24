/**
 * HAID Guardian Indexer Integration (Single File, ESM)
 * Uses existing Hedera topic from .env
 * Retry-safe subscription, graceful error handling
 * Run: node haid_indexer.js
 * Dependencies: npm install @hashgraph/sdk axios sqlite3 dotenv
 */

import 'dotenv/config'; // Load .env first
import { Client, TopicMessageSubmitTransaction, TopicMessageQuery } from "@hashgraph/sdk";
import axios from "axios";
import sqlite3 from "sqlite3";

// ---------------- SAFETY CHECKS ----------------
if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY || !process.env.HAID_SCANS_TOPIC_ID) {
  console.error("❌ ERROR: Missing OPERATOR_ID, OPERATOR_KEY, or HAID_SCANS_TOPIC_ID in .env");
  process.exit(1);
}

console.log("✅ Loaded Hedera credentials and topic from .env");

// ---------------- CONFIG ----------------
const OPERATOR_ID = process.env.OPERATOR_ID;
const OPERATOR_KEY = process.env.OPERATOR_KEY;
const TOPIC_ID = process.env.HAID_SCANS_TOPIC_ID;
const NETWORK = "testnet"; // testnet or mainnet
const GUARDIAN_INDEXER_URL = "https://guardian-indexer-testnet/api/messages"; // optional mock

// ---------------- CLIENT ----------------
const client = Client.forName(NETWORK);
client.setOperator(OPERATOR_ID, OPERATOR_KEY);

// ---------------- DB (Read-Optimized) ----------------
const db = new sqlite3.Database(":memory:");
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      did TEXT,
      eventId TEXT,
      outcome TEXT,
      metadataHash TEXT,
      enrichedDetails TEXT,
      txId TEXT,
      timestamp TEXT
  )`);
  console.log("✅ In-memory DB initialized");
});

// ---------------- SUBSCRIBE TO TOPIC (Retry-Safe) ----------------
function subscribeToTopic(maxRetries = 5, delayMs = 1000) {
  let attempt = 0;

  const trySubscribe = () => {
    console.log(`👂 Attempting subscription to topic ${TOPIC_ID}, attempt ${attempt + 1}`);

    try {
      new TopicMessageQuery()
        .setTopicId(TOPIC_ID)
        .subscribe(client, null, async (msg) => {
          try {
            const payload = JSON.parse(Buffer.from(msg.contents, "utf8").toString());
            console.log("📩 New HCS Message:", payload);

            const enriched = {
              ...payload,
              enrichedDetails: { scannedBy: "NGO Worker 1", location: "Market Hall" },
            };

            db.run(
              `INSERT INTO scans(did, eventId, outcome, metadataHash, enrichedDetails, txId, timestamp)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                enriched.did,
                enriched.eventId,
                enriched.outcome,
                enriched.metadataHash,
                JSON.stringify(enriched.enrichedDetails),
                msg.consensusTimestamp.toString(),
                new Date().toISOString(),
              ],
              (err) => {
                if (err) console.error("DB insert error:", err);
                else console.log("✅ Enriched message saved to DB");
              }
            );
          } catch (err) {
            console.error("❌ Failed to process message:", err.message);
          }
        });

      console.log("✅ Subscription successful");
    } catch (err) {
      console.error(`Error subscribing during attempt ${attempt}:`, err.message);
      attempt++;
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${delayMs} ms...`);
        setTimeout(trySubscribe, delayMs * attempt); // exponential backoff
      } else {
        console.error("❌ Max retries reached. Subscription failed.");
      }
    }
  };

  trySubscribe();
}

// ---------------- PUBLISH MESSAGE (Retry until txId valid) ----------------
async function publishMessage(payload, maxRetries = 5, initialDelay = 500) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const tx = await new TopicMessageSubmitTransaction({
        topicId: TOPIC_ID,
        message: JSON.stringify(payload),
      }).execute(client);

      const receipt = await tx.getReceipt(client);
      const txId = receipt?.transactionId?.toString();

      if (!txId) throw new Error("txId undefined");

      console.log("✅ Published HCS Message:", txId);
      return txId;
    } catch (err) {
      attempt++;
      const delay = initialDelay * Math.pow(2, attempt); // exponential backoff
      console.warn(`⚠️ Publish attempt ${attempt} failed: ${err.message}. Retrying in ${delay} ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.error("❌ Max retries reached. Failed to publish HCS message.");
  return null;
}


// ---------------- MOCK GUARDIAN INDEXER FETCH ----------------
async function fetchGuardianIndexer() {
  try {
    const res = await axios.get(GUARDIAN_INDEXER_URL);
    console.log("📡 Guardian Indexer messages:", res.data);
  } catch (err) {
    console.error("⚠️ Guardian Indexer fetch failed (using mock)");
  }
}

// ---------------- DEMO FLOW ----------------
async function runDemo() {
  // Start subscription (retry-safe)
  subscribeToTopic();

  // Wait a few seconds to ensure subscription is ready
  await new Promise((r) => setTimeout(r, 3000));

  // Publish a sample scan event
  const payload = {
    type: "scan",
    did: "did:hedera:abc123",
    eventId: "evt_2025_09_23_morning",
    wristbandId: "WB-000001",
    orgId: "ngo_alpha",
    metadataHash: "sha256:mockhash123",
    outcome: "SUCCESS",
    tokenId: "0.0.9999",
    timestamp: new Date().toISOString(),
  };

  await publishMessage(payload);

  // Optionally fetch from Guardian Indexer (mock)
  await fetchGuardianIndexer();
}

// ---------------- START ----------------
runDemo().catch((err) => console.error("❌ Demo failed:", err));
