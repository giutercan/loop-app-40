# Korn Ferry Value Lifecycle - Design Guidelines

## Design Approach

**System Foundation**: Carbon Design System
- Rationale: Enterprise-grade system purpose-built for data-heavy applications, complex workflows, and B2B SaaS products requiring trust and professionalism
- Key principles: Information density, structured hierarchy, systematic consistency, and purposeful white space

## Typography System

**Font Family**: IBM Plex Sans (via Google Fonts CDN)
- Headings: IBM Plex Sans (600 Semibold, 700 Bold)
- Body: IBM Plex Sans (400 Regular, 500 Medium)
- Data/Code: IBM Plex Mono (400 Regular)

**Type Scale**:
- Hero/H1: text-5xl lg:text-6xl, font-bold, tracking-tight
- Section Headers/H2: text-3xl lg:text-4xl, font-semibold
- Card Headers/H3: text-xl lg:text-2xl, font-semibold
- Subsections/H4: text-lg font-medium
- Body Large: text-base lg:text-lg
- Body Standard: text-sm lg:text-base
- Captions/Labels: text-xs lg:text-sm, font-medium, uppercase tracking-wide
- Data Values: text-2xl font-bold (for KPIs), font-mono for numbers

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing (within components): p-2, gap-2
- Standard spacing (between elements): p-4, gap-4, space-y-4
- Section spacing: py-12 lg:py-16, px-4 lg:px-8
- Large spacing (between major sections): py-16 lg:py-24

**Container Strategy**:
- Full-width sections with inner max-w-7xl mx-auto
- Content areas: max-w-6xl
- Forms and wizards: max-w-4xl
- Data tables: w-full with horizontal scroll on mobile

**Grid Systems**:
- Phase overview cards: grid-cols-1 md:grid-cols-3
- Data cards: grid-cols-1 lg:grid-cols-2
- Dashboard metrics: grid-cols-2 lg:grid-cols-4
- Evidence items: grid-cols-1 gap-4

## Component Library

### Navigation & Structure

**Landing Page Header**:
- Fixed top navigation with max-w-7xl container
- Logo left, navigation links center, dual CTAs right
- Height: h-16 lg:h-20
- Trust indicator: "Trusted by Fortune 500 Companies" badge with icon
- Sticky on scroll with subtle shadow

**Phase Navigation (Portal Headers)**:
- Breadcrumb trail showing: Landing > Phase Name > Current Step
- Progress indicator for multi-step workflows
- Phase badge with number (1, 2, 3) and status
- Action bar with Save Draft, Export, and primary CTA

**Footer**:
- Three-column layout: Company info, Resources (Docs, Responsible AI, Analytics SLA), Contact
- Newsletter signup with inline form
- Legal links and copyright
- Padding: py-12, border-t

### Landing Page Sections

**Hero Section** (80vh):
- Two-column split: Left 60% content, Right 40% video/demo embed
- Headline + Subhead + Dual CTAs (Primary: solid button, Secondary: outline button)
- Explainer video embed (16:9 aspect ratio, rounded corners)
- Background: subtle gradient or abstract data visualization pattern

**Phase Overview Cards** (Three tiles):
- Card design: border, rounded-lg, p-8, hover lift effect (translate-y-1)
- Icon at top (96x96 or text-6xl from Material Icons)
- Phase number badge (1/2/3)
- Title: text-2xl font-semibold
- Description: 2-3 sentences explaining outcomes
- "Learn More" link at bottom

**Legal & Trust Section**:
- Single row with three columns: Responsible AI badge, Data Policy summary, Security certifications
- Icons with brief text, "Read Full Policy" links
- Light background differentiation

### Forms & Input Components

**Organization Card** (Phase 1):
- Large card with header section showing company name, logo placeholder, sector tag
- Grid of data points: each in own cell with label + value + confidence badge
- Provenance links (underlined, with external link icon)
- Revenue chart visualization (small line graph)
- Recent headlines as expandable accordion list

**Confidence Badges**:
- Pill-shaped badges: rounded-full, px-3, py-1, text-xs
- Three states: High (green icon), Medium (amber icon), Low (red icon)
- Icon from Material Icons: check_circle, warning, error

**Live Note Capture Interface**:
- Split layout: Freeform notes (left 60%), Structured fields (right 40%)
- Freeform: textarea with rich text toolbar, auto-save indicator
- Structured: form fields with clear labels, dropdown for stakeholders
- Tag system: chips with x to remove
- Transcription toggle with privacy notice

**Value Hypothesis Builder**:
- Stepper interface showing 5 steps horizontally
- Each step: form card with clear instructions
- Job selection: radio buttons with job descriptions
- KPI picker: searchable dropdown with definitions on hover
- Exposure editor: number input with unit selector, provenance display below
- Summary card on right showing selections in real-time

### Customer Portal Components (Phase 2)

**Strategic Challenge Mapping**:
- Wizard with numbered steps (1, 2, 3)
- Problem selection: large clickable cards (grid-cols-1 md:grid-cols-2)
- Mapping interface: drag-and-drop connections from problems to Korn Ferry jobs
- "Why this matters" text area for each mapping

**KPI Selection Interface**:
- Accordion for each selected problem
- Primary KPI: large radio button cards with metric name, definition, default unit
- Supporting KPIs: checkbox cards (select 2)
- Edit definitions: modal with form fields
- Defaults clearly labeled as "Korn Ferry Standard"

**Baseline Confirmation**:
- Prominent card with warning border
- Exposure data display with provenance table
- Large checkbox: "I confirm this baseline is accurate"
- Email confirmation section showing sent status
- Lock icon and timestamp when confirmed
- Disabled state until confirmation complete

**Timeline Editor**:
- 12-month horizontal gantt chart
- Drag-and-drop intervention cards
- Swimlanes for different owners
- Milestone markers (diamond shapes)
- Leading indicator tags
- Validation warnings for missing data owners (red border, warning icon)

### Dashboard Components (Phase 3)

**KPI Cards**:
- Card layout: border, rounded-lg, p-6
- Top section: KPI name, current value (large, bold), trend icon (up/down arrow)
- Middle: Sparkline chart showing monthly progression
- Bottom: Baseline vs Current comparison with delta (percentage and absolute)
- Confidence indicator and provenance link icon

**Financial Appendix Table**:
- Structured table with sticky header
- Columns: Year, Incremental Cash Flow, Cumulative, NPV, Notes
- Row highlighting for key metrics
- Expandable rows for full calculation steps
- "Show Arithmetic" button revealing formulas

**Attribution Model Viewer**:
- Card with model name and description
- Parameter list with values
- Scenario comparison: three columns (Low, Medium, High)
- NPV impact visualization (bar chart or horizontal comparison)

**Analytics Status Indicator**:
- Prominent banner when Tier 3 pending review
- Status badges: Queued, In Review, Signed Off
- SLA countdown timer (red when approaching deadline)
- Ticket ID and reviewer name when assigned

### Data Visualization

**Charts & Graphs**:
- Use Chart.js or Recharts for consistency
- KPI trends: Line charts with baseline reference line
- Financial projections: Stacked bar or waterfall charts
- Confidence distributions: Horizontal bar charts
- Keep charts simple, avoid 3D effects

**Evidence & Provenance Display**:
- Collapsible sections for source documents
- Each excerpt in card with source citation, date, link icon
- Highlight relevant text passages
- Confidence badge next to each source

### Buttons & Actions

**Button Hierarchy**:
- Primary: solid background, text-white, px-6 py-3, rounded-lg, font-medium
- Secondary: border-2, transparent background, px-6 py-3, rounded-lg
- Tertiary: text links with hover underline
- Danger: for delete/critical actions, red treatment
- Disabled: opacity-50, cursor-not-allowed

**CTAs on Landing**:
- Primary CTA: Large button (px-8 py-4, text-lg)
- Secondary CTA: Outline style, same size
- Spacing between: gap-4

**Action Bars**:
- Sticky bottom bar on forms: Save Draft (secondary), Continue (primary)
- Right-aligned button group
- Background with border-top, shadow-lg

### State Indicators

**Draft vs Final**:
- Draft: Yellow badge with "DRAFT" text, border-l-4 on cards
- Final: Green badge with "LOCKED" text and lock icon
- Pending: Blue badge with "PENDING REVIEW"
- Clear visual distinction on every screen

**Loading States**:
- Skeleton screens for data cards
- Spinner for actions (inside button, replacing text)
- Progress bars for multi-step processes

**Empty States**:
- Centered content with icon, message, and action button
- "No data yet" messages with guidance on next steps

## Icons

**Library**: Material Icons (via CDN)
- Use outlined variant for consistency
- Size: text-xl for inline, text-4xl for feature cards, text-6xl for empty states
- Common icons: analytics, description, timeline, check_circle, warning, lock, download, upload

## Accessibility

- Form labels always visible, never placeholder-only
- Error messages below fields with error icon
- Focus states: ring-2 ring-offset-2
- Skip links for keyboard navigation
- ARIA labels for icon-only buttons
- Color not sole indicator of state (use icons + text)

## Animations

Use sparingly:
- Card hover: slight lift (transform translate-y-1)
- Button hover: subtle scale or shadow increase
- Page transitions: fade in content
- No scrolling animations
- Loading spinners only when necessary

## Images

**Hero Section**: Large background image or video showing enterprise collaboration, data analysis, or business strategy meetings. Position on right side of hero split (40% width), rounded corners, subtle shadow.

**Phase Cards**: Small icon illustrations representing Discovery (magnifying glass/search), Alignment (handshake/puzzle pieces), Realisation (growth chart/trophy). Size: 96x96, placed at top of each card.

**Trust Badges**: Partner logos or certification badges in footer or trust section, grayscale treatment for visual consistency.