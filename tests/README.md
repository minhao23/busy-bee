# Browser Tests

These Playwright tests check task persistence across screen switches and reloads,
including switching screens while a save is pending. Each case runs at mobile
(390px) and desktop (1440px) widths. Telegram host tests also exercise compact
desktop popup widths independently of those project defaults.

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
- App-header hierarchy, date semantics, alignment, and screenshots at phone, tablet, and desktop widths.
- Work, Short Break, and Long Break colors, plus sampled enabled-text AA contrast.
- Inline duration editing, validation, alarm dismissal, and a full four-session Pomodoro cycle.
- Mock-clock progress advancement, pause, and reset.
- Compact empty priority groups and a single board-level empty message.
- Mouse/touch drops into compact targets without resizing, plus persistence across navigation and reload.
- Short/long task names, three-line previews, full-name disclosure, keyboard use, and completion persistence.

The server uses dummy Supabase credentials. Browser requests to the mock database
are intercepted, and other external requests are blocked. Fixture records survive
reloads within each test, but never touch a real database. These tests verify the
client's persistence contract, not live Supabase authorization or durability.
Telegram platform and viewport APIs are mocked too; fullscreen tests verify the
request and fallback behavior, not whether the native client resizes its window.

Task persistence is checked across reloads. Timer and draft state are checked
only across screen switches; they are not currently stored across reloads.

Failure screenshots and traces are written to the ignored `test-results/` folder:

```sh
npx playwright show-trace test-results/<failed-test>/trace.zip
```
