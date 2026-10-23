# EGM Trading — design handoff

Reference for building/extending the site. The code in this repo already implements it; use this when adding features.

## Files in /design
- `mockup.html` — interactive design mockup (open in a browser; keep the `assets/` folder next to it). Source of truth for look and chat behaviour.
- `screens/` — desktop reference captures (hero, stock, sell).

## Audience & goal
- ~80% mobile. Primary goal: **callback requests**. Every block ends in one action that opens the chat assistant.
- Secondary: "Sell your car" leads (EGM buys cars too).

## Breakpoints
| Width | Layout |
|---|---|
| < 640 | 1-col stock, chat = bottom sheet (full width, 88svh) |
| 640–1023 | 2-col stock, chat = 400px panel bottom-right |
| ≥ 768 | Nav adds "Sell your car" + full phone number; sell strip = 4 cols |
| ≥ 1024 | 3-col stock. Content max-width 1200px, side padding 72px |

## Sections (top → bottom)
1. **Nav** — sticky, paper ground, hairline bottom. Brand left; Stock / Sell / Call right. Call = `tel:` link.
2. **Hero (1a)** — full-bleed `/hero.avif`, duotoned steel, bottom scrim `steel-900` 95% → 55% @45% → transparent @75%. Height `min(84svh, 760px)`, content bottom-aligned. H1 `clamp(44px, 11vw, 96px)`, line-height 0.98, max 12ch, two lines. CTAs: **View stock** (primary, anchors `#stock`) + **Sell your car** (outline on dark, opens sell chat). Min height 52px, each `flex: 1 1 160px; max-width: 260px`.
3. **Stock** — kicker "01 · In stock now" + 1px rule + H2. Cards = `<Blueprint>` (hairline + "+" corners, no fill).
   - Carousel: 4:3, CSS scroll-snap (`snap-mandatory`, `snap-always`), swipe on touch, arrows 40px, counter chip top-left ("1 / 7"), bar dots bottom (active 18px, others 6px @55%). Single-photo cars hide all controls.
   - Body: meta kicker (year · colour · body), name + price (Barlow Condensed 26px), detail line, **Request a callback** (primary, 50px, full width), **Ask a question** (ghost).
   - Stock photos are true colour on purpose (buyers judge paint). Hero stays duotone.
4. **Sell** — kicker "02 · We buy cars", 3 numbered steps + **Get an offer** primary in one framed strip.
5. **Footer** — brand, tagline, phone. Extra bottom padding on mobile so the FAB never covers content.

## Chat assistant
Floating **Chat** button (primary, 56px, bottom-right, safe-area aware) — hidden while panel is open. Backdrop `steel-900/35`, Esc / backdrop closes, body scroll locked.

Entry points → opening script:
- Car "Request a callback" → car summary pinned under header → "What's your first name?"
- Car "Ask a question" → free-text Q&A about that car (AI).
- "Sell your car" / "Get an offer" → "What are you selling?" → name flow.
- Floating button → chips: Request a callback / Sell my car / Ask a question.

Flow: `name → phone (validated UK mobile or landline) → ask`. There is no preferred-time step. A valid number is posted immediately to `/api/callback` as `{ name, phone, vehicle, carId }`. The reply says the request is registered. It does not promise that a call has started. Free text in `ask` step → POST `/api/chat` → `{reply}`; AI is instructed never to invent mileage/history/finance. If a callback is not yet registered, a "Request a callback" chip stays visible.
Bot messages: hairline bubble on `surface`, left. User: `steel-700` fill, paper text, right. Bot delay 650ms with "Typing…" indicator. Input is 16px (prevents iOS zoom), `type="tel"` on phone step.

## Design system (Industry)
- Colours: paper `#f2f2f3`, surface `#e9e9ea`, ink `#1d1f20`, line = ink @16%, steel `#5980a6` + ramp 100–900. No other hues.
- Type: Barlow Condensed 600 uppercase for headings/prices; Barlow 400/500 body. Kicker = 13px / 600 / 0.08em / uppercase / `steel-700`.
- Square corners everywhere. Cards/figures are line drawings with corner marks. The solid steel primary is the only filled object.
- Icons: Lucide, stroke 1.5. Focus: 2px steel outline, 2px offset.

## Open items
- Real prices, mileage, specs, phone number.
- Lead delivery from `/api/callback` (email/CRM/SMS) + rate limiting.
- Analytics: chat opened (with entry point + carId), callback booked.
- Optional: per-car detail pages, finance calculator, Google reviews strip — confirm with client first.
