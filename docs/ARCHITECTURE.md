# System Architecture

The Tele-nutrition & Digital Health Platform is engineered following a clean, multi-layered architecture separating presentation, REST application logic, domain informatics, data persistence, and external health record interoperability.

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 18 + TypeScript + Vite)"]
        UI_Pages["Pages (Consumer / Provider / Telehealth)"]
        UI_Components["Accessible UI Components (WCAG AA)"]
        UI_Charts["Recharts Visualizations (AMDR, Trends, RDA)"]
        Jitsi_Embed["Embedded Jitsi Meet IFrame API"]
    end

    subgraph Gateway["Security & Middleware Layer"]
        Helmet_CORS["Helmet + CORS Allowlist"]
        Rate_Limiter["Express Rate Limiter"]
        Auth_Middleware["JWT Cookie Auth & RBAC (Consumer / Provider)"]
        Audit_Logger["PII-Masked Audit Logger"]
    end

    subgraph Server["Backend REST API (Node.js + Express + TypeScript)"]
        Controllers["Controllers (REST contract, input sanitization)"]
        Services["Services (Business Orchestration & EHR Client)"]
        Domain["Domain Engine (Pure Informatics: BMI, BMR, TEE, RDA, CDS)"]
        Repositories["Repositories (Prisma ORM Data Access)"]
    end

    subgraph Data["Persistence Layer"]
        Postgres_DB[("PostgreSQL 16 / SQLite Engine")]
        PII_Store["UserProfile (PII Table)"]
        Health_Store["HealthProfile + MealLogs + Charts (Pseudonymous UUID)"]
    end

    subgraph External["Interoperability & Video Infrastructure"]
        Mock_EHR["Mock EHR Service (FHIR R4 Patient, Observation, Encounter)"]
        Jitsi_Server["meet.jit.si Secure Dynamic WebRTC Rooms"]
    end

    Client -->|HTTPS / httpOnly Cookie| Gateway
    Gateway --> Controllers
    Controllers --> Services
    Services --> Domain
    Services --> Repositories
    Services -->|FHIR REST / JSON| Mock_EHR
    Repositories --> Postgres_DB
    Postgres_DB --> PII_Store
    Postgres_DB --> Health_Store
    Jitsi_Embed <-->|WebRTC Peer Connection| Jitsi_Server
```

## Architectural Highlights
1. **Layered Separation of Concerns**: Strict boundary: `routes -> controllers -> services -> repositories -> domain`.
2. **Pure Domain Informatics**: Clinical calculations (Mifflin-St Jeor BMR, BMI classification, Asian-Pacific cutoffs, TEE, RDA comparisons, and 10 CDS clinical rules) are implemented as deterministic, pure TypeScript functions without I/O or database dependencies, achieving 100% test coverage.
3. **Data Privacy & Pseudonymization**: PII (names, phone numbers, exact birthdates) is partitioned into a separate `UserProfile` entity, while all health metrics, meal logs, and clinical charts reference a pseudonymous UUID (`User.id`). Anonymized research exports (`/api/export/anonymized`) aggregate ages into 5-year bands and strip contact information.
4. **Resilient Interoperability**: The `ehrClient` communicates with FHIR-compliant endpoints on `mock-ehr`, providing observation pre-population for ADIME charts and pushing finalized clinical notes as FHIR `Encounter` records with timeout and error fallback mechanisms.
5. **Telehealth Video Architecture**: Uses Jitsi Meet IFrame API with dynamically generated, cryptographically unguessable room identifiers unlocked only 10 minutes prior to scheduled session time for verified session participants.
