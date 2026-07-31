import { defineSiteConfig } from "@atelier/core";

/**
 * ┌──────────────────────────────────────────────────────────────┐
 * │  MONOLITH — SITE CONFIGURATION                               │
 * │  Change this file to rebrand the entire template for a new   │
 * │  client. No component code needs to be touched.              │
 * └──────────────────────────────────────────────────────────────┘
 */
export const siteConfig = defineSiteConfig({
  business: {
    name: "Monolith",
    legalName: "Monolith Construction Group Inc.",
    tagline: "We build what outlasts us.",
    description:
      "Monolith Construction Group plans, engineers, and delivers commercial towers, infrastructure, and civic landmarks across nine countries. Fifty years on site. Zero appetite for shortcuts.",
    foundedYear: 1974,
    logo: {
      text: "MONOLITH",
      alt: "Monolith Construction Group",
    },
  },

  theme: {
    colors: {
      primary: "#FF5A1F", // safety orange — work in progress
      secondary: "#5B8DFF", // blueprint blue — the unbuilt
      accent: "#FFC42E", // hazard yellow — chevrons only
      background: "#0C0D0F",
      foreground: "#EDEEEF",
      dark: {
        background: "#0C0D0F",
        foreground: "#EDEEEF",
      },
    },
    radius: "none",
    defaultScheme: "dark",
  },

  contact: {
    phone: "+13125550144",
    phoneDisplay: "+1 (312) 555-0144",
    whatsapp: "+13125550144",
    whatsappGreeting: "Hello Monolith — I'd like to discuss a project.",
    email: "newwork@monolith.build",
    address: {
      street: "300 S Riverline Drive, Floor 41",
      city: "Chicago",
      region: "IL",
      postalCode: "60606",
      country: "US",
      mapsUrl: "https://maps.google.com/?q=300+S+Riverline+Drive+Chicago",
      mapsEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2970.4!2d-87.639!3d41.877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDUyJzM3LjIiTiA4N8KwMzgnMjAuNCJX!5e0!3m2!1sen!2sus!4v1610000000005",
      latitude: 41.877,
      longitude: -87.639,
    },
  },

  hours: [
    { days: "Monday – Friday", open: "08:00", close: "18:00" },
    { days: "Saturday", open: "09:00", close: "14:00", note: "Site visits by appointment" },
    { days: "Sunday", closed: true },
  ],

  social: {
    linkedin: "https://linkedin.com/company/monolith-construction",
    instagram: "https://instagram.com/monolith.build",
    youtube: "https://youtube.com/@monolithbuild",
    x: "https://x.com/monolithbuild",
  },

  seo: {
    url: "https://monolith.build",
    title: "Monolith — Construction & Engineering Group",
    titleTemplate: "%s — Monolith",
    description:
      "Commercial towers, infrastructure, and civic landmarks — planned, engineered, and delivered by Monolith Construction Group. 214 projects across nine countries since 1974.",
    keywords: [
      "construction company",
      "general contractor",
      "commercial construction",
      "infrastructure engineering",
      "design build firm",
    ],
    ogImage: "/og.jpg",
    locale: "en_US",
    schemaType: "GeneralContractor",
  },

  analytics: {
    googleAnalyticsId: "",
    metaPixelId: "",
    googleSiteVerification: "",
  },

  localization: {
    defaultLocale: "en",
    currency: { code: "USD", symbol: "$", position: "before", locale: "en-US", decimals: 0 },
  },

  navigation: [
    { label: "Projects", href: "/projects" },
    { label: "The firm", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Start a project", href: "/contact", cta: true },
  ],

  announcement: {
    enabled: false,
    text: "Vantage 88 topped out at 402 m — envelope now 61% complete.",
    href: "/projects",
    linkLabel: "Watch the build",
  },

  features: {
    whatsappFab: true,
    customCursor: true,
    nightMode: true, // day/night toggle on the project district map
  },
});
