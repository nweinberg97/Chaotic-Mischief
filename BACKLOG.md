# Chaotic Mischief — Backlog

Ideas and to-dos, not commitments. Move items up as they become real priorities.

**Status key:** 🔴 blocking launch · 🟡 next up · ⚪ later · ✅ done

---

## 1. Launch blockers

| Status | Item | Notes |
| --- | --- | --- |
| 🔴 | Connect Stripe Payment Links ($5 coupons, $12 deck + coupons) | Upload both PDFs to Google Drive, create the links, paste into `src/config.ts` (see README → Selling it) |
| 🔴 | Switch GitHub Pages source to "GitHub Actions" | Settings → Pages. Removes the deploy race that caused the blank page |
| 🔴 | Trademark search for "Chaotic Mischief" | Before investing more in the name |
| 🔴 | Terms, privacy and refund policy pages | Needed once money changes hands |
| 🔴 | Contact email on the site | Shop FAQ currently says "reply to your Stripe receipt" |
| 🟡 | Kickstarter pre-launch page | Paste URL into `KICKSTARTER.url`; set `live: true` when pledges open |
| 🟡 | Email signup ("notify me about the boxed deck") | Static site, so use a hosted form (e.g. Buttondown, ConvertKit, Mailchimp embed) |
| 🟡 | Custom domain (e.g. chaoticmischief.com) | Works with GitHub Pages |
| 🟡 | Privacy-friendly analytics | Track visits → games started → games finished → purchases |

## 2. Brand and creative

| Status | Item | Notes |
| --- | --- | --- |
| 🟡 | Drop in final Canva card art, backs and illustrations | Swap tokens in `src/styles/tokens.css` and the card components |
| 🟡 | Licensed Glacial Indifference web font | Jost is the stand-in |
| ⚪ | Replace coupon emoji with custom illustrations | |
| ⚪ | Social share images (link previews) for the site | |
| ⚪ | Meme / video templates in brand style | From the Canva marketing ideas |

## 3. Game features

| Status | Item | Notes |
| --- | --- | --- |
| 🟡 | Decide free vs paid web game | Keep all 54 free, or a ~15-card free sample with full deck unlocked by purchase |
| 🟡 | Share-your-result card | "Our relationship status: Mark is 7 Chaos Credits ahead" image to post or send |
| 🟡 | Undo last move | For mis-taps on scoring buttons |
| ⚪ | Game length options | Quick game (to 11), standard (21), marathon (31) |
| ⚪ | House-rule toggles | Turn off a category, no skip penalty, etc. |
| ⚪ | Write-your-own cards | Couples add inside-joke cards to their deck |
| ⚪ | Game history and lifetime stats | Wins, favourite cards, total Chaos Credits |
| ⚪ | Sound effects and haptics | Card flip, credit burst, Highway Robbery siren |
| ⚪ | Works offline / installable app (PWA) | Home-screen icon already added |
| ⚪ | Two-phone mode | Each player keeps secret cards on their own phone |
| ⚪ | Couple profiles and saved games | Needs accounts and a backend |

## 4. Expansions and products

| Status | Item | Notes |
| --- | --- | --- |
| ⚪ | Expansion packs | Road Trip, Double Date, Holiday, After Dark |
| ⚪ | Physical boxed deck | Print-on-demand quotes, box design, Kickstarter video |
| ⚪ | QR code on physical cards → digital version | |
| ⚪ | Etsy listing for the printable deck | |
| ⚪ | Gift bundle (deck + printed coupon book) | Holiday / Valentine's |
| ⚪ | Date-night recommendations | Based on cards a couple liked |

## 5. Marketing

| Status | Item | Notes |
| --- | --- | --- |
| 🟡 | Playtest with 10–20 couples | Film reactions (with permission) |
| 🟡 | Content calendar (TikTok / Reels / Shorts) | "POV: date night plans cancelled", chaos-card reactions, card of the day |
| 🟡 | Creator seeding | Free decks + affiliate cut for 10–20 small couple creators |
| ⚪ | Holiday gift push (Nov–Dec) | "Stocking stuffer for couples" |
| ⚪ | Valentine's push (Jan–Feb) | Biggest moment of the year for the category |
| ⚪ | Collect testimonials for the site | |

## 6. Technical

| Status | Item | Notes |
| --- | --- | --- |
| 🟡 | Commit a package lockfile | Run `npm install` locally once and commit `package-lock.json` |
| ⚪ | End-to-end tests (Playwright) | Setup → play → win → coupons |
| ⚪ | Verified downloads | Small serverless function that checks the Stripe payment before serving the file, if link-sharing becomes a problem |
| ⚪ | Sales tax handling | Stripe Tax, or move to a merchant-of-record checkout as sales grow |

---

## Done ✅

- Playable web game: 54 cards, 7 card types, secret cards, chaos effects, scoring to 21, winner screen
- Landing page, deck explorer, coupon book preview, Shop page, thank-you page
- Printable coupons for winners, upsell on winner screen
- Print-ready PDFs: full deck (fronts + backs, crop marks) and coupon book
- Self-hosted brand fonts, tab and home-screen icons
- Restart button, "start a fresh game" option
- Auto-deploy to GitHub Pages with tests on every push
