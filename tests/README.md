# Browser Tests

These Playwright tests check task persistence across screen switches and reloads,
including switching screens while a save is pending. There are 49 test executions:
8 core persistence cases run in both `mobile` (390px) and `desktop` (1440px)
projects; 33 layout, timer, and Telegram checks run once in the `ui` project.
Viewport-specific cases use representative sizes rather than repeating the
same fixed viewport in both device projects.

## Run

Use Node 20 or newer:

```sh
npm install
npx playwright install chromium
npm test
```

Playwright starts its own Vite server at `http://127.0.0.1:4174`. No manually
started server or `.env` file is required. That port must be available.

Run a subset or open the interactive runner:

```sh
npm test -- --project=mobile
npm test -- --project=ui
npm test -- --grep "moving a task"
npm run test:ui
```

To use an existing Chromium installation instead of Playwright's downloaded one:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm test
```

## Coverage

- Add, move, complete, reopen, and delete tasks.
- Save responses completed while the Tasks screen is hidden.
- State after returning to Tasks and after a full page reload.
- Exactly one write per action and no writes caused by navigation.
- Dashboard priority synchronization.
- Rejected moves, completion, and deletion.
- Unsaved draft text and selected priority across screen switches.
- Running and paused timer continuity across screen switches.
- Telegram desktop expansion/fullscreen requests and older-client fallback.
- Compact popup timer controls, width reflow, and safe-area changes.
- Android/iOS guards preserving phone navigation and avoiding desktop fullscreen.
- Narrow focus circle/action visibility from 320x568 through 759x700.
- Timer resizing, custom fields, and scrollable doubled-text layouts.
- App-header hierarchy, date semantics, alignment, and screenshots at phone and desktop widths.
- Work, Short Break, and Long Break colors, plus sampled enabled-text AA contrast.
- Duration editing, validation, alarm dismissal, and a full four-session Pomodoro cycle.
- Native alarm playback: a three-second non-looping clip, natural completion while
  JavaScript is busy, repeated initialization without orphaned players, and immediate
  audio stopping on Dismiss.
- No late alarm after background expiry, no replay on returning to the app, and
  immediate cancellation when hiding an active alarm. Browser visibility and
  Telegram activation events are simulated, including suspended timer callbacks.
- Expired reminder snapshots restore silently, including `running` with zero
  remaining seconds before the server worker marks completion.
- Native click playback once on Start/Resume in every timer mode; Pause, Reset,
  restoration, invalid durations, and rejected reminder starts stay silent.
- Mock-clock progress advancement, pause, and reset.
- Bot reminder start/pause/resume/reset, reload restoration, and server-owned completion.
- Failed reminder saves and reconciliation of a committed write with a lost response.
- Compact empty priority groups and a single board-level empty message.
- Mouse/touch drops into compact targets without resizing, plus persistence across navigation and reload.
- Short/long task names, three-line previews, full-name disclosure, keyboard use, and completed-task rendering.

Related lifecycle checks share a case: completion/reopening, deletion/empty state,
timer progress/screen-switch continuity, and mode color/contrast. Distinct failure
paths and mouse/touch input checks remain separate.

`tests/fixtures.js` provides `board.manage(id)` for the task management handle,
`board.seedTasks(records)` for rendering fixtures, and `board.mutation(...)` for
pending-save, navigation, exactly-one-write, and reload assertions.

The server uses dummy Supabase credentials. Browser requests to the mock database
are intercepted, and other external requests are blocked. Fixture records survive
reloads within each test, but never touch a real database. These tests verify the
client's persistence contract, not live Supabase authorization or durability.
Reminder API calls are mocked at the local test origin; no Telegram message is sent.
The fixture only supplies signed-data stand-ins for the two reminder cases, so the
remaining timer tests continue exercising the standalone local timer.
Telegram platform and viewport APIs are mocked too; fullscreen tests verify the
request and fallback behavior, not whether the native client resizes its window.
Lifecycle tests use native Chromium audio with controlled visibility/host events;
they do not certify native Telegram iOS/Android background audio behavior.

The in-app completion sound is foreground-only and bounded by the original
deadline's three-second alarm window. Returning after a background expiry advances
the timer without replaying it; hiding the app dismisses an active alarm. Background
Telegram bot reminders are independent of this sound and are unchanged.

Task persistence is checked across reloads. With bot reminders configured, running
and paused timer state is also checked across reloads. Standalone timer state,
the session-cycle counter, and unsaved task drafts remain local to the Mini App instance.
Bot/Supabase setup and delivery limitations are documented in the companion
`ikizenBot` repository's `README.md`.

Failure screenshots and traces are written to the ignored `test-results/` folder:

```sh
npx playwright show-trace test-results/<failed-test>/trace.zip
```
