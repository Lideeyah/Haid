// scans.js - Wristband Scanning and HCS Integration for HAID
import { getDID, createDID } from "./wallets.js";
import { createEvent, checkDuplicateEvent, markEventLoggedToHCS } from "./event.js";
import crypto from "crypto";

// In-memory scan store
const scanStore = new Map(); // scanId -> scan details
const wristbandScanIndex = new Map(); // wristbandId -> [scanIds]

/**
 * Generate unique scan ID
 * @returns {string} - Scan ID
 */
function generateScanId() {
  return `scan_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

/**
 * Process a wristband scan
 * @param {object} scanData - Scan details
 * @returns {object} - Scan result with event and HCS info
 */
export async function processScan(scanData) {
  const {
    wristbandId,
    aidType,
    quantity,
    location,
    volunteerId,
    orgId,
    deviceId,
    notes,
    allowDuplicates = false
  } = scanData;

  // Validate required fields
  if (!wristbandId) {
    throw new Error("wristbandId is required");
  }
  if (!aidType) {
    throw new Error("aidType is required");
  }

  const scanId = generateScanId();
  const timestamp = new Date().toISOString();

  console.log(`📱 Processing scan: ${scanId} for wristband ${wristbandId}`);

  // 1. Get or create DID for wristband
  let didObj = getDID(wristbandId);
  if (!didObj) {
    console.log(`🆕 Creating new DID for wristband: ${wristbandId}`);
    didObj = createDID(wristbandId);
  }

  // 2. Check for duplicate distributions
  if (!allowDuplicates) {
    const isDuplicate = checkDuplicateEvent(didObj.did, aidType, 24);
    if (isDuplicate) {
      const scan = {
        scanId,
        wristbandId,
        did: didObj.did,
        aidType,
        timestamp,
        status: "rejected",
        reason: "duplicate_distribution_within_24h",
        deviceId,
        volunteerId
      };
      scanStore.set(scanId, scan);
      
      // Index by wristband
      if (!wristbandScanIndex.has(wristbandId)) {
        wristbandScanIndex.set(wristbandId, []);
      }
      wristbandScanIndex.get(wristbandId).push(scanId);
      
      console.log(`❌ Scan rejected: Duplicate distribution detected`);
      return {
        success: false,
        scan,
        message: "Duplicate distribution: This wristband already received this aid type within 24 hours"
      };
    }
  }

  // 3. Create aid distribution event
  const event = createEvent({
    wristbandId,
    did: didObj.did,
    aidType,
    quantity,
    location,
    volunteerId,
    orgId,
    notes
  });

  // 4. Prepare HCS message payload
  const hcsPayload = {
    type: "SCAN",
    scanId,
    eventId: event.eventId,
    did: didObj.did,
    wristbandId,
    aidType,
    quantity: quantity || 1,
    location: location || "Unknown",
    volunteerId: volunteerId || "system",
    orgId: orgId || "ngo_default",
    deviceId: deviceId || "unknown",
    metadataHash: event.metadataHash,
    timestamp,
    outcome: "SUCCESS"
  };

  // 5. Store scan record
  const scan = {
    scanId,
    wristbandId,
    did: didObj.did,
    eventId: event.eventId,
    aidType,
    quantity: quantity || 1,
    location,
    volunteerId,
    orgId,
    deviceId,
    timestamp,
    status: "success",
    hcsPayload,
    hcsStatus: "pending"
  };

  scanStore.set(scanId, scan);

  // Index by wristband
  if (!wristbandScanIndex.has(wristbandId)) {
    wristbandScanIndex.set(wristbandId, []);
  }
  wristbandScanIndex.get(wristbandId).push(scanId);

  // 6. Attempt to publish to HCS (simulate for hackathon)
  let hcsTxId = null;
  try {
    hcsTxId = await publishToHCS(hcsPayload);
    scan.hcsStatus = "logged";
    scan.hcsTxId = hcsTxId;
    
    // Update event with HCS transaction ID
    markEventLoggedToHCS(event.eventId, hcsTxId);
    
    console.log(`✅ Scan logged to HCS: ${hcsTxId}`);
  } catch (error) {
    console.error(`⚠️ HCS logging failed: ${error.message}`);
    scan.hcsStatus = "failed";
    scan.hcsError = error.message;
  }

  console.log(`✅ Scan processed successfully: ${scanId}`);

  return {
    success: true,
    scanId,
    eventId: event.eventId,
    did: didObj.did,
    wristbandId,
    aidType,
    quantity: quantity || 1,
    hcsStatus: scan.hcsStatus,
    hcsTxId,
    timestamp,
    scan
  };
}

/**
 * Publish message to Hedera Consensus Service
 * For hackathon: This can be a mock or real HCS call
 * @param {object} payload - Message payload
 * @returns {string} - HCS transaction ID
 */
async function publishToHCS(payload) {
  // Check if we have real HCS credentials
  const hasHCSConfig = process.env.OPERATOR_ID && process.env.OPERATOR_KEY && process.env.HAID_SCANS_TOPIC_ID;
  
  if (hasHCSConfig) {
    // Real HCS implementation (requires @hashgraph/sdk)
    try {
      const { Client, TopicMessageSubmitTransaction } = await import("@hashgraph/sdk");
      
      const client = Client.forTestnet();
      client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);
      
      const tx = await new TopicMessageSubmitTransaction({
        topicId: process.env.HAID_SCANS_TOPIC_ID,
        message: JSON.stringify(payload)
      }).execute(client);
      
      const receipt = await tx.getReceipt(client);
      const txId = receipt.transactionId?.toString() || `${tx.transactionId}`;
      
      console.log(`📡 Published to HCS: ${txId}`);
      return txId;
      
    } catch (error) {
      console.error(`❌ HCS publish failed: ${error.message}`);
      throw error;
    }
  } else {
    // Mock HCS for hackathon demo
    console.log(`🎭 Mock HCS publish (no credentials configured)`);
    const mockTxId = `0.0.${Math.floor(Math.random() * 100000)}@${Date.now()}.${Math.floor(Math.random() * 1000000)}`;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockTxId;
  }
}

/**
 * Get scan by ID
 * @param {string} scanId - Scan identifier
 * @returns {object|null} - Scan object or null
 */
export function getScan(scanId) {
  return scanStore.get(scanId) || null;
}

/**
 * Get all scans for a wristband
 * @param {string} wristbandId - Wristband identifier
 * @returns {Array} - Array of scans
 */
export function getScansByWristband(wristbandId) {
  const scanIds = wristbandScanIndex.get(wristbandId) || [];
  return scanIds.map(id => scanStore.get(id)).filter(Boolean);
}

/**
 * Get scan statistics
 * @returns {object} - Statistics
 */
export function getScanStats() {
  const allScans = Array.from(scanStore.values());

  const stats = {
    totalScans: allScans.length,
    successful: allScans.filter(s => s.status === "success").length,
    rejected: allScans.filter(s => s.status === "rejected").length,
    loggedToHCS: allScans.filter(s => s.hcsStatus === "logged").length,
    pendingHCS: allScans.filter(s => s.hcsStatus === "pending").length,
    failedHCS: allScans.filter(s => s.hcsStatus === "failed").length,
    byAidType: {},
    uniqueWristbands: new Set(allScans.map(s => s.wristbandId)).size
  };

  allScans.forEach(scan => {
    if (scan.aidType) {
      stats.byAidType[scan.aidType] = (stats.byAidType[scan.aidType] || 0) + 1;
    }
  });

  return stats;
}

/**
 * Get recent scans
 * @param {number} limit - Max number of scans
 * @returns {Array} - Recent scans
 */
export function getRecentScans(limit = 10) {
  const allScans = Array.from(scanStore.values());
  return allScans
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

/**
 * Search scans by filters
 * @param {object} filters - Search filters
 * @returns {Array} - Matching scans
 */
export function searchScans(filters = {}) {
  const allScans = Array.from(scanStore.values());

  return allScans.filter(scan => {
    if (filters.wristbandId && scan.wristbandId !== filters.wristbandId) return false;
    if (filters.aidType && scan.aidType !== filters.aidType) return false;
    if (filters.volunteerId && scan.volunteerId !== filters.volunteerId) return false;
    if (filters.orgId && scan.orgId !== filters.orgId) return false;
    if (filters.status && scan.status !== filters.status) return false;
    if (filters.hcsStatus && scan.hcsStatus !== filters.hcsStatus) return false;
    
    // Date range filter
    if (filters.startDate) {
      const scanDate = new Date(scan.timestamp);
      const startDate = new Date(filters.startDate);
      if (scanDate < startDate) return false;
    }
    if (filters.endDate) {
      const scanDate = new Date(scan.timestamp);
      const endDate = new Date(filters.endDate);
      if (scanDate > endDate) return false;
    }

    return true;
  });
}

/**
 * Retry failed HCS publications
 * @returns {object} - Retry results
 */
export async function retryFailedHCS() {
  const failedScans = Array.from(scanStore.values()).filter(s => s.hcsStatus === "failed");
  
  console.log(`🔄 Retrying ${failedScans.length} failed HCS publications...`);
  
  const results = {
    attempted: failedScans.length,
    succeeded: 0,
    failed: 0
  };

  for (const scan of failedScans) {
    try {
      const hcsTxId = await publishToHCS(scan.hcsPayload);
      scan.hcsStatus = "logged";
      scan.hcsTxId = hcsTxId;
      scan.hcsError = null;
      
      // Update event
      markEventLoggedToHCS(scan.eventId, hcsTxId);
      
      results.succeeded++;
      console.log(`✅ Retry successful for scan ${scan.scanId}`);
    } catch (error) {
      results.failed++;
      console.error(`❌ Retry failed for scan ${scan.scanId}: ${error.message}`);
    }
  }

  return results;
}

/**
 * Get all scans (for export/debugging)
 * @returns {Array} - All scans
 */
export function getAllScans() {
  return Array.from(scanStore.values());
}

/**
 * Clear all scan data (testing only)
 */
export function clearAllScans() {
  scanStore.clear();
  wristbandScanIndex.clear();
  console.log("🗑️ All scan data cleared");
}

// --- Demo/Test Runner (if run directly) ---
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("\n=== HAID Scan Processing Demo ===\n");

  async function runDemo() {
    // 1. Process a successful scan
    console.log("1️⃣ Processing food distribution scan...");
    const scan1 = await processScan({
      wristbandId: "WB-123456",
      aidType: "FOOD",
      quantity: 2,
      location: "Camp Alpha - Distribution Point 1",
      volunteerId: "volunteer_001",
      orgId: "ngo_alpha",
      deviceId: "scanner_001",
      notes: "Family of 4"
    });
    console.log("   Scan ID:", scan1.scanId);
    console.log("   Event ID:", scan1.eventId);
    console.log("   HCS TX:", scan1.hcsTxId);

    // 2. Try duplicate scan (should be rejected)
    console.log("\n2️⃣ Attempting duplicate scan (should reject)...");
    try {
      const scan2 = await processScan({
        wristbandId: "WB-123456",
        aidType: "FOOD",
        quantity: 1,
        location: "Camp Alpha",
        volunteerId: "volunteer_002",
        orgId: "ngo_alpha"
      });
      console.log("   Status:", scan2.success ? "SUCCESS" : "REJECTED");
      console.log("   Message:", scan2.message);
    } catch (error) {
      console.log("   Error:", error.message);
    }

    // 3. Process different aid type (should succeed)
    console.log("\n3️⃣ Processing water distribution (different aid type)...");
    const scan3 = await processScan({
      wristbandId: "WB-123456",
      aidType: "WATER",
      quantity: 5,
      location: "Camp Alpha",
      volunteerId: "volunteer_001",
      orgId: "ngo_alpha"
    });
    console.log("   Scan ID:", scan3.scanId);
    console.log("   Success:", scan3.success);

    // 4. Get scan statistics
    console.log("\n4️⃣ Scan statistics:");
    const stats = getScanStats();
    console.log("   Total scans:", stats.totalScans);
    console.log("   Successful:", stats.successful);
    console.log("   Rejected:", stats.rejected);
    console.log("   Logged to HCS:", stats.loggedToHCS);
    console.log("   By aid type:", stats.byAidType);

    // 5. Get scans by wristband
    console.log("\n5️⃣ Scans for wristband WB-123456:");
    const wristbandScans = getScansByWristband("WB-123456");
    wristbandScans.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.scanId} - ${s.aidType} - ${s.status}`);
    });

    // 6. Recent scans
    console.log("\n6️⃣ Recent scans:");
    const recent = getRecentScans(5);
    recent.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.scanId} - ${s.aidType} - ${s.timestamp}`);
    });

    console.log("\n=== Demo Complete ===\n");
  }

  runDemo().catch(err => {
    console.error("Demo failed:", err);
    process.exit(1);
  });
}