---
name: Busy Bee
description: Calm, premium mobile-first focus and priority tools in deep blue and warm sand.
colors:
  canvas: "#1b3c53"
  surface: "#294b63"
  surface-raised: "#355970"
  surface-inset: "#173449"
  accent: "#e8c595"
  ink: "#f9f3ef"
  muted: "#d0dce4"
  line: "#607f93"
  control-line: "#90aab9"
  error: "#ffd1c6"
  success: "#c6e4cc"
  break-long: "#c5d9ee"
  priority-do: "#f2c3b2"
  priority-aside: "#c5d9ee"
  badge-do-bg: "#613f3633"
  badge-schedule-bg: "#2d603533"
  badge-delegate-bg: "#6b542e33"
  badge-aside-bg: "#3f597033"
typography:
  display-narrow:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "clamp(42px, 23cqw, 80px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.04em"
  display:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "clamp(50px, 15vw, 66px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.04em"
  display-desktop:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "clamp(72px, 8vw, 96px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.04em"
  display-telegram:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "clamp(48px, 14vw, 64px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.04em"
  headline-tasks:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "clamp(23px, 5.5vw, 30px)"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline-tasks-desktop:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "32px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  brand:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "18px"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "17px"
    fontWeight: 650
    lineHeight: 1.25
  quadrant-title:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "16px"
    fontWeight: 650
    lineHeight: 1.25
  quadrant-title-desktop:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "18px"
    fontWeight: 650
    lineHeight: 1.25
  body:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.5
  task:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.55
    letterSpacing: "0.005em"
  label:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  metadata:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
  control:
    fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "15px"
    fontWeight: 650
    lineHeight: 1.5
rounded:
  checkbox: "4px"
  badge: "6px"
  destination: "8px"
  control-sm: "10px"
  drag-preview: "12px"
  control: "14px"
  quadrant: "16px"
  container: "18px"
spacing:
  compact: "4px"
  small: "8px"
  control-gap: "10px"
  inset: "12px"
  form: "14px"
  regular: "16px"
  container: "18px"
  page: "20px"
  section: "24px"
  wide: "32px"
  split: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    height: "52px"
  button-custom:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    padding: "8px 10px"
    height: "44px"
  input-task:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "8px 4px"
    height: "48px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "10px 24px"
    height: "48px"
  nav-item-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  nav-item-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
  badge-do:
    backgroundColor: "{colors.badge-do-bg}"
    textColor: "{colors.priority-do}"
    rounded: "{rounded.badge}"
    padding: "4px 8px"
  badge-schedule:
    backgroundColor: "{colors.badge-schedule-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.badge}"
    padding: "4px 8px"
  badge-delegate:
    backgroundColor: "{colors.badge-delegate-bg}"
    textColor: "{colors.accent}"
    rounded: "{rounded.badge}"
    padding: "4px 8px"
  badge-aside:
    backgroundColor: "{colors.badge-aside-bg}"
    textColor: "{colors.priority-aside}"
    rounded: "{rounded.badge}"
    padding: "4px 8px"
  card-upcoming:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.container}"
    padding: "18px"
  quadrant:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.quadrant}"
    padding: "12px"
  quadrant-drop-active:
    backgroundColor: "{colors.surface-raised}"
  task-card:
    backgroundColor: "{colors.surface-inset}"
    textColor: "{colors.ink}"
    typography: "{typography.task}"
    rounded: "{rounded.control-sm}"
    padding: "5px"
  timer:
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    width: "min(248px, 100%)"
---

# Design System: Busy Bee

## Overview

**Creative North Star: "Calm, premium focus"**

Busy Bee is a compact working interface for repeated handheld use. Deep blue establishes a quiet canvas, slate-blue work areas organize the day, and warm sand marks the next action or current selection. Premium character comes from precise spacing, variable-weight type, and restraint rather than ornament.

The whole app retains its focus timer and essential Eisenhower priorities. Telegram-first mobile use sets the scale of controls and the navigation position; desktop adds breathing room without introducing a different identity. The confirmed 60-30-10 balance is a visual allocation guide, not a measured claim about every screen.

**Key Characteristics:**
- Deep blue canvas, slate-blue work areas, rare warm sand emphasis.
- Self-hosted variable Satoshi; stable tabular timer and count numerals.
- Flat tonal layers with softly curved controls and state-only lift.
- Thumb-edge navigation and a two-by-two mobile priority matrix.
- Touch handles, tap/keyboard alternatives, and visible pending/error feedback.

This is a post-build record of the active global, app, focus, board, and task-card styles. Inactive legacy dashboard and todo styles are excluded. Source remains unchanged; features and backend remain outside this documentation boundary.

Verification supplied with this handoff: independent review marks both focus-restoration and alarm fixes resolved. Browser checks passed at 320, 360, 390, 430, 768, and 1440px using synthetic isolated task data. No live database or native Telegram iOS/Android device verification is claimed.

## Colors

A deep marine-blue base supports quiet slate layers, warm sand emphasis, and restrained semantic labels. The frontmatter is normative; names below explain application, not alternative color definitions.

### Primary
- **Warm Sand** (`accent`): current navigation, selected timer mode, Start/Add actions, focus outlines, text selection, work/custom progress, and Handle soon labels.

### Neutral
- **Deep Blue Canvas** (`canvas`): page and Telegram chrome, and text on sand actions.
- **Slate Work Surface** (`surface`): mode strip, upcoming tasks, task form, quadrants, and secondary controls.
- **Raised Slate** (`surface-raised`): unselected mode hover and active drop destinations.
- **Inset Blue** (`surface-inset`): darker task cards and expanded task actions.
- **Warm Chalk** (`ink`): primary readable content.
- **Mist Blue** (`muted`): supporting copy, labels, inactive navigation, and completed text.
- **Slate Line** (`line`): decorative separators. Empty cycle dots use the stronger control outline; the timer track uses its current mode accent at 40% opacity.
- **Control Outline** (`control-line`): input strokes, selects, and checkbox borders; keep these more visible than decorative separators.

### Readability Checks
Computed stable-state browser checks cover Focus, custom fields, mode hover, the task board, expanded actions, completed tasks, and failed saves. Sampled text stays at or above 5.34:1, and field/checkbox boundaries at or above 3.79:1. Supporting text is 6.59:1 on the ordinary work surface and 5.34:1 on raised slate. Primary task text is 11.76:1 on inset blue. These are sampled states, not a claim of whole-app accessibility certification.

### Semantic Roles
- **Soft Terracotta** (`priority-do`): Do now headings and badge text.
- **Pale Sage** (`success`): Plan ahead headings/badges and the Short Break timer accent; not a substitute for confirmation text.
- **Pale Blue** (`break-long`): the Long Break timer accent. Timer-scoped accents color the mode selection, ring, mode label, and primary action; app branding and navigation remain sand.
- **Cool Powder Blue** (`priority-aside`): Low priority headings and badge text.
- **Pale Coral** (`error`): errors and delete actions.
- **Translucent badge tints** (`badge-do-bg`, `badge-schedule-bg`, `badge-delegate-bg`, `badge-aside-bg`): small label backgrounds over work surfaces, not general-purpose page fills.

**The 60-30-10 Rule.** Use the canvas as the dominant field, work surfaces as the supporting layer, and warm sand sparingly for selection and action. Semantic priority colors identify meaning; they do not become large decorative fills.

## Typography

**Display Font:** Satoshi, with the frontmatter fallback stack.  
**Body Font:** The same Satoshi; no separate label or mono face.

**Character:** The shipped normal-style WOFF2 is self-hosted and declares variable weights from 300 to 900 with `font-display: swap`. The base weight is 500, with 600/650 providing control and heading emphasis; font synthesis is disabled. No italic face is established here.

### Hierarchy
- **Display:** the `display` token is the countdown, with tabular numerals and tight tracking; it is not a promotional heading style.
- **Headline:** `headline-tasks` drives "Tasks". The timer has no visible heading: its countdown, mode controls, and Focus navigation identify the tool. "Focus timer" remains a screen-reader-only heading without occupying layout space. Supporting copy should explain an action or report a real state.
- **Brand:** `brand` is the 18px compact app title across phone, desktop, and Telegram layouts. A 24px authored SVG bee sits 8px before the name: a single sand-colored outline with two looped wings, a horizontal capsule body, and two straight stripes. It shares the icon family's 1.8-unit rounded stroke, without fills, antennae, facial details, rotation, or an enclosing badge. The mark is static and hidden from assistive technology because the adjacent name supplies the brand label. It stays secondary to the screen heading, not a second display headline.
- **Title:** `title` is the 17px upcoming-tasks heading. Quadrant headings stay at 16px on all phones and increase to 18px at the desktop breakpoint.
- **Body:** task names and entry text use `--text-body` (1rem / 16px). Task names keep a 1.5 line height and a 500 weight on both mobile and desktop.
- **Label:** supporting copy and fields use `--text-label` (0.875rem / 14px). Mode controls use 600 weight; navigation uses 15px/600; primary controls use `control`.
- **Metadata:** `--text-small` (0.8125rem / 13px) is reserved for short counts, board instructions, quadrant descriptions, authors, and priority badges. Descriptions use 1.55 leading and reserve two lines on phones. Do not use metadata sizes for task content.
- **Counts:** the task header uses one 14px supporting line, "N open, N completed", beneath the heading on mobile and opposite it on desktop. No oversized metric blocks or repetitive subtitle. Timer and numeric counts use tabular figures. Task names wrap anywhere; previews longer than three lines offer an explicit Show more action, so full content remains available.

**The One Family Rule.** Use the bundled variable Satoshi across headings, body, and controls. Keep its real weight range; do not substitute an invented display or monospace font.

## Layout

The centered app shell caps at 1040px below the desktop breakpoint. Mobile uses 20px horizontal padding, a top inset of `max(20px, env(safe-area-inset-top))`, and bottom space of `calc(100px + env(safe-area-inset-bottom))` for navigation. At widths up to 360px, horizontal padding becomes 12px and quadrant padding becomes 9px. The supported body minimum is 320px.

The header pairs the compact brand with a muted 14px local date, rendered as a semantic `time` element with a local calendar-date value and tabular numerals. A subtle `surface-raised` divider sits 12px below the brand with 20px of separation before the screen content. Desktop retains its existing toolbar divider and avoids an extra bottom margin. Header checks at 320px, 390px, 768px, and 1440px cover hierarchy, alignment, semantics, and both screens; the full 64-test mocked suite passes.

Below 760px, two equal navigation buttons sit in a fixed full-width bottom bar with a top line and safe-area bottom padding. The bar uses a centered 440px control region on wider phones. At 760px and above, navigation becomes static, 280px wide, with 4px inset and an 18px enclosing curve; shell padding becomes 32px 32px 60px.

Focus stacks with a 32px gap on mobile. At 760px it becomes a 1.2fr/1fr split with a 48px gap. The session row sits centered above the mode controls, with no visible timer heading or reserved heading space. Its bottom margin is 12px on phones and 16px on tablet/desktop layouts. A resize observer measures the space from the circle to the fixed navigation, reserving the full action row, display padding, and a 16px clearance. The circle grows up to 340px on taller screens and shrinks as needed, bounded by available width and a 160px sizing floor. Extremely short views, enlarged text, or expanded custom settings may scroll rather than lose controls. Countdown type follows the circle's container width with `clamp(42px, 23cqw, 80px)`. The ring remains 280px from 760px to 1023px; mode and control rows cap at 400px on mobile. The timer controls allocate 1.5fr to the primary action and 1fr to the secondary. Telegram desktop keeps its separately scoped sizing.

Narrow focus verification covers 320x568, 360x640, 390x664, 390x844, 430x932, 600x645, and 759x700 browser viewports, resizing, custom settings, navigation while running, and doubled root text size. Screenshots were reviewed, and all 56 automated layout/persistence checks passed with mocked Supabase and Telegram APIs. Physical-device verification remains unperformed.

The Eisenhower board remains two-by-two below 1280px. Its gap is 10px on mobile and 16px at 760px; quadrant inset grows from 12px to 20px. Below 1024px populated task lists have a 112px minimum and 280px maximum height with internal vertical scrolling. Empty quadrants shrink to their title, description, count, and padding: no reserved list height or trailing header margin, and no stretching to match a populated neighbor. The title stays within 15ch on mobile; wider layouts remove that cap.

### Desktop Enhancements
Desktop overrides live in `src/Desktop.css`, loaded after component styles. Ordinary browser enhancements start at `min-width: 1024px`; narrower Telegram desktop windows use explicitly scoped compact rules. Existing phone and tablet layouts remain unchanged.

- **Workspace:** a 1280px-capped shell with 40px horizontal padding. Brand, centered navigation, and date share one toolbar row; a divider separates it from the working area.
- **Focus:** the timer leads a 1.4fr supporting-column split with a 64px gap. Session counts sit centered above the mode controls. The ring scales from 300px to 380px with viewport height; countdown text scales from 72px to 96px. Mode selection caps at 440px and timer actions at 380px.
- **Tasks:** the heading and compact status share a row. Task entry, priority, and Add task share a second row. The desktop task field has a full control outline and 10px corners.
- **Board:** compact desktops retain two columns; at 1280px all four priorities sit in one row. Quadrants use 18px insets. Populated task-list maximum height follows `clamp(240px, calc(100vh - 340px), 600px)`; minimum height is 112px on compact desktops and 176px on wide desktops. Empty task lists have no minimum height at any breakpoint.

Desktop verification used headless Chrome with isolated Supabase fixtures at widths through 1920px. All 32 phone/tablet state comparisons below 1024px passed screenshot checks with a small glyph-antialiasing tolerance and exact computed-style comparisons with desktop CSS enabled/disabled. Desktop mouse dragging, deletion, dense/empty boards, 200% root text scaling, and timer controls at 768px viewport height passed. No live database writes or physical-device checks were performed.

### Telegram Desktop Popup
`data-telegram-desktop="true"` identifies Telegram's native desktop/macOS hosts, or Telegram web hosts with a fine pointer and hover support. This flag does not apply to Android or iOS.

- Below 1024px, navigation moves into document flow above the content instead of covering the bottom of a narrow popup. The header is compact, and session counts sit centered above the mode controls without a visible timer heading.
- The countdown ring scales between 160px and 248px using Telegram's stable viewport height, falling back to the browser's dynamic viewport height. Timer actions retain their 52px minimum height.
- Below 640px, upcoming tasks follow the timer. From 640px, the timer and upcoming tasks sit side by side. Task quadrants retain their existing responsive behavior.
- Desktop shell padding respects Telegram's physical and content safe-area insets. Viewport, fullscreen, and safe-area events update these values, with listeners removed on cleanup.
- Startup still calls `expand()`. Desktop clients exposing Bot API 8.0+ fullscreen support receive one `requestFullscreen()` attempt. Rejected or unavailable fullscreen does not block initialization or the compact layout. There is no arbitrary popup width/height API, and actual resizing remains controlled by Telegram.

The automated suite includes simulated desktop hosts, a 400x645 popup, widths from 320px through 1023px, safe-area changes, unavailable/rejected fullscreen, task persistence, and Android/iOS layout guards. Rendered compact Chrome screenshots were reviewed. Native Telegram resizing still requires verification in the deployed client.

The frontmatter spacing vocabulary records reused observed values, not a newly imposed mathematical scale. Keep compact control gaps distinct from 24–32px section separation and the 48px desktop split.

## Elevation & Depth

Resting screens are flat, using canvas/work/raised tones and thin lines for hierarchy. The system is not entirely shadowless: the running timer, active drop destination, and floating drag preview receive transient lift. There is no blur-backed navigation or gradient layer in the active sources.

### Shadow Vocabulary
- **Running timer:** `filter: drop-shadow(0 6px 16px #102c3c44)`; only while the timer runs.
- **Active drop:** `box-shadow: 0 8px 20px #102c3c55`; only on the current drop destination, paired with an accent border and raised surface.
- **Drag preview:** `box-shadow: 0 12px 28px #102c3c66`; only for the floating sand task preview.

**The Flat-at-Rest Rule.** Separate resting content with tonal surfaces and restrained lines, not decorative card shadows. Lift belongs to running, dragging, and valid-drop states.

## Shapes

Soft curves distinguish controls from containers: 6px badges and move handles, 8px destination selects, 10px compact controls/tasks, 12px floating preview, 14px main buttons and mode-strip shell, 16px quadrants, and 18px larger containers/navigation enclosure. Only session dots and the timer ring use circular geometry. The task-name input stays square and underlined below 1024px; desktop uses a rounded full border.

Lines are 1px where used for separators and field borders; 20px checkboxes have a clearer 2px control outline and a CSS-drawn check. Forced-color mode restores native checkbox rendering. A quadrant reserves a transparent 1px border at rest so its active-drop border does not change layout. Icons are small inline stroked SVGs, usually 20px, with 19px navigation and 16px delete variants; do not replace them with character glyphs.

## Components

### Buttons
Refined and direct, with touch-sized actions rather than decorative lift.
- **Primary:** warm sand on deep blue, 14px curves, 52px minimum height, 15px/650 text. Start changes to Pause or Resume; while alarming it shows disabled Finished and the secondary control becomes Dismiss.
- **Secondary:** slate work surface with warm chalk text and the same timer-control sizing. Both timer control variants brighten with `filter: brightness(1.08)` on enabled hover; there is no translate/scale press animation in the shipped styles.
- **Add:** compact 10px curve, 46px minimum height, 10px 14px inset, 15px/650 text.
- **Custom / ghost:** a 44px-high pencil-and-Edit control at the upper-right of the timer display, beneath the Long Break option and outside the centered time/mode group. It uses muted 13px text without an underline, 8px corners, and a work-surface background on hover or expansion. Expanded state reads Done. Opening it preserves the timer's mode and duration; changing a field selects Custom. The editor closes on start or a preset-mode change.
- **Focus / disabled:** every button, input, select, and summary receives a 2px sand `:focus-visible` outline with 3px offset. Disabled buttons use 0.75 opacity and a not-allowed cursor; do not add an unsupported disabled-input opacity rule.

### Chips
Small semantic identifiers, not interactive pills. Four named priorities use 13px text, 4px 8px inset, a 6px curve, and the corresponding translucent badge tint. They have no hover, focus, or selected interaction state.

### Cards / Containers
Upcoming tasks use the slate work surface, 18px curve and inset, and line-separated 16px task rows. Quadrants use the same work tone with a 16px curve and semantic heading/count text. Task cards use inset blue, a 10px curve, and an 8px inset at all widths; cards do not lift on generic hover. Names occupy the full card width above one compact toolbar. Only names exceeding three rendered lines get a sand-colored Show more cue; the whole preview is a keyboard-accessible disclosure. Show less restores the preview. Overflow is measured again after resizing, font loading, and revealing hidden screens; short names have no redundant disclosure.

### Inputs / Fields
The new-task field is transparent with a control-outline bottom stroke, 48px minimum height, 16px text, and 8px 4px inset. Its form shell uses a work surface, 18px curve, and 14px inset. The priority select uses canvas, a control-outline border, a 10px curve, and 46px minimum height. Custom time selects use a work surface, the same clearer outline, a 10px curve, and 44px minimum height. All retain the global sand focus outline and caret. Task errors appear in a nearby alert; pending writes disable controls, and failed additions retain entered text.

### Navigation
Two explicit destinations, Focus and Tasks, use 48px minimum-height controls. Inactive items are transparent/muted; hover is work-surface/chalk; current selection is sand/canvas with `aria-current="page"`. Color and background transition for 180ms using the shared ease. Responsive placement is specified in Layout; do not confuse this navigation with an ARIA tab widget.

### Timer
A 3-unit circular track at 40% opacity carries a 4-unit elapsed-progress arc: sand for Work/Custom, sage for Short Break, and pale blue for Long Break. The countdown and mode-colored label form the centered group; Edit sits separately at the upper-right, so it does not displace the numerals. The display shares the mode strip's width cap, with a 24px top inset and Edit inset 4px from the top/right. The progress stroke has rounded ends and a 500ms linear dash-offset transition; reduced-motion preferences remove the transition. Mode options are 44px minimum-height controls in a curved slate strip. Selected options use the current timer accent on canvas text; unselected text is ink, and enabled hover uses raised slate. Mode/edit controls are disabled while running or alarming. Duration fields expand below the circle, above the main controls; narrow-screen fitting reserves their height. Circle-to-action spacing uses an 8px display bottom inset.

Session dots are 8px outlined circles with sand fills and a short "to long break" label. They count Work sessions only, retain all four fills during the earned long break, and reset at the next cycle. Accessible group labels state the completed count out of four. Mock-clock tests cover advancing/paused/reset progress, all four work completions, automatic mode colors, inline editing, and custom validation/alarm dismissal. Sampled enabled mode, navigation, edit, label, and primary-action text meets 4.5:1 in all three preset modes; this is not whole-app accessibility certification.

### Task Movement & Feedback
The move handle is a 44px target. Dragging begins after 8px of pointer movement, only from the handle; `touch-action: none` belongs to that handle, not the scrolling board. The original task fades to 0.55 while its sand preview floats above the destination. A valid drop uses the raised slate, accent border, and active-drop shadow with a 220ms shared-ease transition.

A tap or keyboard activation opens destination selection and deletion; Escape closes/cancels. After selection and after save-driven reparenting, focus returns to the task handle. Task text sits above a shared toolbar on both mobile and desktop, with completion at the left and the handle at the right, each retaining a 44px target. Name disclosure is independent of the management menu and does not write to the database. Expanded management controls remain in flow. Completed tasks use strike-through and muted text under a native disclosure, with the same measured name-preview behavior. Browser checks cover short names, unbroken strings, natural sentences, keyboard expansion, screen-switch continuity, and completion/reload persistence at 320px, 390px, 768px, and 1440px.

Use the same four labels in headings, priority selectors, and dashboard badges: Do now (urgent and important), Plan ahead (important, not urgent), Handle soon (urgent, less important), and Low priority (not urgent or important).

Show "No tasks yet" once above the matrix only when there are no active tasks. Empty quadrants are compact labeled drop targets, not tall blank panels. While dragging over an empty quadrant, "Drop here" overlays the existing target with raised slate, without changing its dimensions or intercepting pointer hit testing. Loading and failures use the board-level status rather than repeated quadrant messages. Browser checks cover compact groups at 320px, 390px, 768px, and 1440px, a fully empty board after navigation/reload, and mouse/touch drops with unchanged target bounds and mocked persistence.

Priority changes show pending text or rollback/error text. Routine success is announced to screen readers without a visible saved message; the moved task itself shows the outcome. These are interface states documented from code, not evidence of verified live persistence.

The sidecar previews use self-contained standard HTML, inline SVG, scoped `ds-` classes, token variables with literal fallbacks, and the bundled variable font embedded as a data URL. Native disclosures illustrate expanded task controls without a framework; they do not implement production drag, timer, or database logic. Reduced-motion preferences remove preview transitions, matching the global source policy.

## Do's and Don'ts

### Do:
- Do keep the mobile priority matrix two-by-two and retain all four named priorities.
- Do reserve warm sand for actions, selection, and focus; keep the canvas and work layers dominant.
- Do use the bundled variable Satoshi and tabular numerals for countdowns and counts.
- Do preserve at least 44px task-control hit areas, visible focus, and a tap/keyboard alternative to dragging.
- Do show pending and rollback/error feedback without losing the task or entered text; keep routine success announcements offscreen.
- Do respect safe areas and reduced-motion preferences.

### Don't:
- Don't introduce a second font, gradients, glossy layers, or resting decorative shadows into this restrained system.
- Don't rely on semantic color alone; retain priority names and descriptions.
- Don't turn drag-and-drop into the only way to move a task.
- Don't treat synthetic browser checks as live database or native Telegram verification.
- Don't copy inactive legacy styles or promote isolated defects into new reusable tokens.

## Current Automated Coverage

The consolidated suite has 43 executions. Core task persistence runs at 390px
and 1440px; viewport-specific UI tests run once, using 320px/1440px for headers,
task names, and empty groups, and 320x568, 390x844, and 759x700 for narrow timer
layout. Resize, enlarged-text, mouse/touch, timer-cycle, and Telegram fallback
checks remain. Earlier verification counts and viewport lists above describe
historical runs, not the current suite. See `tests/README.md` for current coverage.
