# 🛡️ CivicPay Shield

**Secure, transparent, and digitized government levy collection for the informal economy.**
*Built for the Enyata × Interswitch Buildathon 2026*

---

## 🌍 The Problem
In many developing economies, local government revenue collection relies heavily on cash transactions managed by street-level agents (collecting from market vendors, transport workers, etc.). This manual process leads to massive **cash leakage, counterfeit paper receipts, and a complete lack of real-time financial transparency** for local governments.

## 💡 The Solution
**CivicPay Shield** completely digitizes the local levy ecosystem. By combining a self-service Citizen Portal with a dedicated Collector Terminal, we ensure every single Naira collected is instantly logged, verified, and vaulted. 

Every transaction is secured with OTP verification and processed via **Interswitch**, bridging the gap between informal cash economies and secure digital banking.

---

## ✨ Key Features & Role-Based Access Control (RBAC)

* **👤 The Citizen Portal:** Allows individuals to log in, view their levy history, and securely pay local taxes (Transport, Market, Signage) directly via card or bank transfer.
* **🔍 The Collector Terminal:** A dedicated mobile-first interface for street-level government agents to log physical cash payments. It instantly generates a digital receipt for the citizen, eliminating fake paper tickets.
* **⚙️ The Admin Dashboard:** Real-time revenue tracking. Local government chairmen can view live collection volumes, verify receipts, and track exact payment flows across the municipality.

## 🛠️ Tech Stack Architecture
* **Frontend:** React, Vite, Custom CSS (Dark-mode optimized for outdoor visibility)
* **Backend:** Python, FastAPI, SQLAlchemy
* **Database:** SQLite 
* **Authentication:** JWT (JSON Web Tokens) with strictly enforced RBAC and VIP Passcode lockouts for privileged accounts.
* **Payment Gateway:** Interswitch (Mock Integration)
* **Deployment:** Render (Backend API)

---

## 🚀 How to Run Locally

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/Franslekan/CivicPay-Shield.git
cd CivicPay-Shield
\`\`\`

**2. Start the FastAPI Backend**
\`\`\`bash
# Create a virtual environment and install dependencies
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload
\`\`\`

**3. Start the React Frontend**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

**4. Demo Credentials**
* **Citizen:** Create a new account or use `citizen@example.com`
* **Collector/Admin Creation:** Requires the Master VIP Passcode: `CIVIC_VIP_2026`

---
## 👥 The Team
* **Frans Olamilekan Anthony** – Tech Lead & Backend Architecture (FastAPI, Python, DB)
* **Blakkie** – Frontend Engineer (React, Vite, CSS)
* **Abdul Rahman** - UI/UX Design (Canva)
* **Toyibat** - Project Manajer (Slack, Trello)
