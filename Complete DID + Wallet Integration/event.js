// event.js - Aid Distribution Event Management for HAID
import crypto from "crypto";
import { getDID, getDIDByString } from "./wallets.js";

// In-memory event store (replace with DB in production)
const eventStore = new Map();  // eventId -> event details
const didEventIndex = new Map(); // did -> [eventIds]

/**
 * Generate unique event ID
 * @returns {string} - Event ID
 */
function generateEventId() {
  return `evt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

/**
 * Create a new aid distribution event
 * @param {object} eventData - Event details
 * @returns {object} - Created event
 */
export function createEvent(eventData) {
  const {
    wristbandId,
    did,
    aidType,
    quantity,
    location,
    volunteerId,
    orgId,
    notes
  } = eventData;

  // Validate required fields
  if (!wristbandId && !did) {
    throw new Error("Either wristbandId or did is required");
  }
  if (!aidType) {
    throw new Error("aidType is required");
  }

  // Get or validate DID
  let beneficiaryDID = did;
  if (wristbandId && !did) {
    const didObj = getDID(wristbandId);
    if (!didObj) {
      throw new Error(`No DID found for wristband: ${wristbandId}`);
    }
    beneficiaryDID = didObj.did;
  }

  const eventId = generateEventId();
  const timestamp = new Date().toISOString();

  const event = {
    eventId,
    type: "AID_DISTRIBUTION",
    beneficiaryDID,
    wristbandId,
    aidType,
    quantity: quantity || 1,
    location: location || "Unknown",
    volunteerId: volunteerId || "system",
    orgId: orgId || "ngo_default",
    notes: notes || "",
    timestamp,
    status: "pending",
    verified: false,
    metadataHash: crypto
      .createHash("sha256")
      .update(JSON.stringify({ beneficiaryDID, aidType, timestamp }))
      .digest("hex"),
    hcsStatus: "not_logged"
  };

  // Store event
  eventStore.set(eventId, event);

  // Index by DID
  if (!didEventIndex.has(beneficiaryDID)) {
    didEventIndex.set(beneficiaryDID, []);
  }
  didEventIndex.get(beneficiaryDID).push(eventId);

  console.log(`✅ Event created: ${eventId} for DID ${beneficiaryDID}`);
  return event;
}

/**
 * Get event by ID
 * @param {string} eventId - Event identifier
 * @returns {object|null} - Event object or null
 */
export function getEvent(eventId) {
  return eventStore.get(eventId) || null;
}

/**
 * Get all events for a DID
 * @param {string} did - DID to query
 * @returns {Array} - Array of events
 */
export function getEventsByDID(did) {
  const eventIds = didEventIndex.get(did) || [];
  return eventIds.map(id => eventStore.get(id)).filter(Boolean);
}

/**
 * Update event status (e.g., after HCS logging)
 * @param {string} eventId - Event identifier
 * @param {object} updates - Fields to update
 * @returns {object|null} - Updated event
 */
export function updateEvent(eventId, updates) {
  const event = eventStore.get(eventId);
  if (!event) {
    console.error(`Event not found: ${eventId}`);
    return null;
  }

  Object.assign(event, updates);
  event.updatedAt = new Date().toISOString();

  console.log(`✅ Event updated: ${eventId}`);
  return event;
}

/**
 * Mark event as logged to HCS
 * @param {string} eventId - Event identifier
 * @param {string} txId - HCS transaction ID
 * @returns {object|null} - Updated event
 */
export function markEventLoggedToHCS(eventId, txId) {
  return updateEvent(eventId, {
    hcsStatus: "logged",
    hcsTxId: txId,
    loggedAt: new Date().toISOString()
  });
}

/**
 * Verify an event (beneficiary confirmation)
 * @param {string} eventId - Event identifier
 * @param {string} signature - Verification signature (optional)
 * @returns {object|null} - Updated event
 */
export function verifyEvent(eventId, signature = null) {
  return updateEvent(eventId, {
    verified: true,
    verifiedAt: new Date().toISOString(),
    verificationSignature: signature,
    status: "completed"
  });
}

/**
 * Check for duplicate events (same DID + aidType within time window)
 * @param {string} did - DID to check
 * @param {string} aidType - Aid type
 * @param {number} windowHours - Time window in hours (default 24)
 * @returns {boolean} - True if duplicate found
 */
export function checkDuplicateEvent(did, aidType, windowHours = 24) {
  const events = getEventsByDID(did);
  const now = Date.now();
  const windowMs = windowHours * 60 * 60 * 1000;

  const duplicate = events.some(event => {
    const eventTime = new Date(event.timestamp).getTime();
    const isSameAidType = event.aidType === aidType;
    const isWithinWindow = (now - eventTime) < windowMs;
    return isSameAidType && isWithinWindow;
  });

  if (duplicate) {
    console.log(`⚠️ Duplicate detected: ${did} already received ${aidType} within ${windowHours}h`);
  }

  return duplicate;
}

/**
 * Get event statistics
 * @returns {object} - Statistics
 */
export function getEventStats() {
  const allEvents = Array.from(eventStore.values());

  const stats = {
    totalEvents: allEvents.length,
    byAidType: {},
    byStatus: {},
    verified: 0,
    loggedToHCS: 0,
    uniqueBeneficiaries: new Set(allEvents.map(e => e.beneficiaryDID)).size
  };

  allEvents.forEach(event => {
    // Count by aid type
    stats.byAidType[event.aidType] = (stats.byAidType[event.aidType] || 0) + 1;

    // Count by status
    stats.byStatus[event.status] = (stats.byStatus[event.status] || 0) + 1;

    // Count verified
    if (event.verified) stats.verified++;

    // Count HCS logged
    if (event.hcsStatus === "logged") stats.loggedToHCS++;
  });

  return stats;
}

/**
 * Get recent events
 * @param {number} limit - Max number of events to return
 * @returns {Array} - Array of recent events
 */
export function getRecentEvents(limit = 10) {
  const allEvents = Array.from(eventStore.values());
  return allEvents
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

/**
 * Search events by filters
 * @param {object} filters - Search filters
 * @returns {Array} - Matching events
 */
export function searchEvents(filters = {}) {
  const allEvents = Array.from(eventStore.values());

  return allEvents.filter(event => {
    if (filters.aidType && event.aidType !== filters.aidType) return false;
    if (filters.location && event.location !== filters.location) return false;
    if (filters.volunteerId && event.volunteerId !== filters.volunteerId) return false;
    if (filters.orgId && event.orgId !== filters.orgId) return false;
    if (filters.status && event.status !== filters.status) return false;
    if (filters.verified !== undefined && event.verified !== filters.verified) return false;
    
    // Date range filter
    if (filters.startDate) {
      const eventDate = new Date(event.timestamp);
      const startDate = new Date(filters.startDate);
      if (eventDate < startDate) return false;
    }
    if (filters.endDate) {
      const eventDate = new Date(event.timestamp);
      const endDate = new Date(filters.endDate);
      if (eventDate > endDate) return false;
    }

    return true;
  });
}

/**
 * Delete an event (admin only, for testing)
 * @param {string} eventId - Event identifier
 * @returns {boolean} - Success status
 */
export function deleteEvent(eventId) {
  const event = eventStore.get(eventId);
  if (!event) return false;

  // Remove from DID index
  const eventIds = didEventIndex.get(event.beneficiaryDID);
  if (eventIds) {
    const index = eventIds.indexOf(eventId);
    if (index > -1) eventIds.splice(index, 1);
  }

  // Remove event
  eventStore.delete(eventId);
  console.log(`🗑️ Event deleted: ${eventId}`);
  return true;
}

/**
 * Get all events (for export/audit)
 * @returns {Array} - All events
 */
export function getAllEvents() {
  return Array.from(eventStore.values());
}

// --- Demo/Test Runner (if run directly) ---
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("\n=== HAID Event Management Demo ===\n");

  // 1. Create test events
  console.log("1️⃣ Creating aid distribution events...");
  
  const event1 = createEvent({
    wristbandId: "WB-123456",
    did: "did:hedera:testnet:abc123",
    aidType: "FOOD",
    quantity: 2,
    location: "Camp Alpha - Distribution Point 1",
    volunteerId: "volunteer_001",
    orgId: "ngo_alpha",
    notes: "Family of 4"
  });
  console.log("   Event 1:", event1.eventId);

  const event2 = createEvent({
    did: "did:hedera:testnet:abc123",
    aidType: "WATER",
    quantity: 5,
    location: "Camp Alpha - Distribution Point 2",
    volunteerId: "volunteer_002",
    orgId: "ngo_alpha"
  });
  console.log("   Event 2:", event2.eventId);

  // 2. Check for duplicates
  console.log("\n2️⃣ Checking for duplicate distributions...");
  const isDuplicate = checkDuplicateEvent("did:hedera:testnet:abc123", "FOOD");
  console.log("   Duplicate found:", isDuplicate);

  // 3. Mark as logged to HCS
  console.log("\n3️⃣ Simulating HCS logging...");
  markEventLoggedToHCS(event1.eventId, "0.0.12345@1729767000.123456");
  console.log("   Event logged to HCS:", event1.eventId);

  // 4. Verify event
  console.log("\n4️⃣ Verifying event (beneficiary confirmation)...");
  verifyEvent(event1.eventId, "sig_abc123");
  console.log("   Event verified:", event1.eventId);

  // 5. Get events by DID
  console.log("\n5️⃣ Getting all events for DID...");
  const didEvents = getEventsByDID("did:hedera:testnet:abc123");
  console.log("   Events found:", didEvents.length);

  // 6. Get statistics
  console.log("\n6️⃣ Event statistics:");
  const stats = getEventStats();
  console.log("   Total events:", stats.totalEvents);
  console.log("   By aid type:", stats.byAidType);
  console.log("   Verified:", stats.verified);
  console.log("   Logged to HCS:", stats.loggedToHCS);

  // 7. Search events
  console.log("\n7️⃣ Searching events...");
  const foodEvents = searchEvents({ aidType: "FOOD" });
  console.log("   Food distributions:", foodEvents.length);

  // 8. Recent events
  console.log("\n8️⃣ Recent events:");
  const recent = getRecentEvents(5);
  recent.forEach((e, i) => {
    console.log(`   ${i + 1}. ${e.eventId} - ${e.aidType} - ${e.timestamp}`);
  });

  console.log("\n=== Demo Complete ===\n");
}