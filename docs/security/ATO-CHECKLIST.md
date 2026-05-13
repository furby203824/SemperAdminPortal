# Authority to Operate (ATO) Checklist
## Semper Admin Portal

**Date:** 2026-05-12  
**Status:** PRE-ATO - Do not deploy to production  
**Classification:** CONTROLLED UNCLASSIFIED INFORMATION (CUI)

This checklist tracks every action required before the Semper Admin Portal receives an ATO from the Authorizing Official. Items marked **BLOCKING** must be complete before ATO submission.

---

## Phase A - Governance and Documentation

| ID | Item | Status | Owner | Notes |
|----|------|--------|-------|-------|
| GOV-01 | Designate System Owner | OPEN | Command | Assign individual responsible for system lifecycle |
| GOV-02 | Designate Authorizing Official (AO) | OPEN | Command | Flag Officer or SES equivalent for MODERATE system |
| GOV-03 | Designate ISSO | OPEN | G-6/S-6 | Information System Security Officer |
| GOV-04 | Designate ISSM | OPEN | G-6/S-6 | Information System Security Manager |
| GOV-05 | Finalize System Security Plan | OPEN | ISSO | docs/security/SYSTEM-SECURITY-PLAN.md is DRAFT |
| GOV-06 | AO review and sign SSP | OPEN | AO | Required before proceeding |
| GOV-07 | Define interconnection agreements | OPEN | ISSO | Required when backend/CAC is added |
| GOV-08 | Register system in eMASS | OPEN | ISSO | DoD system registration required |

---

## Phase B - Authentication and Authorization (BLOCKING)

| ID | Item | Status | Owner | Notes |
|----|------|--------|-------|-------|
| AUTH-01 | Implement CAC/PKI authentication | OPEN | Developer | Per DODI 8520.01. Requires backend. See cac-auth.ts scaffold. |
| AUTH-02 | Configure TLS mutual auth on server | OPEN | Infrastructure | Nginx/Apache: ssl_verify_client on |
| AUTH-03 | Bundle DoD root CA certificates | OPEN | Developer | Download from DISA PKCS#7 bundle |
| AUTH-04 | Validate cert chain to DoD root CAs | OPEN | Developer | Implement in parseCACCert() |
| AUTH-05 | Extract identity from CAC Subject DN | OPEN | Developer | Parse CN=LAST.FIRST.MI.EDIPI |
| AUTH-06 | Implement PIN requirement | OPEN | Developer | CAC + PIN = two-factor per DODI 8520.01 |
| AUTH-07 | Implement server-side role enforcement | OPEN | Developer | Remove client-side localStorage role |
| AUTH-08 | Implement RBAC from CAC attributes | OPEN | Developer | Map cert affiliation/grade to portal roles |
| AUTH-09 | Session timeout (30 min inactivity) | OPEN | Developer | Per DODI 8500.01 |
| AUTH-10 | Session timeout (8 hr absolute) | OPEN | Developer | Per DODI 8500.01 |
| AUTH-11 | Test CAC auth with real card + reader | OPEN | QA | Verify ActivClient, middleware compatibility |
| AUTH-12 | Test certificate expiry handling | OPEN | QA | User with expired cert must be blocked |
| AUTH-13 | DISA ICAM integration test | OPEN | Developer | Validate against DISA identity federation |

---

## Phase C - Infrastructure and Hosting (BLOCKING)

| ID | Item | Status | Owner | Notes |
|----|------|--------|-------|-------|
| INFRA-01 | Migrate from GitHub Pages to authorized server | OPEN | Infrastructure | GitHub Pages cannot enforce HTTP headers or TLS client certs |
| INFRA-02 | Host on DoD-approved infrastructure | OPEN | Infrastructure | Options: AWS GovCloud, Azure Government, on-prem |
| INFRA-03 | Configure HSTS header | OPEN | Infrastructure | Strict-Transport-Security: max-age=31536000; includeSubDomains |
| INFRA-04 | Configure X-Frame-Options: DENY | OPEN | Infrastructure | Replaces current JS frame-buster |
| INFRA-05 | Configure X-Content-Type-Options: nosniff | OPEN | Infrastructure | Currently in HTML meta (less effective than header) |
| INFRA-06 | Configure Referrer-Policy | OPEN | Infrastructure | strict-origin-when-cross-origin |
| INFRA-07 | Configure Permissions-Policy | OPEN | Infrastructure | Disable geolocation, microphone, camera |
| INFRA-08 | WAF deployment | OPEN | Infrastructure | AWS WAF or equivalent. Rate limiting: 100 req/min/IP |
| INFRA-09 | DDoS protection | OPEN | Infrastructure | CloudFront or Cloudflare in front of server |
| INFRA-10 | TLS 1.2 minimum enforced | OPEN | Infrastructure | Disable SSL 3.0, TLS 1.0, TLS 1.1 |
| INFRA-11 | Strong cipher suites only | OPEN | Infrastructure | Follow NIST SP 800-52 Rev 2 |

---

## Phase D - Audit Logging (BLOCKING)

| ID | Item | Status | Owner | Notes |
|----|------|--------|-------|-------|
| AUDIT-01 | Deploy backend logging endpoint | OPEN | Developer | Replace flushToBackend() stub in audit-log.ts |
| AUDIT-02 | Implement write-once log storage | OPEN | Infrastructure | Append-only S3 or equivalent |
| AUDIT-03 | Include user identity in audit records | OPEN | Developer | Requires CAC (AUTH-05) |
| AUDIT-04 | Log all authentication events | OPEN | Developer | Success, failure, cert expiry, tamper |
| AUDIT-05 | Log all export events | PARTIAL | Developer | EXPORT_PDF, EXPORT_DOCX implemented in client |
| AUDIT-06 | Log all role changes | PARTIAL | Developer | ROLE_CHANGE, ROLE_TAMPER_DETECTED implemented |
| AUDIT-07 | Log all page views | OPEN | Developer | Wire logAuditEvent("PAGE_VIEW") to layout |
| AUDIT-08 | 1-year log retention | OPEN | Infrastructure | NIST 800-53 AU-11 |
| AUDIT-09 | Log integrity protection | OPEN | Infrastructure | Digital signatures or immutable storage |
| AUDIT-10 | Audit review process established | OPEN | ISSO | Weekly review minimum |
| AUDIT-11 | Automated alerting on anomalies | OPEN | Infrastructure | Alert on: ROLE_TAMPER, bulk exports, off-hours access |

---

## Phase E - Data Protection

| ID | Item | Status | Owner | Notes |
|----|------|--------|-------|-------|
| DATA-01 | OPSEC review of unit address data | OPEN | OPSEC Officer | units.ts contains 1000+ unit addresses/UICs |
| DATA-02 | Classify all content pages | OPEN | ISSO/Owner | Mark each page: Unclassified, CUI, or CUI//FOUO |
| DATA-03 | Implement CUI handling procedures | OPEN | Owner | Dissemination controls, handling notices |
| DATA-04 | PII handling notices on personnel pages | OPEN | Developer | Pages referencing SSN, pay, medical |
| DATA-05 | CUI marking verification | PARTIAL | Developer | Global CUI banner implemented. Page-level marks needed. |
| DATA-06 | Restrict CUI export to authenticated users | OPEN | Developer | Gate PDF/DOCX generation behind CAC auth |
| DATA-07 | Privacy impact assessment | OPEN | Privacy Officer | Required for system handling PII |

---

## Phase F - Vulnerability Management

| ID | Item | Status | Owner | Notes |
|----|------|--------|-------|-------|
| VULN-01 | npm audit - no high/critical vulns | PARTIAL | Developer | Runs in CI. Verify clean before ATO. |
| VULN-02 | SAST tool integration | OPEN | Developer | Add CodeQL or Semgrep to CI pipeline |
| VULN-03 | Dependency pin review | OPEN | Developer | Review all dependencies in package-lock.json |
| VULN-04 | Penetration test | OPEN | Red Team | Required for MODERATE system before ATO |
| VULN-05 | Remediate pen test findings | OPEN | Developer | All critical/high findings closed before ATO |
| VULN-06 | Quarterly vulnerability scan schedule | OPEN | ISSO | Establish recurring scan cadence |
| VULN-07 | Patch timeline defined | OPEN | ISSO | Critical: 15 days; High: 30 days; Medium: 90 days |

---

## Phase G - Incident Response

| ID | Item | Status | Owner | Notes |
|----|------|--------|-------|-------|
| IR-01 | Develop Incident Response Plan | OPEN | ISSO | Per NIST SP 800-61 Rev 2 |
| IR-02 | Define incident categories | OPEN | ISSO | Security event, breach, availability loss |
| IR-03 | Define escalation paths | OPEN | ISSO | Include DISA, CyberCom notification |
| IR-04 | 60-minute DISA breach notification | OPEN | ISSO | Per DoD requirement |
| IR-05 | Tabletop exercise | OPEN | Team | Conduct before ATO |
| IR-06 | Contact list current | OPEN | ISSO | DISA ACAS, CyberCom, unit ISSM chain |

---

## Phase H - Training

| ID | Item | Status | Owner | Notes |
|----|------|--------|-------|-------|
| TRAIN-01 | System-specific security training for users | OPEN | ISSO | CUI handling, authorized use |
| TRAIN-02 | Developer security training | OPEN | Developer | OWASP, secure coding per DoD 8140 |
| TRAIN-03 | ISSO annual security training | OPEN | ISSO | DoD 8140 role-based training |

---

## ATO Submission Package

The following documents must be complete and approved before ATO submission to the AO:

- [ ] System Security Plan (SSP) - signed by System Owner
- [ ] Risk Assessment (RA) per NIST 800-30
- [ ] Security Assessment Report (SAR)
- [ ] Plan of Action and Milestones (POA&M) - all BLOCKING items closed
- [ ] Penetration test report - all critical/high closed
- [ ] Privacy Impact Assessment (PIA)
- [ ] Interconnection Security Agreements (ISAs) - if applicable
- [ ] Continuous Monitoring Plan
- [ ] Contingency Plan per NIST 800-34

**ATO cannot be granted while BLOCKING items are open.**

---

## Summary

| Phase | Total | Complete | Partial | Open |
|-------|-------|----------|---------|------|
| A - Governance | 8 | 0 | 0 | 8 |
| B - Authentication | 13 | 0 | 0 | 13 |
| C - Infrastructure | 11 | 0 | 0 | 11 |
| D - Audit Logging | 11 | 0 | 2 | 9 |
| E - Data Protection | 7 | 0 | 1 | 6 |
| F - Vulnerability Management | 7 | 0 | 1 | 6 |
| G - Incident Response | 6 | 0 | 0 | 6 |
| H - Training | 3 | 0 | 0 | 3 |
| **Total** | **66** | **0** | **4** | **62** |

**Current ATO readiness: 6%. Not ready for production deployment.**

---

**CONTROLLED UNCLASSIFIED INFORMATION (CUI)**
