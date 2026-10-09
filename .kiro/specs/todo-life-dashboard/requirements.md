# Requirements Document

## Introduction

The To-Do List Life Dashboard is a single-page web application (index.html) built with HTML, CSS, and Vanilla JavaScript. It requires no backend server and persists all data in the browser's Local Storage. The dashboard combines a personalized greeting with current time and date, a 25-minute Pomodoro-style focus timer, a task management list, quick-access links to favorite websites, and a light/dark mode toggle — all in a clean, minimal interface.

## Glossary

- **Dashboard**: The single-page web application rendered by index.html
- **Focus_Timer**: A 25-minute countdown timer displayed on the Dashboard
- **Task**: A to-do item managed in the To-Do List
- **Task_List**: The collection of Tasks displayed and managed on the Dashboard
- **Quick_Link**: A saved URL with a label that opens in a new browser tab
- **Local_Storage**: The browser's built-in client-side key-value storage (window.localStorage)
- **Theme**: The visual color scheme of the Dashboard, either "light" or "dark"
- **User_Name**: A custom name entered by the user, used in the greeting
- **Greeting**: The personalized salutation displayed at the top of the Dashboard
- **Duplicate_Task**: A Task whose title matches an existing Task's title in a case-insensitive comparison

---

## Requirements

### Requirement 1: Greeting with Time, Date, and Custom Name

**User Story:** As a user, I want to see the current time, date, and a personalized greeting when I open the Dashboard, so that I feel welcomed and oriented throughout my day.

#### Acceptance Criteria

1. THE Dashboard SHALL display the current local time in HH:MM:SS 24-hour format (HH: 00–23, MM: 00–59, SS: 00–59), updated every second.
2. THE Dashboard SHALL display the current local date in the format "DayName, MonthName DD, YYYY" in English (e.g., "Saturday, October 10, 2026").
3. WHEN the current local hour is between 5 and 11 (inclusive), THE Dashboard SHALL display the greeting "Good Morning".
4. WHEN the current local hour is between 12 and 17 (inclusive), THE Dashboard SHALL display the greeting "Good Afternoon".
5. WHEN the current local hour is between 18 and 21 (inclusive), THE Dashboard SHALL display the greeting "Good Evening".
6. WHEN the current local hour is between 22 and 23 or between 0 and 4 (inclusive), THE Dashboard SHALL display the greeting "Good Night".
7. WHEN a User_Name is stored in Local_Storage, THE Dashboard SHALL display the greeting in the format "[Greeting], [User_Name]!" (e.g., "Good Morning, Liora!").
8. WHEN no User_Name is stored in Local_Storage, THE Dashboard SHALL display the greeting in the format "[Greeting]!" (e.g., "Good Morning!").
9. THE Dashboard SHALL provide an input field that allows the user to enter or update the User_Name, accepting between 1 and 50 characters.
10. WHEN the user submits a non-empty User_Name of 1–50 characters via the input field, THE Dashboard SHALL save the User_Name to Local_Storage and update the greeting immediately without requiring a page reload.
11. WHEN the user submits a User_Name exceeding 50 characters, THE Dashboard SHALL reject the input and display an error message indicating the name is too long.
12. WHEN the user submits an empty User_Name via the input field, THE Dashboard SHALL remove the User_Name from Local_Storage and revert the greeting to the "[Greeting]!" form immediately without requiring a page reload.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can manage focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL display a countdown starting at 25 minutes 00 seconds (25:00) in MM:SS format when the Dashboard first loads or after a reset.
2. WHEN the user activates the start control, THE Focus_Timer SHALL begin counting down one second at a time.
3. WHILE the Focus_Timer is counting down, THE Dashboard SHALL update the displayed time every second, with a drift of no more than 100 milliseconds per second interval.
4. WHEN the user activates the stop control, THE Focus_Timer SHALL pause the countdown and retain the current remaining time unchanged.
5. WHEN the user activates the reset control, THE Focus_Timer SHALL stop any active countdown and return the displayed time to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display a visible on-page notification indicating the session has ended.
7. WHILE the Focus_Timer is counting down, THE Dashboard SHALL disable the start control and enable the stop and reset controls.
8. WHILE the Focus_Timer is paused or stopped, THE Dashboard SHALL enable the start control and disable the stop control.
9. IF the user activates the start control while the Focus_Timer is already counting down, THEN THE Focus_Timer SHALL ignore the activation and continue counting down without interruption.
10. IF the user activates the stop control while the Focus_Timer is already paused or stopped, THEN THE Focus_Timer SHALL ignore the activation and retain the current displayed time unchanged.

---

### Requirement 3: To-Do List — Add Tasks

**User Story:** As a user, I want to add tasks to my to-do list and have them saved automatically, so that I don't lose my tasks when I close or refresh the browser.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a text input (accepting 1–255 characters) and a submit control for adding a new Task.
2. WHEN the user submits a non-empty task title (after trimming whitespace) of 1–255 characters, THE Task_List SHALL add the new Task with a status of "pending", clear the input field, and save the updated Task_List to Local_Storage.
3. WHEN the user submits an empty task title or a title containing only whitespace, THE Dashboard SHALL not add a Task and SHALL display an error message directly below the input field indicating the title cannot be empty.
4. WHEN the user submits a task title exceeding 255 characters, THE Dashboard SHALL not add a Task and SHALL display an error message indicating the title is too long.
5. WHEN the Dashboard loads, THE Task_List SHALL restore all previously saved Tasks from Local_Storage.
6. WHEN the Dashboard loads and Local_Storage contains no Task data, THE Task_List SHALL display an empty-state message (e.g., "No tasks yet. Add one above!").

---

### Requirement 4: To-Do List — Duplicate Prevention

**User Story:** As a user, I want to be prevented from adding duplicate tasks, so that my task list stays clean and unambiguous.

#### Acceptance Criteria

1. WHEN the user submits a task title that, after trimming whitespace, matches an existing Task title in a case-insensitive comparison, THE Dashboard SHALL not add the Task and SHALL display an error message directly below the input field indicating a duplicate task already exists.
2. WHEN the user changes the value in the task input field after a duplicate or validation error, THE Dashboard SHALL clear the error message.

---

### Requirement 5: To-Do List — Edit, Complete, and Delete Tasks

**User Story:** As a user, I want to edit, mark as done, and delete tasks, so that I can keep my task list accurate and up to date.

#### Acceptance Criteria

1. THE Dashboard SHALL display an edit control for each Task.
2. WHEN the user activates the edit control for a Task, THE Dashboard SHALL display an inline text input pre-filled with the Task's current title and allow the user to modify it.
3. WHEN the user saves an edited Task title that is non-empty after trimming leading and trailing whitespace, and is not a case-insensitive duplicate of another existing Task title, THE Task_List SHALL update the Task's title to the trimmed value and save the updated Task_List to Local_Storage.
4. IF the user saves an edited Task title that is empty or contains only whitespace after trimming, THEN THE Dashboard SHALL discard the edit, retain the original title, and close the inline input without saving to Local_Storage.
5. IF the user saves an edited Task title that is a case-insensitive duplicate of another existing Task title, THEN THE Dashboard SHALL discard the edit, retain the original title, and display an error message indicating a duplicate task already exists.
6. WHEN the user activates the edit control for a Task, THE Dashboard SHALL provide a way to cancel the edit, restoring the original title without saving to Local_Storage.
7. THE Dashboard SHALL display a completion toggle control for each Task.
8. WHEN the user activates the completion toggle for a pending Task, THE Task_List SHALL update the Task's status to "done" and save the updated Task_List to Local_Storage.
9. WHEN the user activates the completion toggle for a done Task, THE Task_List SHALL update the Task's status back to "pending" and save the updated Task_List to Local_Storage.
10. THE Dashboard SHALL visually distinguish done Tasks from pending Tasks by applying strikethrough styling to the title text of done Tasks.
11. THE Dashboard SHALL display a delete control for each Task.
12. WHEN the user activates the delete control for a Task, THE Task_List SHALL remove the Task and save the updated Task_List to Local_Storage.
13. IF saving the updated Task_List to Local_Storage fails during any edit, completion toggle, or delete operation, THEN THE Dashboard SHALL revert the in-memory Task_List to its state before the operation and display an error message indicating the change could not be saved.

---

### Requirement 6: Quick Links

**User Story:** As a user, I want to save and access my favorite website links from the Dashboard, so that I can quickly navigate to the sites I use most.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an input form to add a Quick_Link with a label (1–50 characters) and a URL (must begin with http:// or https://, max 2048 characters).
2. WHEN the user submits a Quick_Link with a valid label and a valid URL that is not a case-insensitive duplicate of an existing Quick_Link URL, THE Dashboard SHALL add the Quick_Link and save the updated Quick_Link collection to Local_Storage.
3. WHEN the user submits a Quick_Link with an empty label, THE Dashboard SHALL not add the Quick_Link and SHALL display an error message specifying that the label is required.
4. WHEN the user submits a Quick_Link with an empty URL or a URL that does not begin with http:// or https://, THE Dashboard SHALL not add the Quick_Link and SHALL display an error message specifying that a valid URL starting with http:// or https:// is required.
5. WHEN the user submits a Quick_Link URL that is a case-insensitive duplicate of an existing Quick_Link URL, THE Dashboard SHALL not add the Quick_Link and SHALL display an error message indicating the URL already exists.
6. WHEN the user activates a Quick_Link button, THE Dashboard SHALL open the associated URL in a new browser tab.
7. THE Dashboard SHALL display a delete control for each Quick_Link.
8. WHEN the user activates the delete control for a Quick_Link, THE Dashboard SHALL remove the Quick_Link and save the updated Quick_Link collection to Local_Storage.
9. WHEN the Dashboard loads, THE Dashboard SHALL restore all previously saved Quick_Links from Local_Storage.

---

### Requirement 7: Light / Dark Mode Toggle

**User Story:** As a user, I want to toggle between a light and dark color theme, and have my preference remembered, so that I can use the Dashboard comfortably in any lighting condition.

#### Acceptance Criteria

1. THE Dashboard SHALL display a toggle control that reflects the current active Theme visually and switches between light and dark Theme.
2. WHEN the user activates the Theme toggle, THE Dashboard SHALL switch to the opposite Theme and apply the new visual styles to the entire page within 100 milliseconds, without a page reload.
3. WHEN a Theme preference is stored in Local_Storage, THE Dashboard SHALL apply that Theme on load before the page is rendered to the user (no flash of wrong theme).
4. WHEN no Theme preference is stored in Local_Storage, THE Dashboard SHALL default to the light Theme on load.
5. WHEN the Theme changes, THE Dashboard SHALL save the new Theme preference to Local_Storage.

---

### Requirement 8: Data Persistence and Storage

**User Story:** As a user, I want all my data to be automatically saved to my browser so nothing is lost when I close the tab or refresh the page.

#### Acceptance Criteria

1. THE Dashboard SHALL use only the browser's Local_Storage API for all data persistence; no server-side storage is permitted.
2. THE Dashboard SHALL save Task_List data to Local_Storage under a consistent key every time the Task_List changes.
3. THE Dashboard SHALL save Quick_Link data to Local_Storage under a consistent key every time the Quick_Link collection changes.
4. THE Dashboard SHALL save the User_Name to Local_Storage under a consistent key every time the User_Name changes.
5. THE Dashboard SHALL save the Theme preference to Local_Storage under a consistent key every time the Theme changes.
6. WHEN Local_Storage data for any key is corrupted, unparseable, or of an unexpected type, THE Dashboard SHALL not throw an unhandled error and SHALL render the default empty state for the affected data section.

---

### Requirement 9: Performance and Compatibility

**User Story:** As a user, I want the Dashboard to load quickly and work reliably in any modern browser, so that I can use it everywhere without friction.

#### Acceptance Criteria

1. THE Dashboard SHALL load and have all UI controls responding to input within 3 seconds on a connection with ≥10 Mbps download speed.
2. THE Dashboard SHALL satisfy all acceptance criteria in the latest stable releases of Chrome, Firefox, Edge, and Safari.
3. THE Dashboard SHALL require no installation, build step, or backend server; opening index.html directly in a browser SHALL be sufficient to run the application.
4. THE Dashboard SHALL use only a single CSS file (css/style.css) and a single JavaScript file (js/script.js) for all styles and logic respectively.
5. WHEN a UI interaction occurs (task add, timer tick, theme toggle), THE Dashboard SHALL reflect the change within 100 milliseconds.
