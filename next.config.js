/** @type {import('next').NextConfig} */
const wcHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_WC_URL || "https://houseofparampara.net";
    return new URL(url).hostname;
  } catch {
    return "houseofparampara.net";
  }
})();

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: wcHost },
      { protocol: "http", hostname: wcHost },
      { protocol: "https", hostname: "**.wp.com" },
      { protocol: "https", hostname: "**.woocommerce.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "i1.wp.com" },
      { protocol: "https", hostname: "i2.wp.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

module.exports = nextConfig;
