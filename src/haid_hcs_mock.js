// src/haid_hcs_mock.js
import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const DATA_FILE = path.join(__dirname, "data.json");

// ---- Utility functions ----
function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { messages: [], overrides: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function addMessage(msg) {
  const data = readData();
  const saved = { ...msg, txId: "tx_" + Date.now() };
  data.messages.push(saved);
  writeData(data);
  return saved;
}

function addOverride(override) {
  const data = readData();
  const saved = { ...override, txId: "tx_" + Date.now() };
  data.overrides.push(saved);
  writeData(data);
  return saved;
}

// ---- Server ----
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  res.setHeader("Content-Type", "application/json");

  if (req.method === "POST" && parsedUrl.pathname === "/publish") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const msg = JSON.parse(body);
        const saved = addMessage(msg);
        res.end(JSON.stringify({ ok: true, saved }));
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });

  } else if (req.method === "POST" && parsedUrl.pathname === "/override") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const override = JSON.parse(body);
        const saved = addOverride(override);
        res.end(JSON.stringify({ ok: true, saved }));
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });

  } else if (req.method === "GET" && parsedUrl.pathname.startsWith("/audit/merge/")) {
    const did = parsedUrl.pathname.split("/").pop();
    const data = readData();
    const history = data.messages.filter(m => m.did === did);
    const overrides = data.overrides.filter(o => o.oldDid === did || o.newDid === did);
    res.end(JSON.stringify({ did, history, overrides }));

  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Mock HCS server running on http://localhost:${PORT}`)
);
