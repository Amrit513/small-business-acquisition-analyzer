import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/", name: "Acquisition Lens", short_name: "Acquisition Lens",
    description: "A local-first educational workspace for small business acquisition screening.",
    start_url: "/", scope: "/", display: "standalone", background_color: "#f5f7f8", theme_color: "#0b5142",
    icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }],
  };
}
