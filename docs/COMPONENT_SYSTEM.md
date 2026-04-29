🧩 Inspiring Carers — Component System Architecture
🔒 SYSTEM FILE — DO NOT IGNORE

All development must follow this document.

No page should implement its own UI patterns where a system component exists.

🧱 1. Core Principle

All UI must be built from reusable system components, not page-level implementations.

❌ Forbidden
Page-specific hero sections
Custom card layouts per page
Inline duplicated UI blocks
One-off design variations
✅ Required
Reuse shared components
Maintain system consistency
Update components centrally
🧭 2. Component Hierarchy
🥇 Tier 1 — Structural Components (Global)

Used across ALL county pages:

CountyHero
FilterStrip
CardGrid
EmptyState
SponsorStrip
🧩 Tier 2 — Content Components
DiscoveryCard
EventCard
Tag
StatItem
⚙️ Tier 3 — Utility Components
Breadcrumb
Container
SectionWrapper
ButtonPrimary
ButtonSecondary
🧠 3. Source of Truth
Component	Source Page
CountyHero	Places to Visit
DiscoveryCard	Activities
FilterStrip	Activities
SponsorStrip	PlacesToVisit
EmptyState	Events

👉 Places to Visit defines layout standards

🧭 4. CountyHero (CRITICAL)
Purpose

Controls ALL county page headers.

Props
{
  county,
  pageName,
  eyebrow,
  title,
  subtitle,
  stats, // optional array
  onNavigate,
  variant // optional (events)
}
Structure
Breadcrumb
Eyebrow pill
H1 title
Subtitle
Optional stats row
Divider
Rules
✅ Must match across:
Things to Do
Places to Visit
Wellbeing
⚠️ Events:
May use variant
Must keep same base structure
❌ Forbidden
Custom hero per page
Two-column hero layouts
Sponsor content inside hero
🔍 5. FilterStrip
Purpose

Search + filter layer below hero

Structure
White background
Search input
Filters (optional)
Rules
✅ Must:
Sit directly below hero
Be consistent across pages
❌ Forbidden
Embedding inside hero
Page-specific versions
🧱 6. CardGrid
Purpose

Standard layout for all listings

Rules
Consistent spacing
Responsive grid
No custom layouts per page
🧩 7. DiscoveryCard (CORE COMPONENT)
Used in
Things to Do
Places to Visit
Wellbeing
Structure
Accent top strip
Title
Description
Tags
CTA
Rules
✅ Must:
Use consistent typography
Use consistent spacing
Use consistent hover behaviour
❌ Forbidden
Multiple card styles
Different layouts per page
🎟 8. EventCard (Variant)
Differences
Includes date/time emphasis
Slight structural variation allowed
Rules
✅ Must still follow:
Accent strip
Typography system
Padding rules
❌ Forbidden
Fully custom layout
Breaking visual consistency
📢 9. SponsorStrip
Purpose

Monetisation + conversion layer

Structure
Headline
Description
Primary CTA
Secondary CTA
Placement
✅ Must:
Sit below hero
❌ Forbidden
Inside hero
Mixed with content
Multiple styles
🧊 10. EmptyState
Structure
Icon
Message
CTA
Rules
Must be consistent across pages
No custom versions
🔁 11. System Rules
Reusability Rule

If UI appears more than once:

👉 It MUST become a component

Duplication Rule
❌ Forbidden
Copy/paste UI blocks
✅ Required
Extract into shared component
Update Rule

If you update:

CountyHero
Cards
FilterStrip

👉 Change must apply across ALL pages

Variation Rule
Allowed
EventCard variation
Minor text differences
Not allowed
Structural divergence
🚫 12. Anti-Patterns
Page-specific hero builds
Inline styling per page
Hardcoded spacing differences
Filters inside hero
Sponsor inside hero
⚙️ 13. Migration Strategy
Phase 1 (Complete)
Visual alignment across pages
Phase 2 (Now)
Extract:
CountyHero
DiscoveryCard
FilterStrip
Phase 3
Replace all page-level implementations
🔥 14. Why This Exists

Without this system:

UI drift returns
Changes require multiple edits
Bugs increase
Scaling breaks

With this system:

One change → global update
Faster development
Cleaner architecture
Scalable across counties
🚀 15. Execution Rule

At the start of every build task:

Follow the guardrails defined in /docs/GUARDRAILS.md and /docs/COMPONENT_SYSTEM.md