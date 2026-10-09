# Implementation Plan: To-Do List Life Dashboard

## Overview

Implement a self-contained single-page application as three files — `index.html`, `css/style.css`, and `js/script.js` — with no build tools, no frameworks, and no external dependencies. Each task builds incrementally toward a fully wired dashboard, starting with the HTML skeleton and storage foundation, then adding each module in dependency order, finishing with integration and cross-browser verification.

---

## Tasks

- [x] 1. Create the HTML skeleton (`index.html`)
  - [x] 1.1 Write the `index.html` file with all required sections
    - Create `index.html` at project root with a `<head>` that loads `css/style.css` and `js/script.js` (script in `<head>` **without** `defer` or `async`)
    - Add semantic sections: greeting/clock, focus timer, to-do list (form + list), quick links (form + panel), and theme toggle control
    - Add all necessary `id` and `class` attributes that the JS modules will query
    - Include an empty-state message element inside the task list section (e.g., "No tasks yet. Add one above!")
    - Include error message placeholder elements below each input form
    - _Requirements: 9.3, 9.4_

- [x] 2. Implement `StorageModule` and the Phase 1 theme bootstrap in `js/script.js`
  - [x] 2.1 Create `js/script.js` with the Phase 1 IIFE and `StorageModule`
    - At the very top of `js/script.js`, before any `DOMContentLoaded` listener, write the immediately-executing theme bootstrap block that reads `localStorage.getItem("tld_theme")`, parses with `JSON.parse`, and sets `document.documentElement.dataset.theme` synchronously — wrapped in try/catch so corrupted values are silently ignored
    - Implement `StorageModule` as a plain object with `get(key)`, `set(key, value)`, and `remove(key)` methods; `get` wraps `JSON.parse` in try/catch and returns `null` on any error; `set` wraps `localStorage.setItem` in try/catch and returns `false` on `QuotaExceededError` or any other error, `true` on success
    - Define the `KEYS` constants object: `USER_NAME: "tld_userName"`, `TASKS: "tld_tasks"`, `LINKS: "tld_links"`, `THEME: "tld_theme"`
    - _Requirements: 7.3, 8.1, 8.6_

- [x] 3. Implement `ThemeModule`
  - [x] 3.1 Implement `ThemeModule` in `js/script.js`
    - Implement `ThemeModule` with `init()`, `_toggle()`, and `_apply(theme)` methods
    - `init()` reads the current `document.documentElement.dataset.theme` (already applied by Phase 1) and wires the toggle button's click event to `_toggle()`; update the toggle button's visible label/icon to reflect the current theme
    - `_toggle()` reads the current theme from `document.documentElement.dataset.theme` (defaulting to `"light"`), flips it to the opposite value, calls `_apply(newTheme)`, saves via `StorageModule.set(KEYS.THEME, newTheme)`, and updates the toggle control label; write failure is silently ignored
    - `_apply(theme)` sets or removes `document.documentElement.dataset.theme` to apply the theme
    - Call `ThemeModule.init()` as the first step inside `DOMContentLoaded`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4. Implement `GreetingModule`
  - [x] 4.1 Implement `GreetingModule` in `js/script.js`
    - Implement `_getGreetingPhrase(hour)`: hour 5–11 → `"Good Morning"`, 12–17 → `"Good Afternoon"`, 18–21 → `"Good Evening"`, 22–23 and 0–4 → `"Good Night"`
    - Implement `_formatTime(date)`: return `"HH:MM:SS"` using zero-padded values from `getHours()`, `getMinutes()`, `getSeconds()`
    - Implement `_formatDate(date)`: use explicit English day-name and month-name arrays (not `toLocaleDateString`) to return `"DayName, MonthName DD, YYYY"`
    - Implement `_tick()`: called every second via `setInterval(1000)` — updates the clock display, date display, and greeting phrase display
    - Implement `_handleNameSubmit(event)`: trims the input value; if empty → `StorageModule.remove(KEYS.USER_NAME)` and revert greeting to `"[Greeting]!"`; if 1–50 chars → `StorageModule.set(KEYS.USER_NAME, name)` and update greeting to `"[Greeting], [Name]!"`; if > 50 chars → show error message below name input without saving; clear error when the input field changes
    - Implement `init()`: query DOM refs, read stored `User_Name` via `StorageModule.get(KEYS.USER_NAME)`, start `setInterval` for `_tick()`, call `_tick()` immediately, wire the name input submit event
    - Call `GreetingModule.init()` inside `DOMContentLoaded` after `ThemeModule.init()`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12_

- [x] 5. Implement `TimerModule`
  - [x] 5.1 Implement `TimerModule` in `js/script.js`
    - Implement private state: `remainingSeconds = 1500`, `intervalId = null`, `isRunning = false`
    - Implement `_render()`: format `remainingSeconds` as `MM:SS` and update the timer display DOM element; enable/disable start, stop, reset buttons per the control state table (running: start disabled, stop enabled, reset enabled; stopped/paused: start enabled, stop disabled, reset enabled)
    - Implement `_tick()`: decrement `remainingSeconds` by 1, call `_render()`, if `remainingSeconds` reaches 0 clear the interval, set `isRunning = false`, call `_render()`, then call `_notify()`
    - Implement `_notify()`: show a visible on-page notification element (e.g., reveal a hidden `<div>`) indicating the focus session has ended
    - Implement `_start()`: if `isRunning === true` return immediately; set `isRunning = true`, start `setInterval(_tick, 1000)`, call `_render()`
    - Implement `_stop()`: if `isRunning === false` return immediately; clear the interval, set `isRunning = false`, call `_render()`
    - Implement `_reset()`: clear interval if running, set `isRunning = false`, `remainingSeconds = 1500`, call `_render()`, hide the notification element
    - Implement `init()`: query DOM refs, wire start/stop/reset button click events, call `_render()` to show initial 25:00 state
    - Call `TimerModule.init()` inside `DOMContentLoaded`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

- [x] 7. Implement `TaskModule`
  - [x] 7.1 Implement `_validateTitle(title)` and `_isDuplicate(title, excludeId)` in `TaskModule`
    - `_validateTitle(title)`: if trimmed value is empty/whitespace → return `"Task title cannot be empty."`; if trimmed length > 255 → return `"Task title must be 255 characters or fewer."`; otherwise return `null`
    - `_isDuplicate(title, excludeId)`: compare `title.trim().toLowerCase()` against every task's `title.toLowerCase()`, skipping the task whose `id === excludeId` (pass `null` when adding); return `true` if any match found
    - _Requirements: 3.3, 3.4, 4.1_

  - [x] 7.4 Implement `_addTask(title)`, `_saveToStorage()`, and `_render()` / `_renderTask(task)` in `TaskModule`
    - `_addTask(title)`: run `_validateTitle`; if error → display error below task input, return; run `_isDuplicate(title.trim(), null)`; if duplicate → display duplicate error, return; create a `Task` object (`id` via `crypto.randomUUID()` or fallback, `title` trimmed, `status: "pending"`, `createdAt: Date.now()`); push to in-memory array; call `_saveToStorage()`; if save fails → pop the new task and display storage error; else call `_render()` and clear the input field
    - `_saveToStorage()`: snapshot current array, call `StorageModule.set(KEYS.TASKS, tasks)`; return `true` on success, `false` on failure (let caller handle rollback)
    - `_render()`: clear the task list container; if array is empty → show the empty-state message element; otherwise create a DOM element per task via `_renderTask(task)` and append
    - `_renderTask(task)`: return a `<li>` containing: completion toggle checkbox (checked if `status === "done"`), title `<span>` with `text-decoration: line-through` class applied when `status === "done"`, edit button, delete button; wire each control's event inside this function
    - Wire the task add form submit event in `init()`
    - Clear the error message when the task input's `input` event fires
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 5.10, 5.11, 5.13, 8.2_

  - [x] 7.6 Implement `_toggleTask(id)`, `_deleteTask(id)`, and `_editTask(id, newTitle)` in `TaskModule`
    - `_toggleTask(id)`: snapshot array, find task by `id`, flip `status` between `"pending"` and `"done"`, call `_saveToStorage()`; if save fails → restore snapshot and show error; else call `_render()`
    - `_deleteTask(id)`: snapshot array, filter out task with matching `id`, call `_saveToStorage()`; if save fails → restore snapshot and show error; else call `_render()`
    - `_editTask(id, newTitle)`: trim `newTitle`; if empty/whitespace → discard edit, close inline input, retain original title (no save, no error shown to user); if case-insensitive duplicate of another task → discard edit, close inline input, display duplicate error; otherwise update task `title` to trimmed value, call `_saveToStorage()`; if save fails → restore original title and show storage error; else call `_render()`
    - In `_renderTask`, wire the edit button to replace the title `<span>` with an inline `<input>` pre-filled with current title and a cancel button; cancel restores original title without saving
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.11, 5.12, 5.13_

  - [x] 7.9 Implement `TaskModule.init()` and call it inside `DOMContentLoaded`
    - `init()`: query all task-related DOM refs, call `StorageModule.get(KEYS.TASKS)`; if result is a valid array use it as initial state, otherwise use `[]`; call `_render()`; wire the add-task form submit event
    - Call `TaskModule.init()` inside `DOMContentLoaded` after `TimerModule.init()`
    - _Requirements: 3.5, 3.6, 8.6_

- [x] 9. Implement `LinkModule`
  - [x] 9.1 Implement `_validateLink(label, url)` and `_isDuplicateUrl(url)` in `LinkModule`
    - `_validateLink(label, url)`: return `{ labelError, urlError }` where `labelError` is a non-null string if `label.trim()` is empty or exceeds 50 chars; `urlError` is a non-null string if `url.trim()` is empty or does not start with `http://` or `https://` (case-insensitive) or exceeds 2048 chars; return `null` if both fields are valid
    - `_isDuplicateUrl(url)`: compare `url.trim().toLowerCase()` against every link's `url.toLowerCase()`; return `true` if any match
    - _Requirements: 6.1, 6.3, 6.4, 6.5_

  - [x] 9.2 Implement `_addLink(label, url)`, `_deleteLink(id)`, `_saveToStorage()`, and `_render()` in `LinkModule`
    - `_addLink(label, url)`: run `_validateLink`; if errors → display them below the link form; check `_isDuplicateUrl(url)`; if duplicate → display duplicate URL error; create `QuickLink` object (`id`, `label` trimmed, `url` trimmed); push to in-memory array; call `_saveToStorage()`; if save fails → pop and show storage error; else call `_render()` and clear form inputs
    - `_deleteLink(id)`: snapshot array, filter out matching id, call `_saveToStorage()`; if save fails → restore snapshot and show storage error; else call `_render()`
    - `_render()`: clear the links panel; for each link render a button (opens `url` in new tab via `window.open(url, "_blank")`) and a delete button; wire events inside this function
    - Wire the link add form submit event in `init()`; clear error messages when form inputs fire `input` events
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 8.3_

  - [x] 9.5 Implement `LinkModule.init()` and call it inside `DOMContentLoaded`
    - `init()`: query DOM refs, load `StorageModule.get(KEYS.LINKS)`; if result is a valid array use it, otherwise use `[]`; call `_render()`; wire the add-link form submit event
    - Call `LinkModule.init()` inside `DOMContentLoaded` after `TaskModule.init()`
    - _Requirements: 6.9, 8.6_

- [x] 11. Author `css/style.css`
  - [x] 11.1 Write all CSS including light/dark theme variables and layout
    - Define CSS custom properties for both themes under `[data-theme="dark"]` and the default (light) selector (e.g., `:root` for light, `[data-theme="dark"]` overrides); variables should include at least: `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-border`, `--color-error`
    - Style all six sections (greeting/clock, focus timer, task list, quick links, theme toggle) with a clean, minimal layout; tasks list items should apply `text-decoration: line-through` when the done class is present
    - Ensure the theme toggle, error messages, timer notification, and empty-state message are visually distinct
    - Ensure all interactive controls (buttons, inputs) are clearly usable and accessible (sufficient contrast, focus indicators)
    - _Requirements: 5.10, 7.1, 7.2, 7.3, 9.1, 9.2_

---

## Notes

- The Phase 1 IIFE (theme bootstrap) must be the very first executable code in `js/script.js` — before any function declarations or `DOMContentLoaded` registration — so that theme is applied before the browser's first paint
- All English day and month names must use explicit JS arrays, not `toLocaleDateString`, to guarantee consistent cross-browser output
- `crypto.randomUUID()` requires a secure context (HTTPS or localhost); include a `Date.now() + Math.random()` fallback for `file://` usage
- `StorageModule` is the single point of localStorage access; all other modules use it exclusively
- Each module queries its own DOM references inside `init()` rather than at the top level, so DOM is guaranteed to be ready
- Property test tasks reference properties from the design document's "Correctness Properties" section for full traceability

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["7.1"] },
    { "id": 6, "tasks": ["7.4"] },
    { "id": 7, "tasks": ["7.6"] },
    { "id": 8, "tasks": ["7.9", "9.1"] },
    { "id": 9, "tasks": ["9.2"] },
    { "id": 10, "tasks": ["9.5"] },
    { "id": 11, "tasks": ["11.1"] }
  ]
}
```
