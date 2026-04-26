# Routing Architecture Audit
_Generated from source — `src/main.jsx`, `src/components/Nav.jsx`, `src/components/pages/*`_

---

## 1. Route Definitions

All routing is custom `pushState`-based — no React Router. `parseRoute()` in `main.jsx` maps `window.location.pathname` → `{ page, county, slug }`.

| URL Pattern | `page` returned | `county` returned | Special logic |
|---|---|---|---|
| `/` | `home` | `null` | — |
| `/profile` | `profile` | `null` | — |
| `/profile/organisation` | `profile-org` | `null` | — |
| `/profile/posts` | `profile-posts` | `null` | — |
| `/profile/enquiries` | `profile-enquiries` | `null` | — |
| `/profile/settings` | `profile-settings` | `null` | — |
| `/reset-password` | `reset-password` | `null` | — |
| `/login` | `login` | `null` | — |
| `/admin` `/recognition` `/business` `/about` `/card` | key as-is | `null` | GLOBAL list — no county prefix |
| `/activities` | `activities` | `null` | Hub route |
| `/find-help` (1 segment) | `find-help` | `null` | Hub route — **requires `segs.length === 1`** |
| `/events` (1 segment) | `events` | `null` | Hub route |
| `/walks` (1 segment) | `walks` | `null` | Hub route |
| `/{county}` where county ∈ COUNTY_SLUGS | `home` | `{county}` | county homepage |
| `/{county}/{page}` | `{page}` | `{county}` | Standard county page |
| `/{county}/{page}/{slug}` | `{page}` | `{county}` | slug in `venueSlug` state |
| `/benefits` | `for-you` | `cornwall` | LEGACY redirect via `replaceState` |
| `/walks` (legacy flat) | `walks` | `cornwall` | LEGACY redirect via `replaceState` |
| anything else | `home` | `null` | — |

**COUNTY_SLUGS** (controls county prefix recognition): `cornwall, devon, dorset, somerset, bristol, wiltshire`  
**COUNTY_PAGES** (controls county prefix in navigate): `training, events, for-you, walks, places-to-visit, wellbeing, groups`  
⚠️ `find-help` is NOT in `COUNTY_PAGES` — it has its own navigate special case.

---

## 2. Page Components and Routing

| File | Component | URL(s) | Props from main.jsx | Load |
|---|---|---|---|---|
| `FindHelp.jsx` | `FindHelpV2` | `/{county}/find-help` (county set) | `onNavigate, session, county` | **Lazy** |
| `FindHelpLanding.jsx` | `FindHelpLandingPage` | `/find-help` (county null) | `onNavigate, session` | **Eager** |
| `EventsHub.jsx` | `EventsHubPage` | `/events` (county null) | `onNavigate, session` | **Eager** |
| `Events.jsx` | (default) | `/{county}/events` (county set) | `onNavigate, session, county` | **Lazy** |
| `Activities.jsx` | `ActivitiesPage` | `/activities`, `/{county}/activities` | `onNavigate, session, county` | **Lazy** |
| `Benefits.jsx` | (default) | `/{county}/for-you` | `onNavigate, session, county` | **Lazy** |
| `Walks.jsx` | (default) | `/walks`, `/{county}/walks` | `onNavigate, session, county` | **Lazy** |
| `PlacesToVisit.jsx` | (default) | `/{county}/places-to-visit` | `onNavigate, session, county, venueSlug` | **Lazy** |
| `WellbeingSupport.jsx` | (default) | `/{county}/wellbeing` | `onNavigate, session, county, venueSlug` | **Lazy** |
| `Groups.jsx` | `GroupsPage` | `/{county}/groups` | `onNavigate, session, county, venueSlug` | **Lazy** |
| `VenueProfile.jsx` | (default) | via venueSlug prop, not direct URL | `onNavigate, session, county` | **Lazy** |
| `Admin.jsx` | (default) | `/admin` | `onNavigate, session, sessionLoading` | **Lazy** |
| `Login.jsx` | (default) | `/login` | `onNavigate, session` | **Lazy** |
| `ResetPassword.jsx` | (default) | `/reset-password` | `onNavigate` | **Lazy** |
| `ProfileDashboard.jsx` | (default) | `/profile`, `/profile/*` | `onNavigate, session, section` | **Lazy** |
| `training` `recognition` `business` `about` `card` | `Placeholder` | respective flat URLs | `onNavigate, session, title, note` | Inline |
| `HomePage` (in main.jsx) | `HomePage` | `/` (default) | `onNavigate, tweaks` | Inline |

---

## 3. Navigation Entry Points

| File | Line | Trigger | Destination |
|---|---|---|---|
| `main.jsx` | 359 | LEGACY parseRoute (mount, cold load) | `replaceState` → `/cornwall/{page}` |
| `main.jsx` | 450 | `useEffect` — admin guard, no session | `replaceState` → `/login` |
| `main.jsx` | 458 | `useEffect` — admin guard, not allowlist | `replaceState` → `/profile` |
| `main.jsx` | 475 | `navigate('admin')`, no session | `pushState` → `/login` |
| `main.jsx` | 482 | `navigate('admin')`, not allowlist | `pushState` → `/profile` |
| `main.jsx` | 498/505 | `navigate('activities', null/undefined+no county)` | `pushState` → `/activities` |
| `main.jsx` | 509 | `navigate('activities', county)` | `pushState` → `/{county}/activities` |
| `main.jsx` | 523 | `navigate('find-help', county)` | `pushState` → `/{county}/find-help` |
| `main.jsx` | 526 | `navigate('find-help', null/undefined)` | `pushState` → `/find-help` |
| `main.jsx` | 539 | `navigate('events', county)` | `pushState` → `/{county}/events` |
| `main.jsx` | 542 | `navigate('events', null)` | `pushState` → `/events` |
| `main.jsx` | 553 | `navigate('walks', null)` | `pushState` → `/walks` |
| `main.jsx` | 576 | `navigate(key)` standard path | `pushState` → `/{effectiveCounty}/{key}` or `/{key}` |
| `Nav.jsx` | 149 | `handleNavigate(key)` — all generic buttons | calls `onNavigate(key)` |
| `Nav.jsx` | 155 | Activities label click | `onNavigate('activities', null)` |
| `Nav.jsx` | 160 | Find Help click | `onNavigate('find-help', null)` |
| `Nav.jsx` | 164 | Events click | `onNavigate('events', null)` |
| `FindHelp.jsx` | 3103 | `openResource(listing)` — listing card click | `pushState` → `/{county}/find-help/{slug}` |
| `FindHelp.jsx` | 3110 | `closeResource()` — back button in listing detail | `pushState` → `/{county}/find-help` |
| `FindHelp.jsx` | 1391 | Share action | `window.location.href = mailto:...` |
| `Events.jsx` | 301 | "View organisation" button click | `pushState` → `/find-help/{slug}` then **fires synthetic `dispatchEvent(new PopStateEvent('popstate'))`** |
| `Events.jsx` | 114 | Share action | `window.location.href = mailto:...` |
| `Activities.jsx` | 932 | venue card click | `onNavigate(dest, county, venue.slug)` |
| `Activities.jsx` | 1354 | county selector in hub | `onNavigate('activities', val)` |
| `Activities.jsx` | 1363–1365 | chip clicks | `onNavigate('places-to-visit'/'wellbeing'/'groups', county)` |
| `Activities.jsx` | 1681 | category card click | `onNavigate(cat.route, county)` |

⚠️ **`Events.jsx:301`** — manually fires `new PopStateEvent('popstate')` after `pushState`. This causes both `main.jsx`'s `onPop` handler AND `FindHelp.jsx`'s `onPop` handler to run. If the user has navigated through the Events page, this synthetic event will run `parseRoute` on the new URL and could override `page`/`county` state.

---

## 4. State Synchronisation

### `county` state — set at:

| Location | Line | How | Value |
|---|---|---|---|
| `main.jsx` useState init | 367–378 | cold load | from URL, or localStorage, or null |
| `main.jsx` popstate | 432 | browser back/forward | from URL (HUB_PAGES guard applied) |
| `main.jsx` navigate activities | 497/504/507 | navigate call | null or targetCounty |
| `main.jsx` navigate find-help | 521/525 | navigate call | explicitCounty or null |
| `main.jsx` navigate events | 537/541 | navigate call | explicitCounty or null |
| `main.jsx` navigate walks null | — | no setCounty | county NOT cleared for walks |
| `main.jsx` navigate standard | 573 | navigate call | effectiveCounty (if isCountyPage) |

### `page` state — set at:

| Location | Line | Trigger |
|---|---|---|
| `main.jsx` useState init | 365 | cold load from parseRoute |
| `main.jsx` popstate | 426 | browser back/forward |
| `main.jsx` admin guard effect | 449/457 | useEffect when admin access fails |
| `main.jsx` navigate (all paths) | 474/481/493/518/534/551/570 | every navigate call |

### URL — set at:

All `pushState`/`replaceState` calls listed in §3 above.

### ⚠️ Out-of-sync risks:

| Risk | Location | Description |
|---|---|---|
| **CONFIRMED** | `Events.jsx:301` | Synthetic `PopStateEvent` fires main.jsx popstate + FindHelp.jsx popstate simultaneously. If URL is `/find-help/{slug}` at that point, main.jsx will `setPage('home')` (unrecognised route) and `setCounty(null)` — overriding React state without a navigate call. |
| MEDIUM | `main.jsx:553` (walks, null) | `setPage('walks')` + `pushState('/walks')` but no `setCounty()` call — county state not cleared. If user was on `/{county}/walks`, county state stays set while URL says `/walks`. |
| LOW | `FindHelp.jsx:3110` | `closeResource()` pushes `/{county}/find-help` but does NOT call navigate — React `page`/`county` state unchanged. Only URL updates. Consistent until popstate fires. |

---

## 5. Side Effects on Mount/Unmount — Routing-Relevant Only

### `main.jsx`

| Effect | Deps | What it does |
|---|---|---|
| Auth listener | `[]` | Monitors `window.location.pathname` for `/reset-password`; no routing side effect |
| **popstate handler** | `[]` | Registers `onPop` → calls `parseRoute(pathname)` → sets `page`, `county`, `venueSlug`. Applies HUB_PAGES_POP guard. Syncs localStorage. |
| Events preload | `[page, county]` | `import('./Events.jsx')` when `page=events` and `county=null` — no routing effect |
| Admin redirect effect | `[page, sessionLoading, session, authRouteGraceUntil]` | `replaceState` to `/login` or `/profile` if admin access fails |

### `FindHelp.jsx` (`FindHelpV2`)

| Effect | Deps | What it does |
|---|---|---|
| **SEO** | `[county]` | Sets `document.title`, `meta[description]`, `link[canonical]`. Restores on unmount. No history/state change. |
| **Internal popstate** | `[]` | Registers own `onPop` → `setDetailSlug(getDetailSlugFromPath())`. Reads `window.location.pathname` directly. Runs alongside `main.jsx` popstate on every browser navigation. |

⚠️ **Two concurrent `popstate` handlers** — `main.jsx:onPop` and `FindHelp.jsx:onPop` both run on every `popstate` event (including the synthetic one from `Events.jsx:301`). They are independent and cannot block each other.

### `FindHelpLanding.jsx`

| Effect | Deps | What it does |
|---|---|---|
| SEO | `[]` | Sets `document.title`, `meta[description]`, `link[canonical]` to `/find-help` values. Restores on unmount. No history/state change. |

### `Nav.jsx`

No routing-relevant effects. Three effects: scroll listener (`[]`), session listener (`[sessionProp]`), click-outside (`[]`). None touch history or location.

---

## 6. Known Broken / Stale Code

| Location | Issue |
|---|---|
| `Events.jsx:301` | **⚠️ ACTIVE BUG** — fires synthetic `PopStateEvent('popstate')` after pushState. This triggers main.jsx's popstate handler with URL `/find-help/{slug}`, causing `parseRoute` to return `page:'home'` (unknown route) and overriding both `page` and `county` state unexpectedly. |
| `FindHelp.jsx:3110` | `closeResource()` calls `pushState` directly (not via navigate). URL becomes `/{county}/find-help` but React state is unchanged. Benign until next popstate. |
| `FindHelp.jsx:337` | `getDetailSlugFromPath()` regex `/\/find-help\/([^/?#]+)/i` — matches `/find-help/slug` and `/cornwall/find-help/slug` correctly after recent fix. |
| `main.jsx:553` | `navigate('walks', null)` — sets `page='walks'` and pushes `/walks` but does **not** call `setCounty(null)`. County state is not cleared. |
| `VenueProfilePage` | Imported (`React.lazy`) but no `case 'venue-profile'` in switch — it's rendered via prop passing from other pages, not direct routing. Not broken but unusual. |
| All imports | All 15 imported page files confirmed to exist on disk. No missing imports. |
| No `TODO`/`FIXME` comments found in any of the audited routing files. | — |
