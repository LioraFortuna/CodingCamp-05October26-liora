// =============================================================================
// PHASE 1 — Synchronous theme bootstrap
// Runs immediately (before DOMContentLoaded) to apply the saved theme before
// the browser's first paint, preventing a flash of wrong theme.
// Requirements: 7.3
// =============================================================================
(function () {
  try {
    var theme = JSON.parse(localStorage.getItem("tld_theme"));
    if (theme === "dark" || theme === "light") {
      document.documentElement.dataset.theme = theme;
    }
  } catch (e) {
    // Corrupted value — leave browser default (light)
  }
})();

// =============================================================================
// STORAGE KEYS
// Central constants for all localStorage keys used by the application.
// Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
// =============================================================================
var KEYS = {
  USER_NAME: "tld_userName",
  TASKS:     "tld_tasks",
  LINKS:     "tld_links",
  THEME:     "tld_theme"
};

// =============================================================================
// StorageModule
// Single point of access for localStorage. All other modules use this module
// exclusively — they never call localStorage directly.
// Requirements: 8.1, 8.6
// =============================================================================
var StorageModule = {
  /**
   * Reads and JSON-parses the value stored under `key`.
   * Returns null if the key is missing, if the value is not valid JSON,
   * or if any other error occurs.
   * @param {string} key
   * @returns {*} parsed value, or null
   */
  get: function (key) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (e) {
      // Corrupted / unparseable data — treat as absent (Requirement 8.6)
      return null;
    }
  },

  /**
   * JSON-stringifies `value` and writes it to localStorage under `key`.
   * Returns true on success, false on QuotaExceededError or any other error.
   * @param {string} key
   * @param {*} value
   * @returns {boolean}
   */
  set: function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      // QuotaExceededError or other write failure
      return false;
    }
  },

  /**
   * Removes the entry stored under `key` from localStorage.
   * @param {string} key
   * @returns {void}
   */
  remove: function (key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Silent — removal failures are non-critical
    }
  }
};

// =============================================================================
// ThemeModule
// Manages light/dark theme toggling, persistence, and UI label updates.
// Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
// =============================================================================
var ThemeModule = {
  /**
   * Reads the theme already applied by the Phase 1 IIFE
   * (document.documentElement.dataset.theme), updates the toggle button label
   * to match, and wires the button's click event to _toggle().
   */
  init: function () {
    var currentTheme = document.documentElement.dataset.theme || "light";
    this._updateLabel(currentTheme);

    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        ThemeModule._toggle();
      });
    }
  },

  /**
   * Reads the current theme, flips it, applies it, persists it, and updates
   * the toggle button label. Storage write failures are silently ignored.
   */
  _toggle: function () {
    var current = document.documentElement.dataset.theme || "light";
    var next = current === "dark" ? "light" : "dark";
    this._apply(next);
    StorageModule.set(KEYS.THEME, next); // failure is silently ignored (returns false)
    this._updateLabel(next);
  },

  /**
   * Sets document.documentElement.dataset.theme to `theme`.
   * @param {string} theme  "light" | "dark"
   */
  _apply: function (theme) {
    document.documentElement.dataset.theme = theme;
  },

  /**
   * Updates the visible label of the #theme-toggle button to reflect the
   * currently active theme.
   * Light theme active → "🌙 Dark Mode"
   * Dark theme active  → "☀️ Light Mode"
   * @param {string} theme  "light" | "dark"
   */
  _updateLabel: function (theme) {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.textContent = theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  }
};

// =============================================================================
// GreetingModule
// Manages the live clock, date display, and personalised greeting.
// Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12
// =============================================================================
var GreetingModule = {
  // --- DOM references (populated in init) ------------------------------------
  _greetingEl: null,
  _clockEl:    null,
  _dateEl:     null,
  _nameForm:   null,
  _nameInput:  null,
  _nameError:  null,

  // --- Internal state --------------------------------------------------------
  _intervalId: null,

  // ---------------------------------------------------------------------------
  // _getGreetingPhrase(hour)
  // Returns the appropriate greeting string for the given 0–23 hour value.
  // 5–11  → "Good Morning"
  // 12–17 → "Good Afternoon"
  // 18–21 → "Good Evening"
  // 22–23, 0–4 → "Good Night"
  // Requirements: 1.3, 1.4
  // ---------------------------------------------------------------------------
  _getGreetingPhrase: function (hour) {
    if (hour >= 5 && hour <= 11) return "Good Morning";
    if (hour >= 12 && hour <= 17) return "Good Afternoon";
    if (hour >= 18 && hour <= 21) return "Good Evening";
    return "Good Night"; // 22–23 and 0–4
  },

  // ---------------------------------------------------------------------------
  // _formatTime(date)
  // Returns a zero-padded "HH:MM:SS" string for the given Date object.
  // Requirements: 1.1, 1.2
  // ---------------------------------------------------------------------------
  _formatTime: function (date) {
    var hh = String(date.getHours()).padStart(2, "0");
    var mm = String(date.getMinutes()).padStart(2, "0");
    var ss = String(date.getSeconds()).padStart(2, "0");
    return hh + ":" + mm + ":" + ss;
  },

  // ---------------------------------------------------------------------------
  // _formatDate(date)
  // Returns "DayName, MonthName DD, YYYY" using explicit English name arrays.
  // Requirements: 1.5, 1.6
  // ---------------------------------------------------------------------------
  _formatDate: function (date) {
    var dayNames = [
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday"
    ];
    var monthNames = [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December"
    ];

    var dayName   = dayNames[date.getDay()];
    var monthName = monthNames[date.getMonth()];
    var dd        = String(date.getDate()).padStart(2, "0");
    var yyyy      = date.getFullYear();

    return dayName + ", " + monthName + " " + dd + ", " + yyyy;
  },

  // ---------------------------------------------------------------------------
  // _tick()
  // Called once per second. Refreshes the clock, date, and greeting phrase.
  // Requirements: 1.1, 1.2, 1.5, 1.6, 1.7, 1.8, 1.9
  // ---------------------------------------------------------------------------
  _tick: function () {
    var now    = new Date();
    var phrase = GreetingModule._getGreetingPhrase(now.getHours());

    // Update clock
    if (GreetingModule._clockEl) {
      GreetingModule._clockEl.textContent = GreetingModule._formatTime(now);
    }

    // Update date
    if (GreetingModule._dateEl) {
      GreetingModule._dateEl.textContent = GreetingModule._formatDate(now);
    }

    // Update greeting — preserve name if one is stored
    if (GreetingModule._greetingEl) {
      var storedName = StorageModule.get(KEYS.USER_NAME);
      if (storedName && typeof storedName === "string" && storedName.trim().length > 0) {
        GreetingModule._greetingEl.textContent = phrase + ", " + storedName + "!";
      } else {
        GreetingModule._greetingEl.textContent = phrase + "!";
      }
    }
  },

  // ---------------------------------------------------------------------------
  // _handleNameSubmit(event)
  // Handles the name form submit event.
  // - Empty trimmed value → remove stored name, revert greeting to "[Greeting]!"
  // - 1–50 chars         → save name, update greeting to "[Greeting], [Name]!"
  // - > 50 chars         → show inline error, do NOT save
  // Clears the error whenever the input field value changes.
  // Requirements: 1.10, 1.11, 1.12
  // ---------------------------------------------------------------------------
  _handleNameSubmit: function (event) {
    event.preventDefault();

    var rawValue  = GreetingModule._nameInput ? GreetingModule._nameInput.value : "";
    var trimmed   = rawValue.trim();
    var errorEl   = GreetingModule._nameError;

    // Clear any previous error
    if (errorEl) errorEl.textContent = "";

    if (trimmed.length === 0) {
      // No name — remove stored name and revert greeting
      StorageModule.remove(KEYS.USER_NAME);
      GreetingModule._tick(); // re-render greeting without name
    } else if (trimmed.length <= 50) {
      // Valid name — save and update greeting
      StorageModule.set(KEYS.USER_NAME, trimmed);
      GreetingModule._tick(); // re-render greeting with name
    } else {
      // Too long — show error, do NOT save
      if (errorEl) {
        errorEl.textContent = "Name must be 50 characters or fewer.";
      }
    }
  },

  // ---------------------------------------------------------------------------
  // init()
  // Queries DOM refs, loads persisted name, starts the clock interval,
  // fires an immediate tick, and wires the name form submit handler.
  // Requirements: 1.1, 1.7, 1.8, 1.9, 1.10
  // ---------------------------------------------------------------------------
  init: function () {
    // Query DOM references
    this._greetingEl = document.getElementById("greeting-phrase");
    this._clockEl    = document.getElementById("clock-display");
    this._dateEl     = document.getElementById("date-display");
    this._nameForm   = document.getElementById("name-form");
    this._nameInput  = document.getElementById("name-input");
    this._nameError  = document.getElementById("name-error");

    // Start the per-second clock tick
    this._intervalId = setInterval(function () {
      GreetingModule._tick();
    }, 1000);

    // Render immediately (don't wait a full second for the first display)
    this._tick();

    // Wire name form submit
    if (this._nameForm) {
      this._nameForm.addEventListener("submit", GreetingModule._handleNameSubmit);
    }

    // Clear error message whenever the name input changes
    if (this._nameInput && this._nameError) {
      this._nameInput.addEventListener("input", function () {
        GreetingModule._nameError.textContent = "";
      });
    }
  }
};

// =============================================================================
// TimerModule
// Manages the 25-minute Pomodoro focus timer: countdown, controls, and
// on-page notification when the session ends.
// Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10
// =============================================================================
var TimerModule = {
  // --- Private state ---------------------------------------------------------
  _remainingSeconds: 1500,  // 25 × 60
  _intervalId:       null,
  _isRunning:        false,

  // --- DOM references (populated in init) ------------------------------------
  _displayEl:      null,
  _startBtn:       null,
  _stopBtn:        null,
  _resetBtn:       null,
  _notificationEl: null,

  // ---------------------------------------------------------------------------
  // _render()
  // Formats _remainingSeconds as MM:SS, writes it to the display element, and
  // enables/disables the three control buttons based on _isRunning.
  //
  // Control state table:
  //   Running  → start disabled, stop enabled,  reset enabled
  //   Stopped  → start enabled,  stop disabled, reset enabled
  // Requirements: 2.1, 2.2, 2.8, 2.9
  // ---------------------------------------------------------------------------
  _render: function () {
    // Format time
    var minutes = Math.floor(this._remainingSeconds / 60);
    var seconds = this._remainingSeconds % 60;
    var formatted =
      String(minutes).padStart(2, "0") + ":" +
      String(seconds).padStart(2, "0");

    if (this._displayEl) {
      this._displayEl.textContent = formatted;
    }

    // Update button states
    if (this._startBtn) this._startBtn.disabled = this._isRunning;
    if (this._stopBtn)  this._stopBtn.disabled  = !this._isRunning;
    if (this._resetBtn) this._resetBtn.disabled = false; // always enabled
  },

  // ---------------------------------------------------------------------------
  // _tick()
  // Called every second by setInterval. Decrements the counter, re-renders,
  // and handles the "session complete" case.
  // Requirements: 2.3, 2.4, 2.5
  // ---------------------------------------------------------------------------
  _tick: function () {
    TimerModule._remainingSeconds -= 1;
    TimerModule._render();

    if (TimerModule._remainingSeconds <= 0) {
      clearInterval(TimerModule._intervalId);
      TimerModule._intervalId = null;
      TimerModule._isRunning  = false;
      TimerModule._render();
      TimerModule._notify();
    }
  },

  // ---------------------------------------------------------------------------
  // _notify()
  // Reveals the on-page notification element to inform the user that the focus
  // session has ended.
  // Requirements: 2.6
  // ---------------------------------------------------------------------------
  _notify: function () {
    if (this._notificationEl) {
      this._notificationEl.removeAttribute("hidden");
    }
  },

  // ---------------------------------------------------------------------------
  // _start()
  // Starts the countdown. No-op if the timer is already running.
  // Requirements: 2.7, 2.8
  // ---------------------------------------------------------------------------
  _start: function () {
    if (this._isRunning) return;
    this._isRunning  = true;
    this._intervalId = setInterval(TimerModule._tick, 1000);
    this._render();
  },

  // ---------------------------------------------------------------------------
  // _stop()
  // Pauses the countdown. No-op if the timer is not running.
  // Requirements: 2.7, 2.9
  // ---------------------------------------------------------------------------
  _stop: function () {
    if (!this._isRunning) return;
    clearInterval(this._intervalId);
    this._intervalId = null;
    this._isRunning  = false;
    this._render();
  },

  // ---------------------------------------------------------------------------
  // _reset()
  // Resets the timer back to 25:00, clears any running interval, and hides the
  // notification element.
  // Requirements: 2.10
  // ---------------------------------------------------------------------------
  _reset: function () {
    if (this._isRunning) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    this._isRunning        = false;
    this._remainingSeconds = 1500;
    this._render();

    if (this._notificationEl) {
      this._notificationEl.setAttribute("hidden", "");
    }
  },

  // ---------------------------------------------------------------------------
  // init()
  // Queries DOM references, wires button click events, and renders the initial
  // 25:00 display.
  // Requirements: 2.1, 2.2
  // ---------------------------------------------------------------------------
  init: function () {
    this._displayEl      = document.getElementById("timer-display");
    this._startBtn       = document.getElementById("timer-start");
    this._stopBtn        = document.getElementById("timer-stop");
    this._resetBtn       = document.getElementById("timer-reset");
    this._notificationEl = document.getElementById("timer-notification");

    if (this._startBtn) {
      this._startBtn.addEventListener("click", function () {
        TimerModule._start();
      });
    }

    if (this._stopBtn) {
      this._stopBtn.addEventListener("click", function () {
        TimerModule._stop();
      });
    }

    if (this._resetBtn) {
      this._resetBtn.addEventListener("click", function () {
        TimerModule._reset();
      });
    }

    // Show initial 25:00 and set correct button states
    this._render();
  }
};

// =============================================================================
// TaskModule
// Manages the to-do task list: validation, duplicate detection, CRUD
// operations, persistence, and rendering.
// Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2
// =============================================================================
var TaskModule = {
  // --- In-memory task array --------------------------------------------------
  _tasks: [],

  // ---------------------------------------------------------------------------
  // _validateTitle(title)
  // Validates a task title string.
  // - Trimmed value is empty/whitespace → returns "Task title cannot be empty."
  // - Trimmed length > 255             → returns "Task title must be 255 characters or fewer."
  // - Otherwise                        → returns null (valid)
  // Requirements: 3.3
  // ---------------------------------------------------------------------------
  _validateTitle: function (title) {
    var trimmed = typeof title === "string" ? title.trim() : "";
    if (trimmed.length === 0) {
      return "Task title cannot be empty.";
    }
    if (trimmed.length > 255) {
      return "Task title must be 255 characters or fewer.";
    }
    return null;
  },

  // ---------------------------------------------------------------------------
  // _isDuplicate(title, excludeId)
  // Checks whether a task with the same title (case-insensitive, trimmed)
  // already exists in _tasks, ignoring the task whose id === excludeId.
  // Pass null for excludeId when adding a new task.
  // Returns true if a duplicate is found, false otherwise.
  // Requirements: 3.4, 4.1
  // ---------------------------------------------------------------------------
  _isDuplicate: function (title, excludeId) {
    var normalised = title.trim().toLowerCase();
    for (var i = 0; i < this._tasks.length; i++) {
      var task = this._tasks[i];
      if (task.id === excludeId) continue;
      if (task.title.toLowerCase() === normalised) return true;
    }
    return false;
  },

  // ---------------------------------------------------------------------------
  // _addTask(title)
  // Validates the title, checks for duplicates, creates a Task object, pushes
  // it to _tasks, persists it, and re-renders. Rolls back on save failure.
  // Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.2
  // ---------------------------------------------------------------------------
  _addTask: function (title) {
    var errorEl  = document.getElementById("task-error");
    var inputEl  = document.getElementById("task-input");

    // Helper: show an error message below the form
    function showError(msg) {
      if (errorEl) errorEl.textContent = msg;
    }

    // 1. Validate title
    var validationError = TaskModule._validateTitle(title);
    if (validationError) {
      showError(validationError);
      return;
    }

    var trimmedTitle = title.trim();

    // 2. Check for duplicates
    if (TaskModule._isDuplicate(trimmedTitle, null)) {
      showError("A task with this title already exists.");
      return;
    }

    // 3. Create Task object
    var newTask = {
      id:        (typeof crypto !== "undefined" && crypto.randomUUID)
                   ? crypto.randomUUID()
                   : (Date.now().toString(36) + Math.random().toString(36).slice(2)),
      title:     trimmedTitle,
      status:    "pending",
      createdAt: Date.now()
    };

    // 4. Push to in-memory array
    TaskModule._tasks.push(newTask);

    // 5. Persist — roll back on failure
    var saved = TaskModule._saveToStorage();
    if (!saved) {
      TaskModule._tasks.pop();
      showError("Could not save task. Storage may be full.");
      return;
    }

    // 6. Re-render and clear input
    TaskModule._render();
    if (inputEl) inputEl.value = "";
  },

  // ---------------------------------------------------------------------------
  // _saveToStorage()
  // Persists the current _tasks array to localStorage via StorageModule.
  // Returns true on success, false on failure (caller handles rollback).
  // Requirements: 8.2
  // ---------------------------------------------------------------------------
  _saveToStorage: function () {
    return StorageModule.set(KEYS.TASKS, this._tasks);
  },

  // ---------------------------------------------------------------------------
  // _render()
  // Clears the task list container and rebuilds it from _tasks.
  // Shows the empty-state element when the list is empty.
  // Requirements: 3.1, 3.2, 4.1, 4.2, 5.10, 5.11
  // ---------------------------------------------------------------------------
  _render: function () {
    var listEl       = document.getElementById("task-list");
    var emptyStateEl = document.getElementById("task-empty-state");

    if (!listEl) return;

    // Remove all children
    while (listEl.firstChild) {
      listEl.removeChild(listEl.firstChild);
    }

    if (TaskModule._tasks.length === 0) {
      // Show the empty-state placeholder
      if (emptyStateEl) {
        listEl.appendChild(emptyStateEl);
      }
    } else {
      // Hide the empty-state element so it doesn't appear in the live list
      if (emptyStateEl && emptyStateEl.parentNode === listEl) {
        listEl.removeChild(emptyStateEl);
      }
      // Render each task
      for (var i = 0; i < TaskModule._tasks.length; i++) {
        listEl.appendChild(TaskModule._renderTask(TaskModule._tasks[i]));
      }
    }
  },

  // ---------------------------------------------------------------------------
  // _renderTask(task)
  // Builds and returns a <li> element for a single task with: completion
  // toggle checkbox, title <span>, edit button (stub), and delete button.
  // Wires the toggle and delete events inline.
  // Requirements: 3.5, 3.6, 4.1, 4.2, 5.10, 5.11, 5.13
  // ---------------------------------------------------------------------------
  _renderTask: function (task) {
    var li = document.createElement("li");
    li.dataset.taskId = task.id;

    // --- Completion toggle checkbox ---
    var checkbox = document.createElement("input");
    checkbox.type    = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.status === "done";
    checkbox.setAttribute("aria-label", "Mark task as " + (task.status === "done" ? "pending" : "done"));
    checkbox.addEventListener("change", function () {
      TaskModule._toggleTask(task.id);
    });

    // --- Title span ---
    var titleSpan = document.createElement("span");
    titleSpan.className = "task-title";
    titleSpan.textContent = task.title;
    if (task.status === "done") {
      titleSpan.classList.add("task-done"); // CSS: text-decoration: line-through
    }

    // --- Edit button ---
    var editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-sm btn-secondary";
    editBtn.textContent = "Edit";
    editBtn.dataset.action = "edit";
    editBtn.setAttribute("aria-label", "Edit task: " + task.title);

    // --- Delete button ---
    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.dataset.action = "delete";
    deleteBtn.setAttribute("aria-label", "Delete task: " + task.title);
    deleteBtn.addEventListener("click", function () {
      TaskModule._deleteTask(task.id);
    });

    // Wire edit button: replace title span with inline input + Save/Cancel
    editBtn.addEventListener("click", function () {
      // Hide edit and delete buttons during editing
      editBtn.style.display  = "none";
      deleteBtn.style.display = "none";

      // Remove the static title span
      if (titleSpan.parentNode === li) {
        li.removeChild(titleSpan);
      }

      // Create inline text input pre-filled with current title
      var inputEl = document.createElement("input");
      inputEl.type  = "text";
      inputEl.className = "task-edit-input";
      inputEl.value = task.title;
      inputEl.setAttribute("aria-label", "Edit title for task: " + task.title);

      // Save button
      var saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "btn btn-sm btn-primary";
      saveBtn.textContent = "Save";
      saveBtn.dataset.action = "save-edit";
      saveBtn.addEventListener("click", function () {
        TaskModule._editTask(task.id, inputEl.value);
        // _editTask calls _render() on success or after duplicate/empty;
        // nothing more needed here — the li is already removed by _render
      });

      // Cancel button — re-render to restore original state without saving
      var cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "btn btn-sm btn-secondary";
      cancelBtn.textContent = "Cancel";
      cancelBtn.dataset.action = "cancel-edit";
      cancelBtn.addEventListener("click", function () {
        TaskModule._render();
      });

      // Insert input and action buttons after the checkbox
      li.insertBefore(inputEl, editBtn);
      li.insertBefore(saveBtn, editBtn);
      li.insertBefore(cancelBtn, editBtn);

      // Focus the input and move cursor to end
      inputEl.focus();
      inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
    });

    li.appendChild(checkbox);
    li.appendChild(titleSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    return li;
  },

  // ---------------------------------------------------------------------------
  // _toggleTask(id)
  // Flips a task's status between "pending" and "done", persists, and
  // re-renders. Rolls back on storage failure.
  // Requirements: 5.7, 5.8, 5.9, 5.13
  // ---------------------------------------------------------------------------
  _toggleTask: function (id) {
    var errorEl  = document.getElementById("task-error");
    var snapshot = JSON.parse(JSON.stringify(this._tasks));

    // Find the task and flip its status
    var task = null;
    for (var i = 0; i < this._tasks.length; i++) {
      if (this._tasks[i].id === id) {
        task = this._tasks[i];
        break;
      }
    }
    if (!task) return;

    task.status = task.status === "done" ? "pending" : "done";

    var saved = this._saveToStorage();
    if (!saved) {
      // Restore snapshot on failure
      this._tasks = snapshot;
      if (errorEl) errorEl.textContent = "Could not save change. Storage may be full.";
      return;
    }

    this._render();
  },

  // ---------------------------------------------------------------------------
  // _deleteTask(id)
  // Removes the task with the given id, persists, and re-renders.
  // Rolls back on storage failure.
  // Requirements: 5.11, 5.12, 5.13
  // ---------------------------------------------------------------------------
  _deleteTask: function (id) {
    var errorEl  = document.getElementById("task-error");
    var snapshot = JSON.parse(JSON.stringify(this._tasks));

    this._tasks = this._tasks.filter(function (t) { return t.id !== id; });

    var saved = this._saveToStorage();
    if (!saved) {
      this._tasks = snapshot;
      if (errorEl) errorEl.textContent = "Could not save change. Storage may be full.";
      return;
    }

    this._render();
  },

  // ---------------------------------------------------------------------------
  // _editTask(id, newTitle)
  // Updates a task's title after validation.
  // - Empty/whitespace → discard edit silently, re-render to close inline input
  // - Case-insensitive duplicate → discard edit, show duplicate error, re-render
  // - Valid → update title, persist, re-render; roll back on storage failure
  // Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.13
  // ---------------------------------------------------------------------------
  _editTask: function (id, newTitle) {
    var errorEl = document.getElementById("task-error");

    var trimmed = typeof newTitle === "string" ? newTitle.trim() : "";

    // Find the task
    var task = null;
    for (var i = 0; i < this._tasks.length; i++) {
      if (this._tasks[i].id === id) {
        task = this._tasks[i];
        break;
      }
    }
    if (!task) return;

    // Empty/whitespace: silently discard, close inline input
    if (trimmed.length === 0) {
      this._render();
      return;
    }

    // Duplicate check (case-insensitive, excluding this task itself)
    if (this._isDuplicate(trimmed, id)) {
      if (errorEl) errorEl.textContent = "A task with this title already exists.";
      this._render();
      return;
    }

    // Valid update — save original title for rollback
    var originalTitle = task.title;
    task.title = trimmed;

    var saved = this._saveToStorage();
    if (!saved) {
      task.title = originalTitle;
      if (errorEl) errorEl.textContent = "Could not save change. Storage may be full.";
      return;
    }

    this._render();
  },

  // ---------------------------------------------------------------------------
  // init()
  // Queries all task-related DOM refs, loads persisted tasks from localStorage,
  // renders the initial list state, and wires the add-task form events.
  // Requirements: 3.5, 3.6, 8.6
  // ---------------------------------------------------------------------------
  init: function () {
    // 1. Query DOM references
    this._listEl       = document.getElementById("task-list");
    this._emptyStateEl = document.getElementById("task-empty-state");
    this._taskForm     = document.getElementById("task-form");
    this._taskInput    = document.getElementById("task-input");
    this._errorEl      = document.getElementById("task-error");

    // 2. Load tasks from storage — fall back to [] if missing or corrupt
    var stored = StorageModule.get(KEYS.TASKS);
    this._tasks = Array.isArray(stored) ? stored : [];

    // 3. Render the initial state (empty-state or loaded task list)
    this._render();

    // 4. Wire the add-task form submit
    if (this._taskForm) {
      this._taskForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var rawValue = TaskModule._taskInput ? TaskModule._taskInput.value : "";
        TaskModule._addTask(rawValue);
      });
    }

    // 5. Clear the error message whenever the user types in the task input
    if (this._taskInput && this._errorEl) {
      this._taskInput.addEventListener("input", function () {
        TaskModule._errorEl.textContent = "";
      });
    }
  }
};

// =============================================================================
// LinkModule
// Manages the quick-links list: validation, duplicate detection, CRUD
// operations, persistence, and rendering.
// Requirements: 6.1, 6.3, 6.4, 6.5
// =============================================================================
var LinkModule = {
  // --- In-memory link array --------------------------------------------------
  _links: [],

  // --- DOM references (populated in init) ------------------------------------
  _linkForm:      null,
  _labelInputEl:  null,
  _urlInputEl:    null,
  _labelErrorEl:  null,
  _urlErrorEl:    null,
  _panelEl:       null,

  // ---------------------------------------------------------------------------
  // _validateLink(label, url)
  // Validates a link's label and URL strings.
  // Returns an object { labelError, urlError } where each field is either a
  // non-null error string or null if that field is valid.
  // Returns null (not the object) when BOTH fields are valid.
  //
  // Label rules (Requirements: 6.3):
  //   - Trimmed value is empty/whitespace → "Link label cannot be empty."
  //   - Trimmed length > 50              → "Link label must be 50 characters or fewer."
  //   - Otherwise                        → null (valid)
  //
  // URL rules (Requirements: 6.4, 6.5):
  //   - Trimmed value is empty/whitespace                           → "URL cannot be empty."
  //   - Does not start with http:// or https:// (case-insensitive) → "URL must start with http:// or https://."
  //   - Trimmed length > 2048                                       → "URL must be 2048 characters or fewer."
  //   - Otherwise                                                   → null (valid)
  // ---------------------------------------------------------------------------
  _validateLink: function (label, url) {
    var labelTrimmed = typeof label === "string" ? label.trim() : "";
    var urlTrimmed   = typeof url   === "string" ? url.trim()   : "";

    // Validate label
    var labelError = null;
    if (labelTrimmed.length === 0) {
      labelError = "Link label cannot be empty.";
    } else if (labelTrimmed.length > 50) {
      labelError = "Link label must be 50 characters or fewer.";
    }

    // Validate URL
    var urlError = null;
    if (urlTrimmed.length === 0) {
      urlError = "URL cannot be empty.";
    } else if (!/^https?:\/\//i.test(urlTrimmed)) {
      urlError = "URL must start with http:// or https://.";
    } else if (urlTrimmed.length > 2048) {
      urlError = "URL must be 2048 characters or fewer.";
    }

    // Return null when both fields are valid (no errors)
    if (labelError === null && urlError === null) {
      return null;
    }

    return { labelError: labelError, urlError: urlError };
  },

  // ---------------------------------------------------------------------------
  // _isDuplicateUrl(url)
  // Checks whether a link with the same URL already exists in _links.
  // Comparison: url.trim().toLowerCase() vs each link's url.toLowerCase().
  // Returns true if any match is found, false otherwise.
  // Requirements: 6.1
  // ---------------------------------------------------------------------------
  _isDuplicateUrl: function (url) {
    var normalised = typeof url === "string" ? url.trim().toLowerCase() : "";
    for (var i = 0; i < this._links.length; i++) {
      if (this._links[i].url.toLowerCase() === normalised) return true;
    }
    return false;
  },

  // ---------------------------------------------------------------------------
  // _addLink(label, url)
  // Validates the label and url, checks for duplicate URLs, creates a
  // QuickLink object, pushes it to _links, persists, and re-renders.
  // Rolls back on save failure. Clears the form inputs on success.
  // Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 8.3
  // ---------------------------------------------------------------------------
  _addLink: function (label, url) {
    var labelErrorEl = document.getElementById("link-label-error");
    var urlErrorEl   = document.getElementById("link-url-error");

    // Clear previous errors
    if (labelErrorEl) labelErrorEl.textContent = "";
    if (urlErrorEl)   urlErrorEl.textContent   = "";

    // 1. Validate label and url
    var errors = LinkModule._validateLink(label, url);
    if (errors !== null) {
      if (labelErrorEl && errors.labelError) {
        labelErrorEl.textContent = errors.labelError;
      }
      if (urlErrorEl && errors.urlError) {
        urlErrorEl.textContent = errors.urlError;
      }
      return;
    }

    var trimmedLabel = label.trim();
    var trimmedUrl   = url.trim();

    // 2. Check for duplicate URL
    if (LinkModule._isDuplicateUrl(trimmedUrl)) {
      if (urlErrorEl) urlErrorEl.textContent = "This URL has already been added.";
      return;
    }

    // 3. Create QuickLink object
    var newLink = {
      id:    (typeof crypto !== "undefined" && crypto.randomUUID)
               ? crypto.randomUUID()
               : (Date.now().toString(36) + Math.random().toString(36).slice(2)),
      label: trimmedLabel,
      url:   trimmedUrl
    };

    // 4. Push to in-memory array
    LinkModule._links.push(newLink);

    // 5. Persist — roll back on failure
    var saved = LinkModule._saveToStorage();
    if (!saved) {
      LinkModule._links.pop();
      if (urlErrorEl) urlErrorEl.textContent = "Could not save link. Storage may be full.";
      return;
    }

    // 6. Re-render and clear form inputs
    LinkModule._render();
    var labelInputEl = document.getElementById("link-label-input");
    var urlInputEl   = document.getElementById("link-url-input");
    if (labelInputEl) labelInputEl.value = "";
    if (urlInputEl)   urlInputEl.value   = "";
  },

  // ---------------------------------------------------------------------------
  // _deleteLink(id)
  // Removes the link with the given id, persists, and re-renders.
  // Rolls back on storage failure.
  // Requirements: 6.6, 6.7, 6.8, 8.3
  // ---------------------------------------------------------------------------
  _deleteLink: function (id) {
    var urlErrorEl = document.getElementById("link-url-error");
    var snapshot   = JSON.parse(JSON.stringify(LinkModule._links));

    LinkModule._links = LinkModule._links.filter(function (l) { return l.id !== id; });

    var saved = LinkModule._saveToStorage();
    if (!saved) {
      LinkModule._links = snapshot;
      if (urlErrorEl) urlErrorEl.textContent = "Could not save change. Storage may be full.";
      return;
    }

    LinkModule._render();
  },

  // ---------------------------------------------------------------------------
  // _saveToStorage()
  // Persists the current _links array to localStorage via StorageModule.
  // Returns true on success, false on failure (caller handles rollback).
  // Requirements: 8.3
  // ---------------------------------------------------------------------------
  _saveToStorage: function () {
    return StorageModule.set(KEYS.LINKS, this._links);
  },

  // ---------------------------------------------------------------------------
  // _render()
  // Clears the #links-panel container and rebuilds it from _links.
  // Each link renders as a launch <button> (opens url in new tab) and a
  // separate delete <button>. Events are wired inside this function.
  // Requirements: 6.1, 6.6, 6.7, 6.8
  // ---------------------------------------------------------------------------
  _render: function () {
    var panelEl = document.getElementById("links-panel");
    if (!panelEl) return;

    // Remove all children
    while (panelEl.firstChild) {
      panelEl.removeChild(panelEl.firstChild);
    }

    for (var i = 0; i < LinkModule._links.length; i++) {
      (function (link) {
        var itemEl = document.createElement("div");
        itemEl.className = "link-item";

        // Launch button — opens url in a new tab
        var launchBtn = document.createElement("button");
        launchBtn.type        = "button";
        launchBtn.className   = "link-open";
        launchBtn.textContent = link.label;
        launchBtn.setAttribute("aria-label", "Open link: " + link.label);
        launchBtn.setAttribute("rel", "noopener noreferrer");
        launchBtn.addEventListener("click", function () {
          window.open(link.url, "_blank");
        });

        // Delete button
        var deleteBtn = document.createElement("button");
        deleteBtn.type        = "button";
        deleteBtn.className   = "link-delete";
        deleteBtn.textContent = "\u00d7";
        deleteBtn.dataset.action = "delete";
        deleteBtn.setAttribute("aria-label", "Delete link: " + link.label);
        deleteBtn.addEventListener("click", function () {
          LinkModule._deleteLink(link.id);
        });

        itemEl.appendChild(launchBtn);
        itemEl.appendChild(deleteBtn);
        panelEl.appendChild(itemEl);
      })(LinkModule._links[i]);
    }
  },

  // ---------------------------------------------------------------------------
  // init()
  // Queries all link-related DOM refs, loads persisted links from localStorage,
  // renders the initial panel state, and wires the add-link form events.
  // Requirements: 6.9, 8.6
  // ---------------------------------------------------------------------------
  init: function () {
    // 1. Query DOM references
    this._linkForm     = document.getElementById("link-form");
    this._labelInputEl = document.getElementById("link-label-input");
    this._urlInputEl   = document.getElementById("link-url-input");
    this._labelErrorEl = document.getElementById("link-label-error");
    this._urlErrorEl   = document.getElementById("link-url-error");
    this._panelEl      = document.getElementById("links-panel");

    // 2. Load links from storage — fall back to [] if missing or corrupt
    var stored = StorageModule.get(KEYS.LINKS);
    this._links = Array.isArray(stored) ? stored : [];

    // 3. Render the initial state
    this._render();

    // 4. Wire the add-link form submit
    if (this._linkForm) {
      this._linkForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var labelVal = LinkModule._labelInputEl ? LinkModule._labelInputEl.value : "";
        var urlVal   = LinkModule._urlInputEl   ? LinkModule._urlInputEl.value   : "";
        LinkModule._addLink(labelVal, urlVal);
      });
    }

    // 5. Clear label error whenever the label input changes
    if (this._labelInputEl && this._labelErrorEl) {
      this._labelInputEl.addEventListener("input", function () {
        LinkModule._labelErrorEl.textContent = "";
      });
    }

    // 6. Clear URL error whenever the URL input changes
    if (this._urlInputEl && this._urlErrorEl) {
      this._urlInputEl.addEventListener("input", function () {
        LinkModule._urlErrorEl.textContent = "";
      });
    }
  }
};

// =============================================================================
// PHASE 2 — DOMContentLoaded: wire up all modules after DOM is ready
// =============================================================================
document.addEventListener("DOMContentLoaded", function () {
  ThemeModule.init();    // task 3.1
  GreetingModule.init();    // task 4.1
  TimerModule.init();    // task 5.1
  TaskModule.init();     // task 7.4 (partial), 7.9 (full)
  LinkModule.init();     // task 9.2 (init wired; full task 9.5)
});
