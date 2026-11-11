# 🥗 Tele-Nutrition & Digital Health Platform

A full-stack, production-ready clinical nutrition platform connecting Consumers with Registered Dietitians for medical nutrition therapy (MNT), meal logging, and secure video consultations.

**Live Demo:**
- **Frontend:** [https://captivating-compassion-production-d32ef108.up.railway.app](https://captivating-compassion-production-d32ef108.up.railway.app)
- **Backend API:** [https://nutritionfundamentalsfinals-production.up.railway.app/api/health](https://nutritionfundamentalsfinals-production.up.railway.app/api/health)

## 📚 Documentation
- **[Security Audit Report](./SECURITY_AUDIT.md)** — Full vulnerability assessment and remediation log.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express, TypeScript, Zod (validation) |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | JWT (HS256), bcrypt, HttpOnly Cookies |
| **Video** | Jitsi Meet React SDK (WebRTC) |
| **Testing** | Vitest, Supertest (77 passing tests) |
| **Infra** | Docker, Railway (deployment) |
| **Security** | Helmet, CORS, express-rate-limit, timing-safe comparison |

---

## 🔑 Demo Credentials

Use the following pre-seeded accounts to explore the platform. 

**Note:** The database is hosted on a free-tier service. If the login fails on the first try, please wait 30 seconds for the backend to wake up and try again.

### 👨‍⚕️ Provider (Dietitian)
*   **Email:** `dietitian@telenutrition.demo`
*   **Password:** `Password123!`

### 👤 Consumer (Patient)
*   **Email:** `juan.diabetes@telenutrition.demo`
*   **Password:** `Password123!`

---

## 🎯 Evaluation Criteria Coverage

### 1. System Architecture & Code Quality (25%)
- **Layered Architecture:** Strict `Routes → Controllers → Services → Repositories` separation.
- **Centralized Config:** `server/src/config/env.ts` validates all environment variables at boot.
- **Test Coverage:** **77 automated tests** covering auth, IDOR, CDS rules, and PII anonymization.

### 2. Domain Accuracy & Informatics (25%)
- **eNCPT Terminology:** All diagnosis terms use real **eNCPT codes** (e.g., `NI-5.10.1`).
- **PES Statement Generator:** Automatically synthesizes clinical statements.
- **Clinical Decision Support (CDS):** 10 evidence-based rules (e.g., CKD potassium ceiling, Asian-Pacific BMI).

### 3. Data Privacy & Interoperability (20%)
- **PII Anonymization:** HIPAA Safe Harbor-style de-identification (5-year age banding, date-shifting).
- **FHIR Interoperability:** Connects to a mock FHIR server using HL7 resources.

### 4. User Experience (UX) & Accessibility (15%)
- **Skip-to-content link** for screen readers.
- **Responsive charts** (Recharts).
- **CDS Alert Banners** with color-coded severity.

### 5. Tele-nutrition & End-to-End Flow (15%)
- **Jitsi Meet Integration:** Secure WebRTC video sessions.
- **Full Workflow:** Login → Meal Logging → Appointments → Provider Charting → Video.