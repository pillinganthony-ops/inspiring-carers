🧱 1. Core Principle

All UI must be built from reusable system components, not page-specific code.

👉 No page should define its own:

Hero
Cards
Filters
CTA strips
🧭 2. Component Hierarchy (Top Level)
Tier 1 — Structural Components

Used across ALL county pages:

CountyHero
FilterStrip
CardGrid
EmptyState
SponsorStrip
Tier 2 — Content Components
DiscoveryCard
EventCard
WellbeingCard (optional variation)
Tag
StatItem
Tier 3 — Utility Components
Breadcrumb
SectionWrapper
Container
ButtonPrimary
ButtonSecondary
🥇 3. Source of Truth Mapping
Component	Source Page
CountyHero	Places to Visit
DiscoveryCard	Activities
SponsorStrip	Places/Activities
FilterStrip	Activities
EmptyState	Events (refined)
🧩 4. Component Definitions
🧭 CountyHero (CRITICAL COMPONENT)
Purpose

Controls ALL county page headers.

Props
{
  county,
  title,
  subtitle,
  eyebrow,
  stats, // optional array
  showBreadcrumb: true
}
Structure
Breadcrumb
Eyebrow pill
H1 title
Subtitle
Stats row (optional)
Bottom divider
Rules

✅ Must be identical across:

Things to Do
Places to Visit
Wellbeing

⚠️ Events can use variant but must share base structure

❌ No custom hero implementations allowed

🔍 FilterStrip
Purpose

Search + filters UI below hero

Structure
White background
Sticky (future)
Search input
Filters (optional)
Rules
Must sit below hero
Must not be embedded inside hero
🧱 CardGrid
Purpose

Standard layout for all listing pages

Rules
Consistent gap
Responsive grid
No custom layouts per page
🧩 DiscoveryCard (CORE)
Used in:
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
Fixed typography
Fixed spacing
No variation across pages
🎟 EventCard (Variant)
Differences from DiscoveryCard:
Time/date emphasis
Slight layout variation allowed
Must still follow:
Accent strip
Typography system
Padding rules
📢 SponsorStrip
Purpose

Monetisation + conversion layer

Structure
Headline
Description
Primary CTA
Secondary CTA
Placement
ALWAYS below hero
NEVER inside hero
🧊 EmptyState
Structure
Icon
Message
CTA
Rules
Same across all pages
No page-specific redesigns
🧠 5. System Rules
🔁 Reusability Rule

If the same UI appears twice:

👉 It must become a component

🧱 Duplication Rule

❌ Forbidden:

Copy-paste UI blocks across pages

✅ Required:

Extract into component
🔄 Update Rule

If you change:

CountyHero
Card
FilterStrip

👉 Change must propagate across ALL pages

🎯 Variation Rule

Allowed:

EventCard variation
Minor text differences

Not allowed:

Structural divergence
🚫 6. Anti-Patterns (Strictly Forbidden)
Page-specific hero builds
Inline card styling per page
Hardcoded spacing differences
Embedding filters inside hero
Sponsor content inside hero
⚙️ 7. Migration Strategy (Important)

You DO NOT refactor everything at once.