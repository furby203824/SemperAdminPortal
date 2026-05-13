/**
 * CAC/PKI authentication interface scaffold.
 *
 * This module defines the types and integration points needed for CAC-based
 * authentication per DODI 8520.01 and DoD cybersecurity strategy.
 *
 * Current state: stub only. The application runs as a static site without a
 * backend. Full CAC implementation requires:
 *   1. A server (Node.js, Go, etc.) that can parse TLS client certificates.
 *   2. Integration with DISA ICAM (Identity, Credential and Access Management).
 *   3. SAML 2.0 or OpenID Connect middleware wired to the DoD PKI root CAs.
 *
 * Implementation path:
 *   1. Deploy to a server that supports TLS mutual auth (not GitHub Pages).
 *   2. Configure Nginx/Apache to request client cert, forward via header:
 *        ssl_client_cert /etc/ssl/dod-root-cas.pem;
 *        proxy_set_header X-Client-Cert $ssl_client_escaped_cert;
 *   3. Implement parseCACCert() using the forwarded header.
 *   4. Validate cert chain against DoD root CAs bundled at src/lib/security/dod-roots.pem.
 *   5. Extract identity from Subject DN: CN=LAST.FIRST.MI.EDIPI, OU=PKI, O=U.S. Government.
 *   6. Map identity to Role using RBAC rules below.
 */

export interface CACIdentity {
  /** EDIPI (DoD ID number, 10 digits). */
  edipi: string;
  /** Given name from cert Subject. */
  givenName: string;
  /** Surname from cert Subject. */
  surname: string;
  /** Affiliation (USA, USMC, USN, DoD, etc.). */
  affiliation: string;
  /** Certificate serial number for audit logging. */
  certSerial: string;
  /** Certificate expiry (epoch ms). */
  certExpiry: number;
}

export type AuthStatus = "unauthenticated" | "authenticated" | "cert_expired" | "cert_invalid";

export interface AuthResult {
  status: AuthStatus;
  identity?: CACIdentity;
  error?: string;
}

/**
 * RBAC mapping: DoD affiliation + rank/grade patterns to portal roles.
 * Extend with unit-level permissions once backend is in place.
 */
export const AFFILIATION_ROLE_MAP: Record<string, string[]> = {
  USMC: ["marine", "leader", "commander", "admin"],
  USN: ["marine", "admin"],
  DoD: ["marine"],
};

/**
 * Stub: parse and validate a CAC certificate from a TLS client cert header.
 * Replace with real X.509 parsing when running on a server.
 */
export function parseCACCert(_certHeader: string): AuthResult {
  // Not implementable in a static site context.
  // This stub exists so TypeScript enforces the contract when backend lands.
  return {
    status: "unauthenticated",
    error: "CAC authentication requires a server. Static export does not support TLS client certs.",
  };
}

/**
 * Returns true if the cert is within its validity window.
 * Reject within 24h of expiry to prompt renewal.
 */
export function isCertValid(identity: CACIdentity): boolean {
  const buffer = 24 * 60 * 60 * 1000;
  return Date.now() < identity.certExpiry - buffer;
}
