import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/", name: "Acquisition Lens", short_name: "Acquisition Lens",
    description: "A private workspace for small business acquisition analysis.",
    start_url: "/", scope: "/", display: "standalone", background_color: "#f4f7f6", theme_color: "#0a5c4f",
    icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }],
  };
}
