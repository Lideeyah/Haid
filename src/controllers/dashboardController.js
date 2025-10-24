// src/controllers/dashboardController.js
import { readFileSync } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data.json");

export function getDonorDashboard(req, res) {
  try {
    const data = JSON.parse(readFileSync(DATA_FILE, "utf8"));
    
    const stats = {
      totalDistributions: data.messages.filter(m => m.type === "SCAN").length,
      uniqueBeneficiaries: new Set(data.messages.map(m => m.did)).size,
      aidTypes: data.messages.reduce((acc, m) => {
        if (m.aidType) acc[m.aidType] = (acc[m.aidType] || 0) + 1;
        return acc;
      }, {}),
      recentEvents: data.messages.slice(-10)
    };
    
    res.json({ dashboard: "Donor Dashboard", stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getAuditorDashboard(req, res) {
  try {
    const data = JSON.parse(readFileSync(DATA_FILE, "utf8"));
    
    const audit = {
      totalEvents: data.messages.length,
      eventsByType: data.messages.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
      }, {}),
      suspiciousActivity: data.overrides.length,
      verificationStatus: {
        verified: data.messages.filter(m => m.verified).length,
        pending: data.messages.filter(m => !m.verified).length
      },
      fullHistory: data.messages
    };
    
    res.json({ dashboard: "Auditor Dashboard", audit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}