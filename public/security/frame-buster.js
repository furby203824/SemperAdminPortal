// Clickjacking protection. Redirects top frame to this page if loaded inside a frame.
// Required because frame-ancestors CSP directive cannot be set via meta tag on static hosts.
if (window.top !== window.self) {
  window.top.location = window.self.location;
}
