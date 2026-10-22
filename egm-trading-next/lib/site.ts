export const site = {
  name: "EGM Trading",
  phone: "07534 704027",
  phoneHref: "tel:+447534704027",
  // AI chat assistant (floating button + panel). Off until it's ready to go live.
  chat: false,
  // Social previews need absolute URLs — set NEXT_PUBLIC_SITE_URL to the live domain.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: "EGM Trading — Pre-owned cars bought & sold in London",
  description: "Hand-picked pre-owned cars at straight prices. Send an enquiry or make an offer, or get a price for your car.",
};
