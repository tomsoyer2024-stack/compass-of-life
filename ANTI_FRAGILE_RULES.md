# ANTI-FRAGILE DEVELOPMENT RULES
*Rules to prevent "White Screen" and Logic Rot*

## 1. The "No White Screen" Guarantee
- **Rule**: EVERY entry point (`main.jsx`, `App.jsx`) must be wrapped in an `ErrorBoundary`.
- **Rule**: `index.html` MUST have a `window.onerror` handler for boot-time crashes.
- **Verification**: Manually trigger a throw in `App.jsx` before every release to ensure the Red Screen appears.

## 2. React Hooks Sanctity
- **Rule**: NEVER define a component or hook inside another component's render function (e.g., `renderDashboard` inside `App`).
- **Reason**: This causes hooks to remount/reset on every render, leading to "Rendered fewer hooks" or state loss.
- **Fix**: Extract all sub-render logic into standalone file constants or `src/components/`.

## 3. Black Box Logging
- **Rule**: Every user interaction (Click, Type, Toggle) must fire a `logger.logEvent`.
- **Rule**: `console.log` is for debugging. `logger` is for architecture.
- **Rule**: Catch blocks MUST log the error stack, not just a message.

## 4. Import Safety
- **Rule**: No Circular Imports.
- **Rule**: Check `export default` vs `export { named }`. 
- **Pattern**: When moving a file, search-and-replace ALL references immediately.

## 5. State Management
- **Rule**: `localStorage` keys must be namespaced (e.g., `app_v1_settings`) to avoid collisions.
- **Rule**: Always provide a fallback/default state in `useState(fn)` initializer.
- **Example**: `useState(() => JSON.parse(localStorage.getItem('key')) || DEFAULT_VALUE)`
