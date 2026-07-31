import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.business.name,
    short_name: siteConfig.business.name,
    description: siteConfig.business.description,
    start_url: "/",
    display: "standalone",
    background_color: siteConfig.theme.colors.dark?.background ?? "#0c0d0f",
    theme_color: siteConfig.theme.colors.dark?.background ?? "#0c0d0f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
