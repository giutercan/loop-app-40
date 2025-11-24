# Korn Ferry Value Lifecycle - Design Guidelines

## Design Approach

**System Foundation**: Carbon Design System
- Enterprise-grade system for data-heavy B2B SaaS requiring trust and professionalism
- Principles: Information density, structured hierarchy, systematic consistency, purposeful white space
- Enhanced with Korn Ferry's sophisticated brand identity and visual richness

## Color System

**Primary Brand Colors**:
- Deep Forest Green (#00634F): Primary actions, navigation headers, key CTAs
- Ocean Blue (#005971): Secondary actions, interactive elements, links
- Navy (#00173B): Footers, darkest backgrounds, high-contrast text backgrounds

**Accent Colors**:
- Emerald (#009B77): Success states, positive metrics, completed phases
- Mint (#05C690): Highlights, hover states on dark backgrounds, badges
- Lime Green (#8DC63F): Leading indicators, growth metrics, active states
- Cyan (#00ADBB): Information states, tooltips, secondary highlights
- Purple (#A3238E): Premium features, AI-powered indicators, special callouts

**Neutral Colors**:
- Gray (#929192): Borders, disabled states, secondary text
- Light Gray (#DAD8D6): Backgrounds, cards, section dividers

**Color Usage Rules**:
- White text on: Forest Green, Ocean Blue, Navy, Purple
- Black text (#00173B) on: Light Gray backgrounds, white cards, Lime Green, Mint, Cyan
- Gradients: Forest Green → Ocean Blue (headers), Emerald → Mint (success states), Ocean Blue → Purple (AI features)
- Section backgrounds: Alternate between white and Light Gray (#DAD8D6)

## Typography System

**Font Family**: IBM Plex Sans (Google Fonts CDN)
- Headings: 600 Semibold, 700 Bold
- Body: 400 Regular, 500 Medium
- Data: IBM Plex Mono 400 Regular

**Type Scale**:
- H1: text-5xl lg:text-6xl, font-bold, tracking-tight, text-navy
- H2: text-3xl lg:text-4xl, font-semibold, text-navy
- H3: text-xl lg:text-2xl, font-semibold, text-navy
- H4: text-lg font-medium, text-ocean-blue
- Body Large: text-base lg:text-lg, text-gray-900
- Body Standard: text-sm lg:text-base, text-gray-700
- Labels: text-xs lg:text-sm, font-medium, uppercase, tracking-wide, text-gray
- Data Values: text-2xl font-bold font-mono

## Layout System

**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16
- Micro: p-2, gap-2
- Standard: p-4, gap-4, space-y-4
- Sections: py-12 lg:py-16
- Major sections: py-16 lg:py-24

**Containers**: max-w-7xl for full sections, max-w-6xl for content, max-w-4xl for forms

## Component Library

### Landing Page

**Header**:
- Fixed navigation, h-16 lg:h-20, bg-forest-green with white text
- Logo left, nav center, dual CTAs right (solid Emerald + outline white)
- Trust badge: "Trusted by Fortune 500" with check icon, text-mint

**Hero Section** (80vh):
- Large hero image: Professional diverse business team in modern office, right 50%, rounded-lg corners, subtle shadow
- Left 50%: Headline (white text), subhead, dual CTAs with blurred button backgrounds (backdrop-blur-md bg-forest-green/80 for primary, bg-white/20 border-white for secondary)
- Background: gradient from Forest Green to Ocean Blue, or hero image spanning full width with overlay

**Phase Overview Cards** (3 tiles):
- Grid: grid-cols-1 md:grid-cols-3, gap-8
- Card backgrounds: White with border-light-gray, rounded-lg, p-8
- Phase badges: Forest Green (1), Ocean Blue (2), Purple (3), rounded-full, text-white, w-12 h-12
- Icons: Material Icons text-6xl in matching phase colors
- Hover: lift effect, subtle shadow increase, border color changes to phase color

**Trust Section**:
- Light Gray background, py-16
- Three columns: Responsible AI badge (Purple icon), Data Security (Forest Green shield), Analytics SLA (Cyan clock)
- Icons text-4xl, centered above text

**Footer**:
- Navy background, white text
- Three columns: Company (logo + tagline), Resources (links), Contact (form + info)
- Newsletter: inline form with Mint CTA button
- Social icons: Cyan on hover

### Portal Components

**Phase Navigation**:
- Breadcrumb with phase color coding
- Progress bar using phase color (Forest/Ocean/Purple)
- Action bar: Save Draft (outline Ocean Blue), primary CTA (solid phase color)

**Organization Card (Discovery)**:
- Large white card, border-light-gray, rounded-lg, p-8
- Header: Company name text-3xl text-navy, sector tag bg-mint text-black rounded-full
- Data grid: label text-gray uppercase, value text-navy font-semibold
- Confidence badges: pill shaped, High (bg-emerald text-white), Medium (bg-lime text-black), Low (bg-gray text-white)
- Revenue chart: Line graph with Ocean Blue line, Light Gray grid

**Value Hypothesis Builder**:
- Stepper: horizontal, connected by Forest Green lines, active step bg-forest-green text-white, completed bg-emerald, upcoming border-gray
- Form cards: white bg, clear labels text-navy, inputs border-gray focus:border-ocean-blue
- Summary sidebar: sticky, bg-light-gray, p-6, KPI list with Cyan highlights

**Strategic Challenge Mapping (Alignment)**:
- Wizard steps: Ocean Blue theme
- Problem cards: white, p-6, border-ocean-blue on selection, hover shadow
- Mapping interface: drag connections as Ocean Blue curved lines
- Job cards: bg-light-gray, rounded-lg, with Ocean Blue accent border-l-4

**KPI Selection**:
- Accordion: headers bg-light-gray, expanded content white
- Primary KPI cards: large, border-ocean-blue, checkmark icon bg-ocean-blue
- Supporting KPIs: checkbox cards with Cyan accent
- Default badge: bg-purple text-white, "KF Standard" label

**Timeline Editor (Realization)**:
- Purple theme for Phase 3
- Gantt chart: swimlanes with Light Gray backgrounds alternating
- Intervention cards: draggable, bg-white, border-purple, rounded
- Milestones: diamond shapes, bg-emerald
- Validation warnings: border-red with warning icon

**Dashboard KPI Cards**:
- White cards, border-light-gray, p-6, rounded-lg
- Metric value: text-4xl font-bold text-navy
- Trend icons: up arrow Emerald, down arrow Gray
- Sparkline: Lime Green line
- Baseline comparison: text-ocean-blue for delta

**Financial Appendix Table**:
- Sticky header bg-forest-green text-white
- Alternating row colors: white and bg-light-gray
- Key metrics: border-l-4 border-purple
- NPV values: font-mono text-2xl text-navy

### Buttons & Actions

**Primary**: bg-forest-green hover:bg-ocean-blue text-white px-6 py-3 rounded-lg font-medium
**Secondary**: border-2 border-ocean-blue text-ocean-blue hover:bg-ocean-blue/10 px-6 py-3 rounded-lg
**Success**: bg-emerald text-white
**AI Features**: bg-gradient-to-r from-ocean-blue to-purple text-white, with sparkle icon
**Danger**: bg-gray hover:bg-navy text-white

### State Indicators

- Draft: bg-lime/20 text-black border-l-4 border-lime, "DRAFT" badge
- Locked: bg-emerald/20 text-black border-l-4 border-emerald, lock icon
- Pending: bg-cyan/20 text-black border-l-4 border-cyan, "PENDING" badge
- AI-Powered: bg-purple/10 border-purple with sparkle icon

## Images

**Hero Section**: Large professional photograph (1920x1080 minimum) showing diverse business professionals collaborating in modern office. Natural lighting, authentic engagement. Position: right 50% of hero or full-width with gradient overlay (forest-green to ocean-blue, opacity 80%).

**Phase Cards**: Icon illustrations or abstract representations - Discovery (data visualization), Alignment (connected nodes), Realization (growth chart). Size: 96x96, phase color treatment.

**Trust Section**: Partner logos (grayscale), certification badges, security icons. Size: 120x60, centered.

**Dashboard**: Data visualization screenshots, chart examples using brand colors. Optional: small professional headshots for stakeholder assignments (48x48, rounded-full).

## Icons

Material Icons (outlined variant, CDN)
- Navigation: analytics, timeline, people, description
- States: check_circle (emerald), warning (lime), error (gray), lock (navy), auto_awesome (purple for AI)
- Actions: download, upload, edit, delete
- Sizes: text-xl inline, text-4xl features, text-6xl empty states

## Accessibility

- Labels always visible, never placeholder-only
- Error messages with icons, text-black on Light Gray bg-red-50
- Focus: ring-2 ring-ocean-blue ring-offset-2
- Color + icon/text for all states
- ARIA labels for icon buttons
- Minimum contrast ratios met (white on Forest Green = 4.5:1)

## Animations

Minimal usage:
- Card hover: translate-y-1, shadow increase
- Button hover: subtle scale or bg color shift
- Page transitions: fade-in
- No scroll animations
- Loading: spinner in button centers, skeleton screens for data cards