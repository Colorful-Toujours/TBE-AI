import type { NextConfig } from "next";
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    // fallback：先匹配 app/api 下的 route（含 [id] 等动态路由），未命中再转发后端
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
