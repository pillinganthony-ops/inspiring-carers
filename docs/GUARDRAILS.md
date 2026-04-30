# 🧱 Inspiring Carers — Guardrails & Build Rules

## 1. Core Principle

This platform must be built with:

- Consistency
- Scalability
- Control

No change should:
- Break existing working systems
- Introduce duplicate patterns
- Create UX or architectural drift

---

## 2. Protected Sections

### Walks — Protected Experience System

Walks is a standalone experience layer.

Do NOT modify:
- Walk cards
- Walk layout
- Walk map behaviour
- Walk UX patterns

Only change Walks when explicitly instructed.

### Find Help — Protected Directory System

Find Help is the core support/service directory layer.

Do NOT modify:
- Card design
- Layout
- Data structure
- Filtering logic

Only change Find Help when explicitly instructed.

---

## 3. County Page System

All county pages must operate as synchronised systems.

If a structural or visual change is made to one page in a system group, it must be applied across equivalent pages unless explicitly instructed otherwise.

### Group A — Discovery System

Applies to:
- Things to Do
- Places to Visit
- Wellbeing

These pages must remain structurally aligned.

Current shared components:
- CountyHero
- DiscoveryCard
- FilterStrip
- Sponsor/CTA strip pattern

### Group B — Events System

Events is a dedicated system.

Rules:
- Events must be consistent across all counties
- Events can differ from Discovery pages
- Events must follow one unified Events template

### Group C — Experience System

Applies to:
- Walks
- Future experience-led pages

Rules:
- Trust-first
- Wellbeing-led
- Soft partnership language, not hard sponsor language

### Group D — Directory System

Applies to:
- Find Help

Rules:
- Trust-first
- Practical support focused
- Monetisation must not undermine confidence

---

## 4. Source of Truth

### Discovery Pages

Places to Visit is the gold standard for:
- Hero structure
- Page rhythm
- Spacing
- Sponsor/CTA placement

### Experience Pages

Walks is the gold standard for:
- Immersive experience
- Wellbeing tone
- Trust-first design

### Directory Pages

Find Help is protected and treated separately.

---

## 5. PageShell Direction

Future architecture should move toward a reusable PageShell system.

PageShell should control:
- Layout
- Spacing
- Section order
- Visual rhythm

PageShell must NOT own:
- Data fetching
- Supabase logic
- Filtering logic
- Map state
- Click handlers
- Business rules

Target structure:

- CountyHero
- Partner/Sponsor strip
- Filter area
- Content area
- Empty state

Do NOT build or force PageShell unless explicitly instructed.

---

## 6. Card System Rules

DiscoveryCard applies to:
- Things to Do
- Places to Visit
- Wellbeing

Required card structure:
- Top accent strip
- Title around 16.5px
- Bold title weight
- Description
- Tags
- CTA area
- Optional footer

Events may use EventCard variation.

Walks and Find Help cards are protected.

---

## 7. Filter System Rules

FilterStrip supports:
- vertical mode
- horizontal mode

Vertical mode is suitable for sidebar/card filtering.
Horizontal mode is suitable for compact sticky filter bars.

Do not force one mode across all pages if it damages UX.

---

## 8. Maps & API Infrastructure

Do NOT modify unless explicitly instructed:
- Google Maps loader
- API key structure
- Environment variables
- Marker clustering
- Map initialisation

Current standard:

```js
id: "inspiring-carers-google-maps"
libraries: ["places"]
```

---

## 9. Backend Protection

Do NOT modify unless explicitly instructed:

- Supabase schema
- SQL
- RLS policies
- Database structure
- Auth policies
- Environment variables

If SQL/backend changes are needed, stop and report before making changes.

---

## 10. Navigation & Routing

Two-layer structure:

**Platform Layer**

Top navigation for:

- Business
- Benefits
- Platform features

**County Layer**

County exploration navigation for:

- Things to Do
- Places
- Wellbeing
- Walks
- Events

Rules:

- No duplicate navigation systems
- No routing changes unless explicitly instructed
- Legacy routes must remain safe where possible

Current naming rule:

- User-facing route should use `/things-to-do`
- Legacy `/activities` should remain supported unless explicitly removed

Breadcrumb rule:

- Inside county routes, "Home" should route to the county landing page
- County crumb should route to the county landing page
- Global home/logo should route to `/`

---

## 11. Sponsor / Partnership Rules

Discovery and Events pages may use commercial sponsor language.

Walks and Find Help must use trust-first language.

Correct sponsor placement:

- Below hero
- Dedicated strip
- Not inside hero

Forbidden:

- Sponsor content inside hero
- Hard advert language on Walks or Find Help
- One-off sponsor strip designs

When changing sponsor/partner copy on one equivalent page, update all equivalent pages unless explicitly instructed otherwise.

---

## 12. Working Method

Always:

- Inspect before editing
- Compare against the relevant system standard
- Report differences
- Apply the smallest safe fix
- Run build

Never:

- Jump straight to coding
- Redesign without instruction
- Make assumptions
- Apply broad refactors without approval

---

## 13. Scope Control

Every task must:

- Define files in scope
- Avoid unrelated edits
- Prevent ripple effects

Protected areas must stay untouched unless explicitly requested.

---

## 14. Build Discipline

After every code change:

```
npm run build
```

Validate:

- No console errors
- No layout breakage
- No regression

---

## 15. Change Classification

Allowed:

- Alignment
- Spacing fixes
- Visual consistency
- UX polish
- Safe shared component extraction

Requires explicit approval:

- New features
- Routing changes
- Backend changes
- SQL changes
- Map changes
- Auth changes
- Major layout changes

---

## 16. Stop Condition

If any change:

- Risks protected sections
- Conflicts with the system rules
- Introduces inconsistency
- Requires backend/schema changes
- Touches maps/API config unexpectedly

**STOP and report before proceeding.**

---

## Final Principle

This is not a set of pages.

It is a scalable platform system.

> Consistency > Creativity
> Control > Speed
> System > One-off fixes
