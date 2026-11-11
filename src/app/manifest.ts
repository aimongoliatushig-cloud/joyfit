import type { MetadataRoute } from "next";

/** PWA manifest: утас/компьютер дээр «апп шиг» суулгах боломж олгоно. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Joyfit — AI хооллолтын төлөвлөгөө",
    short_name: "Joyfit",
    description: "Өөрийн мэдээллээ оруулаад AI-аар хувийн хооллолтын төлөвлөгөө гаргана.",
    lang: "mn",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    categories: ["health", "food", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
