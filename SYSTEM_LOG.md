# SYSTEM ERROR LOG & LEARNINGS

## History
1. **ISSUE:** "Yellow Screen of Death" (aka Loading Deadlock).
   - **CAUSE:** Leftover debug CSS (`background-color: yellow`) and silent React crashes where `return null` was rendered indefinitely.
   - **FIX:** Implemented `ErrorBoundary` to catch UI crashes, replaced sticky `return null` with visible Loading State, and performed a CSS Hard Reset.

2. **ISSUE:** Supabase Missing / Connection Failures.
   - **FIX:** Added `try/catch` blocks in `syncEngine` and `DashboardWrapper`. Added `import.meta.env` checks. Implemented "Dev Mode Bypass" where Mock Data is used if the backend is unreachable.

## Rules
1. **NEVER** leave `background-color: yellow` (or magenta/green debug borders) in production code. Use the diagnostic layer only when requested and remove immediately.
2. **ALWAYS** check `import.meta.env` before calling Native Plugins or External APIs to prevent crashes in the browser.
3. **FAIL GRACEFULLY:** If a widget or component crashes, the rest of the app must remain functional (use Error Boundaries).

3. **ISSUE:** Dashboard Blank/Cut-off on Mobile.
   - **CAUSE:** Container had `overflow: hidden` and items were positioned outside bounds.
   - **FIX:** Changed Dashboard container to `overflow-y: auto`. Restored `NavButton` labels.
