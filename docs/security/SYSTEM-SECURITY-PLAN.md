# System Security Plan (SSP)
## Semper Admin Portal

**Document version:** 1.0  
**Date:** 2026-05-12  
**Status:** DRAFT - Not approved for production use  
**Classification:** CONTROLLED UNCLASSIFIED INFORMATION (CUI)

---

## 1. System Identification

| Field | Value |
|-------|-------|
| System name | Semper Admin Portal |
| Abbreviation | SAP |
| System owner | To be designated |
| Authorizing Official (AO) | To be designated |
| System status | Development |
| Operational status | Pre-production |
| System type | Major Application |
| System URL | https://semperadmin.github.io/SemperAdminPortal/ |
| Hosting | GitHub Pages (static export) |
| Tech stack | Next.js 15, TypeScript, Tailwind CSS 4 |

---

## 2. System Description

Semper Admin Portal is a role-tagged USMC administrative reference application. It provides sourced, verified policy content for four audiences: Marines (junior enlisted), leaders (NCOs and SNCOs), commanders (officers), and administrators (S-1 and admin specialists).

**Primary functions:**
- Policy reference for pay, leave, promotions, separations, and administrative processes
- Document generation tools (naval letters, PDF letters, DOCX counseling forms)
- Inspection checklist programs (IGMC, MCAAT)
- Unit directory and citation registry

**Data categories processed:**
- Unclassified administrative policy (MCOs, MARADMINs, DODIs)
- USMC unit organizational data (UICs, addresses, SSICs)
- User-generated document content (names, unit designations, policy text)

**Information types (NIST 800-60):**
- Administrative and Management Support: D.14
- Defense and National Security: D.16

---

## 3. System Environment

### 3.1 Boundary

**In scope:**
- Static web application served from GitHub Pages
- Client-side JavaScript executing in user browsers
- Document generation (PDF, DOCX) executed locally in browser
- Client-side search (Pagefind)

**Out of scope (current version):**
- No backend server
- No database
- No API endpoints
- No user authentication or session management
- No server-side logging

### 3.2 Architecture diagram (text)

```
[End user browser]
       |
       | HTTPS (GitHub Pages enforced)
       v
[GitHub Pages CDN]
       |
       v
[Static HTML/CSS/JS bundle]
       |
       v
[Client-side React application]
  - Role selection (localStorage)
  - Audit log (sessionStorage)
  - PDF generation (@react-pdf/renderer)
  - DOCX generation (docx library)
```

### 3.3 Data flows

1. User loads page: browser fetches static assets from GitHub CDN over HTTPS.
2. Role selection: user-chosen role stored in browser localStorage. No server involved.
3. Search: Pagefind indexes served as static files. Query executed entirely in browser.
4. Document generation: user inputs processed in browser. No data leaves the browser.
5. Audit events: logged to sessionStorage. No backend persistence currently implemented.

---

## 4. Security Categorization

Per FIPS 199 and NIST 800-60 Volume II:

| Security Objective | Impact Level | Rationale |
|---|---|---|
| Confidentiality | MODERATE | Contains CUI: unit locations, administrative procedures |
| Integrity | MODERATE | Policy reference errors affect administrative decisions |
| Availability | LOW | Reference only; outage tolerable short-term |

**System security category: MODERATE**

---

## 5. Applicable Laws and Regulations

- FISMA (Federal Information Security Modernization Act, 2014)
- FIPS 199 (Standards for Security Categorization)
- FIPS 200 (Minimum Security Requirements)
- NIST SP 800-53 Rev 5 (Security and Privacy Controls)
- NIST SP 800-60 Vol II (Guide for Mapping Information Types)
- DoD Instruction 8500.01 (Cybersecurity)
- DoD Instruction 8520.01 (Public Key Infrastructure and PKE)
- DoD Instruction 8551.01 (PPS Policy)
- SECNAV M-5239.1 (DoN Cybersecurity Program)
- MCO 5239.2B (Marine Corps Cybersecurity Program)
- NARA CUI Program (32 CFR Part 2002)

---

## 6. Roles and Responsibilities

| Role | Individual/Position | Responsibility |
|------|-------------------|----------------|
| System Owner | TBD | Overall system accountability |
| Authorizing Official | TBD | Grant/deny ATO |
| Information System Security Officer (ISSO) | TBD | Day-to-day security oversight |
| Information System Security Manager (ISSM) | TBD | Security policy implementation |
| Developer/Maintainer | Stephen (USMC) | Code development and content |
| Users | Authorized USMC/DoD personnel | Authorized use only |

---

## 7. Control Summary

See [NIST-800-53-CONTROLS.md](./NIST-800-53-CONTROLS.md) for full control mapping.

### 7.1 Controls - Implemented

| Control | Status | Location |
|---------|--------|----------|
| SC-28 (Protection of Information at Rest) | Partial | No sensitive data stored server-side |
| SC-8 (Transmission Confidentiality) | Implemented | GitHub Pages enforces HTTPS/TLS 1.2+ |
| SC-12 (Cryptographic Key Establishment) | N/A | No application-layer crypto |
| SI-3 (Malicious Code Protection) | Partial | No executable uploads; static content only |
| SA-15 (Development Process) | Partial | TypeScript strict, ESLint, Zod validation |
| AU-2 (Audit Events) | Partial | Client-side sessionStorage audit log implemented |
| SI-10 (Information Input Validation) | Implemented | Zod schemas, maxLength, char allowlists on all export forms |
| SC-5 (Denial of Service Protection) | Partial | GitHub Pages CDN provides basic DDoS protection |
| RA-5 (Vulnerability Scanning) | Partial | npm audit in CI/CD pipeline |

### 7.2 Controls - Not Implemented (Blocking ATO)

| Control | Gap | Required Action |
|---------|-----|----------------|
| AC-2 (Account Management) | No authentication | Implement CAC/PKI auth |
| AC-3 (Access Enforcement) | No access control | Server-side role enforcement |
| AC-17 (Remote Access) | No session control | Implement with auth backend |
| AU-3 (Audit Record Content) | No user identity in logs | Requires CAC integration |
| AU-9 (Protection of Audit Information) | sessionStorage only | Backend with write-once log storage |
| AU-11 (Audit Record Retention) | No retention | Backend log system required |
| IA-2 (Identification and Authentication) | No auth | CAC + PIN per DODI 8520.01 |
| IA-5 (Authenticator Management) | No authenticators | CAC cert lifecycle management |
| SC-17 (Public Key Infrastructure Certificates) | No PKI | DoD PKI integration required |

---

## 8. Interconnections

None. The application does not connect to other systems, APIs, or databases in its current static deployment.

---

## 9. System Security Posture

### Strengths
- No backend attack surface (static export)
- No database (eliminates SQL injection, data breach risk)
- Strict TypeScript (eliminates type confusion vulnerabilities)
- Zod input validation on all document generation forms
- CSP meta tag configured
- Frame-buster implemented
- npm audit in CI/CD pipeline
- CUI markings on all pages
- Role tampering detection and audit logging

### Gaps (must resolve before ATO)
1. No authentication or authorization (critical)
2. No CAC/PKI integration (critical)
3. No server-side audit log with backend persistence (critical)
4. No backend means no server-enforced security controls
5. GitHub Pages does not support HTTP security headers (HSTS, X-Frame-Options, etc.)

---

## 10. Plan of Action and Milestones (POA&M)

| ID | Weakness | Severity | Scheduled Completion | Mitigation |
|----|---------|---------|---------------------|------------|
| POA-01 | No authentication | Critical | TBD | Implement CAC via SAML 2.0 / DISA ICAM |
| POA-02 | No audit log persistence | Critical | TBD | Deploy backend logging endpoint |
| POA-03 | GitHub Pages no HTTP headers | High | TBD | Migrate to Nginx/Apache or Cloudflare |
| POA-04 | No SSP approval | High | TBD | AO review and signature |
| POA-05 | CUI content not restricted | High | TBD | Gate all content behind CAC auth |
| POA-06 | No incident response plan | Medium | TBD | Develop IRP per NIST 800-61 |
| POA-07 | No vulnerability scan history | Medium | Ongoing | npm audit in CI; add SAST tool |

---

## 11. Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-05-12 | Claude Code Security Analysis | Initial draft |

---

*This document is DRAFT. It requires review by an authorized ISSO and signature from the Authorizing Official before the system may operate in any production or operational environment.*

**CONTROLLED UNCLASSIFIED INFORMATION (CUI)**
