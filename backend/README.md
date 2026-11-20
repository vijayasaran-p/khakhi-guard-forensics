# KHAKHI GUARD — Backend Architecture & Deployment Guide

> **MHA I4C Compliant Cyber Crime Investigation Platform**  
> Serving Chandigarh Police Cyber Crime Division & National Cyber Crime Reporting Portal (NCRP).

---

## 1. System Overview

KHAKHI GUARD has been elevated from a client-side prototype into a full-stack, enterprise-grade digital forensics intelligence system.

```
┌─────────────────────────────────────────────────────────────┐
│                      KHAKHI GUARD FRONTEND                  │
│       React 18 + Vite + Tailwind CSS + HTML5 Canvas         │
│          (Dual Theme · Strict Forensic Sutral Palette)      │
└──────────────┬───────────────────────────────▲──────────────┘
               │ REST / JSON                   │ Real-time Event Data
               ▼                               │
┌─────────────────────────────────────────────────────────────┐
│                   KHAKHI GUARD BACKEND API                  │
│              Express + TypeScript (Port 5000)               │
│                                                             │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │   Auth & RBAC Guards  │       │  Audit Logging Engine │  │
│  │  (JWT + Demo Mode)    │       │   (BNSS Compliance)   │  │
│  └───────────────────────┘       └───────────────────────┘  │
│                                                             │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │ Asynchronous Job Queue│       │ Forensic Risk Engine  │  │
│  │(FIR/CDR/Media Workers)│       │ (Canvas Graph Matrix) │  │
│  └───────────────────────┘       └───────────────────────┘  │
│                                                             │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │ PDF Dossier Generator │       │  Storage Abstraction  │  │
│  │(PDFKit + BSA Sec 63B) │       │ (Local FS / AWS S3)   │  │
│  └───────────────────────┘       └───────────────────────┘  │
└──────────────┬───────────────────────────────▲──────────────┘
               │ Prisma ORM                    │
               ▼                               │
┌─────────────────────────────────────────────────────────────┐
│                 PERSISTENCE & DATA LAYER                    │
│      SQLite (`dev.db` - Demo)  /  PostgreSQL (Production)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Zero-Friction Dual-Mode Operation

KHAKHI GUARD is engineered to run seamlessly in two distinct modes without code changes:

### Mode A: Embedded Evaluation Mode (`DEMO_MODE=true` - Default)
- **Database**: Embedded SQLite (`backend/prisma/dev.db`) — zero external database dependencies.
- **Queue Service**: In-Process Task Queue (`InProcessQueueService`) — no Redis instance required.
- **Storage**: Local filesystem storage with automatic SHA-256 evidence hashing.
- **Authentication**: Bypass with automatic `DEMO_USER` fallback for rapid hackathon / jury demonstration.
- **Crypto Engine**: Deterministic 4-hop money laundering chain with simulated on-chain block proofs.

### Mode B: Enterprise Production Mode (`DEMO_MODE=false`)
- **Database**: PostgreSQL with connection pooling.
- **Queue Service**: Redis BullMQ for distributed job workers.
- **Storage**: Amazon S3 / MinIO S3-compatible bucket.
- **Authentication**: Strict JWT with asymmetric signature verification + RBAC enforcement.
- **Crypto Engine**: Live Infura / Alchemy Ethereum RPC + Etherscan API.

---

## 3. Quickstart & Running Locally

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Step 1: Start the Backend Server
```bash
cd backend
npm install
npx prisma db push
npm run seed     # Seeds 5 cases, officers, and evidence files
npm run dev      # Starts server on http://localhost:5000
```

### Step 2: Start the Frontend Application
```bash
# In the repository root directory
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

---

## 4. API Specification

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | System status, database latency, active queue workers |
| `/api/auth/login` | POST | Investigator authentication, issues 24h JWT |
| `/api/cases` | GET | Paginated case docket with search & status filters |
| `/api/cases/:id` | GET | Full case dossier, entities, evidence, relationships |
| `/api/evidence/fir` | POST | Multipart upload for FIR PDF/doc, triggers entity extraction |
| `/api/evidence/cdr` | POST | Multipart upload for CDR CSV records |
| `/api/evidence/media` | POST | Multipart upload for audio/video forensics |
| `/api/crypto/trace/:address` | GET | 4-hop crypto trail resolution with exchange KYC markers |
| `/api/crypto/freeze` | POST | Issues statutory BNSS Section 106 emergency asset freeze |
| `/api/telecom/cdr/:caseId` | GET | Tower azimuth hops and call record matrix |
| `/api/linkage/:caseId` | GET | Canvas-ready spider-web nodes, edges, risk narrative |
| `/api/analytics/summary` | GET | Situational awareness metrics, attack timeline, mule velocity |
| `/api/maps/threat-matrix` | GET | Geospatial incident clusters, BTS tower azimuth sectors |
| `/api/cases/:id/dossier/generate` | POST | Compiles real court-admissible PDF dossier (BSA Sec 63B) |
| `/api/cases/:id/dossier/download` | GET | Streams cryptographically sealed PDF file |

---

## 5. Running Automated Tests

```bash
cd backend
npm test
```
Runs Jest unit and integration tests for:
- `riskEngine.test.ts`: Validates the deterministic risk formula `Base(60) + Matches(2*12) + Layering(2*9) + NocturnalSurge(8) = 99/100`.
- `crypto.test.ts`: Validates the 4-hop Ethereum trail resolution and BNSS Sec 106 asset freeze directives.

---

## 6. Statutory Compliance & Evidence Integrity
- **BSA Section 63B**: Cryptographic SHA-256 certificate schedule attached to every generated PDF dossier.
- **BNSS Section 106**: Emergency asset freeze directives and banking lien enforcement.
- **MHA I4C**: Compliant data ontology matching national cybercrime taxonomy (UPI fraud, crypto layering, synthetic media extortion).
