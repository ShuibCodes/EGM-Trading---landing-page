// TODO: replace with the real number before launch.
export const site = {
  name: "EGM Trading",
  phone: "020 0000 0000",
  phoneHref: "tel:02000000000",
  // Social previews need absolute URLs — set NEXT_PUBLIC_SITE_URL to the live domain.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: "EGM Trading — Pre-owned cars bought & sold in London",
  description: "Hand-picked pre-owned cars at straight prices. Request a callback in under a minute, or get an offer for your car.",
};
