/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        // Restrict to this project's bucket only — prevents Next.js image
        // optimization being abused as a proxy for arbitrary Firebase Storage URLs.
        pathname: "/v0/b/green---world.firebasestorage.app/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent the page being embedded in an iframe (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          // Stop browsers from MIME-sniffing the content type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Force HTTPS for 1 year, include subdomains, opt into preload list.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Control referrer information sent to third parties.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict browser features we don't use.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy.
          // 'unsafe-inline' is required by Next.js (inline <style>/<script> tags).
          // 'unsafe-eval' is required by Firebase Auth SDK (used internally for
          // phone-auth recaptcha). Remove it if phone auth is not used.
          // Migrate to nonce-based CSP when Next.js nonce support is stable.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com",
              "frame-src https://green---world.firebaseapp.com",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
