# 🌍 **Haid – Humanitarian Aid with Hedera**

**Deployed App:** [https://haid.vercel.app](https://haid.vercel.app)
**Track:** *DLT for Operations*
**Pitch deck:** [https://drive.google.com/file/d/1KJg9ox0LCqmu2kFjR4ObKcr3o21oIwhQ/view?usp=drive_link](https://drive.google.com/file/d/1KJg9ox0LCqmu2kFjR4ObKcr3o21oIwhQ/view?usp=drive_link)
**Certificates:** [https://drive.google.com/drive/folders/1eJqfsxgVWmBKuvDHocuY1ZKz837Q5HRR?usp=drive_link](https://drive.google.com/drive/folders/1eJqfsxgVWmBKuvDHocuY1ZKz837Q5HRR?usp=drive_link)

---

## 🧩 **Overview**

**Haid** is a **Hedera-powered humanitarian aid distribution system** that ensures transparency, dignity, and efficiency in how food, medical supplies, and essentials reach displaced people and refugees.

It connects **NGOs, volunteers, donors, and recipients** through a unified ecosystem — leveraging **Hedera Guardian**, **DIDs**, and **immutable event logging** for verifiable trust.

---

## 💡 **Problem Statement**

Millions of displaced individuals struggle to access aid due to **identity barriers**, **fraudulent claims**, and **inefficient manual systems**.
NGOs and donors lack visibility into how aid is distributed — leading to waste, double-claiming, and broken trust.

**Haid** fixes this by bringing **identity, distribution, and accountability** together — on Hedera.

---

## 🔗 **Solution**

Each **refugee receives a waterproof NFC wristband** (represented by QR code during the hackathon for demo purposes) that holds a **unique Decentralized Identifier (DID)** on **Hedera Guardian**.

* Volunteers scan the band to verify identity and record aid distribution.
* NGOs create and manage aid events (food, health, shelter, etc.).
* Donors see immutable, real-time dashboards showing exactly where their contributions go.

All transactions are **logged on Hedera**, ensuring transparency and zero tampering.

---

## 🧠 **Why Hedera Guardian**

Haid is built using **Hedera Guardian**, an open-source, verifiable platform for sustainability and social impact solutions.

We leverage:

* **Hedera Consensus Service (HCS)** for immutable, timestamped aid logs.
* **Hedera DID** for anonymous yet verifiable identity management.
* **Guardian Indexer** for structured event visualization and transparency dashboards.

This guarantees **auditable, cost-effective, and scalable** humanitarian operations.

---

## 👥 **User Roles & Flow**

### 🧍 Refugees (Aid Recipients)

* Receive NFC wristbands (QR demo for MVP).
* Simply tap/scan to collect aid — no paperwork, no stress.
* System ensures fairness — no double-claiming.

### 🤝 NGO Staff

* Create aid events (e.g., “Food Distribution – Ajegunle Camp, Oct 2025”).
* Assign and manage volunteers.
* Track real-time collection and generate Hedera-anchored reports.

### 💚 Volunteers

* Use scanning devices to log aid distribution.
* Each scan is instantly recorded on Hedera.
* See instant feedback (“Aid successfully logged”).

### 💸 Donors

* Have wallets auto-created upon registration.
* Send donations directly to verified NGOs.
* View transparent dashboards of every tℏ transaction and impact metrics.

### 🔍 Auditors

* Independently verify all aid logs.
* Use Guardian-based explorer to confirm immutable entries and ensure compliance.

---

## 💰 **Revenue & Sustainability Model**

1. **Platform-as-a-Service (PaaS):** NGOs and organizations pay subscription or usage fees for verifiable distribution tracking.
2. **Transaction Fees:** Minimal processing fees on donor-to-NGO transfers via Hedera tokens.
3. **Partnership Grants:** With UNHCR, UNICEF, and local governments adopting Haid as a traceability and compliance layer.

---

## 🗺️ **Roadmap**

### ✅ **Hackathon MVP (Now)**

* QR-code based simulation of NFC band.
* NGO, Volunteer, Donor, and Refugee dashboards live.
* Guardian-linked immutable logging on Hedera Testnet.
* Real-time dashboards + wallet integration.

### 🚀 **Post-Hackathon**

* Manufacture waterproof NFC Haid Bands.
* Deploy Hedera wallets on Mainnet.
* Pilot with NGO partners in West Africa refugee camps.
* Integrate AI for predictive logistics and aid optimization.

---

## 🧭 **Architecture Overview**

Frontend (Javascript + Chakra UI):

* Accessible, multilingual dashboards (English, French, Swahili, Hausa, Arabic).
* Voice guidance and high-contrast mode for accessibility.

Backend (Node.js):

* Event creation, user management, aid logging.
* Off-chain caching synced with Hedera Guardian.

Hedera Guardian (Blockchain Layer):

* Immutable event storage via Hedera Consensus Service (HCS).
* DIDs for each stakeholder.
* Guardian Indexer visualizations for transparency.

---

## 🎯 **Impact**

* 100% tamper-proof distribution logs.
* 10× faster registration & distribution cycles.
* 1 dashboard to unify all stakeholders.
* Refugees receive aid fairly and transparently — with dignity.

---

## 🏆 **Why Haid Wins**

* Empathy-driven design meets real-world scalability.
* End-to-end DLT for operations — not a concept, a working system.
* Built with Hedera Guardian, the global standard for sustainability and digital public goods.

---

## 👩‍💻 **Team Haid**

* **Lydia** – Product Lead & PM
* **Timothy** – Frontend Engineer
* **Tobiloba** – Product Designer
* **Olumuyiwa** – Hedera Developer
* **Chinomso** – Backend Engineer
