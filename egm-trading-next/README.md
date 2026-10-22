# EGM Trading — landing page

Next.js (App Router) + Tailwind CSS v4. Mobile-first, built to turn visits into callback requests.

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY for AI chat answers (optional)
npm run dev
```

## Design reference

- `design/HANDOFF.md`: the full spec (layout, breakpoints, chat flow, tokens). Cursor should read it first.
- `design/mockup.html`: the interactive mockup. Open it in a browser with the `design/assets/` folder kept next to it.
- `design/screens/`: desktop reference screenshots.
- `.cursor/rules/design-system.mdc`: the visual rules, applied automatically in Cursor.

## Structure

```
app/
  page.tsx               Nav → Hero → Stock → Sell → Footer, wrapped in ChatProvider
  globals.css            Design tokens (@theme) + base styles
  api/chat/route.ts      AI answers to free-text questions (Anthropic Messages API)
  api/callback/route.ts  Validates a callback and inserts callback_requests
components/
  Chat.tsx               ChatProvider, useChat(), <ChatButton>, floating button + panel
  CarCard.tsx            Swipe carousel (scroll-snap) + callback CTA
  Hero.tsx, Stock.tsx, Sell.tsx, Nav.tsx, Footer.tsx
  ui/Blueprint.tsx       Hairline frame with "+" corner marks
  ui/icons.tsx           Lucide icons @ 1.5 stroke
lib/
  cars.ts                Stock data (placeholder prices)
  site.ts                Business name + phone (placeholder)
  ui.ts                  Class recipes: btn, kicker, container, duotone
public/cars/             Car photos, named {car-id}-{n}.jpg
public/hero.avif         Hero image
public/assets/           Logo lockups, favicons, app icons, og-image (1200×630)
public/favicon.ico       16/32/48 multi-size, built from assets/favicon-*.png
app/manifest.ts          Web app manifest (home-screen icons)
```

## Chat flow

Car card → "Request a callback" → first name → UK phone (validated). A valid number is posted immediately to `/api/callback` as `{ name, phone, vehicle, carId }`. There is no preferred-time step. The reply says the request is registered. It does not promise that a call has started. After that, free-text questions go to `/api/chat`. There's also a general entry point (the floating Chat button) and a "Sell your car" flow.

## Before launch

- [ ] Real phone number in `lib/site.ts`
- [ ] `NEXT_PUBLIC_SITE_URL` set to the live domain (social share previews need absolute URLs)
- [ ] Real prices, mileage and specs in `lib/cars.ts` (or load them from a feed)
- [ ] Deliver leads from `app/api/callback/route.ts` (DB, email, SMS or CRM)
- [ ] Rate-limit both API routes
- [ ] Analytics events on `open` (Chat.tsx) and successful callback requests
