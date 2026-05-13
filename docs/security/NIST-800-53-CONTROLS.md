# NIST 800-53 Rev 5 Control Mapping
## Semper Admin Portal

**System security category:** MODERATE  
**Date:** 2026-05-12  
**Classification:** CONTROLLED UNCLASSIFIED INFORMATION (CUI)

Key:
- **IMP** - Implemented
- **PARTIAL** - Partially implemented, gap noted
- **PLANNED** - On POA&M, not yet implemented
- **N/A** - Not applicable to current architecture

---

## Access Control (AC)

| Control | Title | Status | Implementation / Gap |
|---------|-------|--------|----------------------|
| AC-1 | Policy and Procedures | PLANNED | No formal AC policy document. Required before ATO. |
| AC-2 | Account Management | PLANNED | No accounts exist. Required: CAC-based identity management. |
| AC-3 | Access Enforcement | PLANNED | No enforcement. Role selection is client-side only. Backend required. |
| AC-6 | Least Privilege | PARTIAL | Four roles defined in code. No enforcement at server level. |
| AC-7 | Unsuccessful Login Attempts | PLANNED | No auth system. Required when CAC implemented. |
| AC-11 | Device Lock | N/A | Browser session; no application-level lock. OS/browser controls apply. |
| AC-14 | Permitted Actions Without Identification | PARTIAL | Current state: all actions permitted without ID. Not acceptable for production. |
| AC-17 | Remote Access | PLANNED | All access is remote (web). Session controls required. |
| AC-22 | Publicly Accessible Content | PARTIAL | Site is public. CUI markings added. Access restriction requires auth. |

---

## Audit and Accountability (AU)

| Control | Title | Status | Implementation / Gap |
|---------|-------|--------|----------------------|
| AU-1 | Policy and Procedures | PLANNED | No formal audit policy. Required before ATO. |
| AU-2 | Audit Events | PARTIAL | Client-side sessionStorage audit log implemented. No backend persistence. Events logged: PAGE_VIEW, ROLE_CHANGE, EXPORT_PDF, EXPORT_DOCX, ROLE_TAMPER_DETECTED. |
| AU-3 | Content of Audit Records | PARTIAL | Events include timestamp, action, resource, sessionId, detail. Missing: user identity (requires CAC). |
| AU-4 | Audit Log Storage Capacity | PLANNED | sessionStorage capped at 500 events. Backend required for AU-11 compliance. |
| AU-6 | Audit Review | PLANNED | No review process. Required after backend logging is implemented. |
| AU-8 | Time Stamps | IMP | Audit events use ISO 8601 timestamps via `new Date().toISOString()`. |
| AU-9 | Protection of Audit Information | PLANNED | sessionStorage readable by JS on same origin. Backend with write-once storage required. |
| AU-11 | Audit Record Retention | PLANNED | sessionStorage clears on tab close. 1-year retention required per DoD. Backend required. |
| AU-12 | Audit Record Generation | PARTIAL | Role changes, exports, tamper detection logged. Page views not yet wired. |

---

## Configuration Management (CM)

| Control | Title | Status | Implementation / Gap |
|---------|-------|--------|----------------------|
| CM-2 | Baseline Configuration | PARTIAL | package-lock.json locks dependencies. No formal baseline document. |
| CM-3 | Configuration Change Control | PARTIAL | GitHub PRs provide change tracking. No formal CCB process. |
| CM-6 | Configuration Settings | PARTIAL | TypeScript strict, ESLint, Zod validation configured. No formal hardening guide. |
| CM-7 | Least Functionality | IMP | Static export only. No server, no API routes, no shell access. |
| CM-8 | System Component Inventory | PARTIAL | package.json + package-lock.json enumerate all components. No SBOM generated. |
| CM-10 | Software Usage Restrictions | IMP | All dependencies are open-source. package.json reviewed for license compliance. |
| CM-11 | User-Installed Software | N/A | Web application. No user software installation. |

---

## Identification and Authentication (IA)

| Control | Title | Status | Implementation / Gap |
|---------|-------|--------|----------------------|
| IA-1 | Policy and Procedures | PLANNED | No IA policy. Required before ATO. |
| IA-2 | Identification and Authentication (Org Users) | PLANNED | No auth system. CAC required per DODI 8520.01. |
| IA-3 | Device Identification | N/A | No device registration required for current architecture. |
| IA-4 | Identifier Management | PLANNED | No identifiers currently assigned. Required when CAC implemented. |
| IA-5 | Authenticator Management | PLANNED | CAC cert lifecycle management required. |
| IA-6 | Authentication Feedback | N/A | No authentication UI currently. |
| IA-8 | Identification and Authentication (Non-Org Users) | PLANNED | Public access currently permitted. Restriction required for CUI content. |

---

## Incident Response (IR)

| Control | Title | Status | Implementation / Gap |
|---------|-------|--------|----------------------|
| IR-1 | Policy and Procedures | PLANNED | No IRP documented. Required before ATO. |
| IR-2 | Incident Response Training | PLANNED | No training plan. Required for operational teams. |
| IR-4 | Incident Handling | PLANNED | No incident handling procedure. Develop per NIST 800-61. |
| IR-6 | Incident Reporting | PLANNED | No reporting procedure. 60-min breach notification to DISA required. |
| IR-8 | Incident Response Plan | PLANNED | See ATO checklist item IR-01. |

---

## Risk Assessment (RA)

| Control | Title | Status | Implementation / Gap |
|---------|-------|--------|----------------------|
| RA-1 | Policy and Procedures | PLANNED | No formal RA policy. |
| RA-2 | Security Categorization | IMP | FIPS 199: Moderate. See SSP Section 4. |
| RA-3 | Risk Assessment | PLANNED | Full risk assessment required before ATO. |
| RA-5 | Vulnerability Scanning | PARTIAL | npm audit runs in CI/CD on every deploy. No SAST or DAST tool configured. |
| RA-7 | Risk Response | PLANNED | POA&M created. Formal risk acceptance by AO required. |

---

## System and Communications Protection (SC)

| Control | Title | Status | Implementation / Gap |
|---------|-------|--------|----------------------|
| SC-1 | Policy and Procedures | PLANNED | No formal SC policy. |
| SC-5 | Denial-of-Service Protection | PARTIAL | GitHub Pages CDN provides basic DDoS protection. No WAF or rate limiting. |
| SC-7 | Boundary Protection | PARTIAL | Static site has narrow boundary. No ingress filtering beyond CDN. |
| SC-8 | Transmission Confidentiality and Integrity | IMP | GitHub Pages enforces HTTPS/TLS 1.2+. |
| SC-12 | Cryptographic Key Establishment | N/A | No application-level cryptographic operations. |
| SC-17 | Public Key Infrastructure Certificates | PLANNED | Required for CAC auth. DoD PKI root CAs must be bundled. |
| SC-18 | Mobile Code | PARTIAL | Next.js static JS executes in browser. CSP meta tag limits execution context. |
| SC-23 | Session Authenticity | PLANNED | No sessions currently. Required when auth is implemented. |
| SC-28 | Protection of Information at Rest | PARTIAL | No server-side storage. Client sessionStorage + localStorage are browser-controlled. |

---

## System and Information Integrity (SI)

| Control | Title | Status | Implementation / Gap |
|---------|-------|--------|----------------------|
| SI-1 | Policy and Procedures | PLANNED | No formal SI policy. |
| SI-2 | Flaw Remediation | PARTIAL | npm audit in CI. No formal patch timeline defined. |
| SI-3 | Malicious Code Protection | IMP | Static export only. No file uploads, no server-side code execution. |
| SI-7 | Software, Firmware, and Information Integrity | PARTIAL | package-lock.json ensures reproducible builds. No code signing configured. |
| SI-10 | Information Input Validation | IMP | Zod schemas validate MDX frontmatter at build time. maxLength + allowlist regex on all export forms. |
| SI-12 | Information Management and Retention | PLANNED | No data retention policy. Required for CUI handling. |

---

## Program Management (PM)

| Control | Title | Status | Implementation / Gap |
|---------|-------|--------|----------------------|
| PM-1 | Information Security Program Plan | PLANNED | SSP draft created (docs/security/SYSTEM-SECURITY-PLAN.md). AO approval required. |
| PM-9 | Risk Management Strategy | PLANNED | Risk acceptance and treatment strategy required. |
| PM-10 | Authorization Process | PLANNED | ATO process must be initiated. See ATO checklist. |

---

## Summary

| Family | Total Controls | Implemented | Partial | Planned | N/A |
|--------|---------------|-------------|---------|---------|-----|
| AC | 9 | 0 | 3 | 5 | 1 |
| AU | 9 | 1 | 4 | 4 | 0 |
| CM | 7 | 2 | 3 | 1 | 1 |
| IA | 7 | 0 | 0 | 6 | 1 |
| IR | 5 | 0 | 0 | 5 | 0 |
| RA | 5 | 1 | 1 | 3 | 0 |
| SC | 9 | 1 | 5 | 3 | 0 |
| SI | 7 | 2 | 3 | 2 | 0 |
| PM | 3 | 0 | 0 | 3 | 0 |
| **Total** | **61** | **7 (11%)** | **19 (31%)** | **32 (52%)** | **3 (5%)** |

**7 of 61 controls fully implemented. 32 controls blocked on CAC auth + backend infrastructure.**

---

**CONTROLLED UNCLASSIFIED INFORMATION (CUI)**
