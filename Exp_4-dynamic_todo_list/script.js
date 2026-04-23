
const taskInput    = document.getElementById('taskInput');     // text input
const taskList     = document.getElementById('taskList');      // <ul> container
const emptyState   = document.getElementById('emptyState');    // empty message
const pendingCount = document.getElementById('pendingCount');  // counter span
const completedCount = document.getElementById('completedCount'); // counter span

/* ===================================================================
   2. Unique ID Generator
   Returns a simple incrementing integer for each new task.
=================================================================== */
let taskIdCounter = 0;

/**
 * generateId
 * Returns a unique numeric ID for a new task item.
 * @returns {number}
 */
function generateId() {
  return ++taskIdCounter;
}

/* ===================================================================
   3. addTask  — Task 4
   Reads the input field, validates it, then creates a new task item.
=================================================================== */

/**
 * addTask
 * Called when the "Add Task" button is clicked or Enter is pressed.
 * Prevents empty tasks from being added.
 */
function addTask() {
  const rawText = taskInput.value;          // raw input string
  const text    = rawText.trim();           // strip leading/trailing whitespace

  /* --- Validation: block empty input --- */
  if (text === '') {
    shakeInput();                           // visual feedback for empty submit
    return;
  }

  /* --- Create task object --- */
  const task = {
    id       : generateId(),
    text     : text,
    completed: false
  };

  /* --- Render task to the DOM --- */
  renderTask(task);

  /* --- Reset input field --- */
  taskInput.value = '';
  taskInput.focus();

  /* --- Refresh counter --- */
  updateCounter();
}

/* ===================================================================
   4. renderTask
   Builds a task <li> element and appends it to the list.
   @param {object} task  — { id, text, completed }
=================================================================== */

/**
 * renderTask
 * Creates the HTML structure for a single task and inserts it into the DOM.
 * @param {object} task
 */
function renderTask(task) {
  /* --- Create list item --- */
  const li = document.createElement('li');
  li.classList.add('task-item');
  li.dataset.id = task.id;                  // store id as data attribute
  if (task.completed) li.classList.add('done');

  /* --- Checkbox (Task 6: completion toggle) --- */
  const checkbox    = document.createElement('input');
  checkbox.type     = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked  = task.completed;
  checkbox.setAttribute('aria-label', 'Mark task complete');
  checkbox.addEventListener('change', () => toggleComplete(li, checkbox));

  /* --- Task text span --- */
  const span   = document.createElement('span');
  span.className = 'task-text';
  span.textContent = task.text;

  /* --- Action buttons container --- */
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  /* Edit button */
  const editBtn  = document.createElement('button');
  editBtn.className  = 'btn btn-edit';
  editBtn.textContent = 'Edit';
  editBtn.setAttribute('aria-label', 'Edit task');
  editBtn.addEventListener('click', () => startEdit(li, span, editBtn, actions));

  /* Delete button */
  const deleteBtn  = document.createElement('button');
  deleteBtn.className  = 'btn btn-delete';
  deleteBtn.textContent = 'Delete';
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.addEventListener('click', () => deleteTask(li));

  /* Assemble action buttons */
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  /* Assemble full list item */
  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(actions);

  /* Add to the task list */
  taskList.appendChild(li);

  /* Hide the empty-state message */
  toggleEmptyState();
}

/* ===================================================================
   5. deleteTask  — Task 5
   Removes a task item from the DOM.
=================================================================== */

/**
 * deleteTask
 * Animates and removes a task <li> from the list.
 * @param {HTMLElement} li — the task list item to remove
 */
function deleteTask(li) {
  /* Brief fade-out before removal */
  li.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  li.style.opacity    = '0';
  li.style.transform  = 'translateX(20px)';

  setTimeout(() => {
    li.remove();
    toggleEmptyState();
    updateCounter();
  }, 200);
}

/* ===================================================================
   6. startEdit & saveEdit  — Task 5
   Replaces task text with an editable input field, then saves changes.
=================================================================== */

/**
 * startEdit
 * Switches a task item into edit mode — replaces the text span with
 * an <input> and swaps the Edit button for a Save button.
 * @param {HTMLElement} li       — task list item
 * @param {HTMLElement} span     — task text span
 * @param {HTMLElement} editBtn  — the Edit button element
 * @param {HTMLElement} actions  — the actions container div
 */
function startEdit(li, span, editBtn, actions) {
  /* --- Create inline edit input --- */
  const editInput   = document.createElement('input');
  editInput.type    = 'text';
  editInput.className = 'edit-input';
  editInput.value   = span.textContent;
  editInput.setAttribute('aria-label', 'Edit task text');
  editInput.maxLength = 120;

  /* Replace span with input */
  li.replaceChild(editInput, span);
  editInput.focus();
  editInput.select();                       // pre-select existing text

  /* --- Swap Edit ➜ Save button --- */
  const saveBtn     = document.createElement('button');
  saveBtn.className = 'btn btn-save';
  saveBtn.textContent = 'Save';
  saveBtn.setAttribute('aria-label', 'Save task');

  /* Replace edit button with save button */
  actions.replaceChild(saveBtn, editBtn);

  /* Save on button click */
  saveBtn.addEventListener('click', () => saveEdit(li, editInput, span, saveBtn, editBtn, actions));

  /* Save on Enter key */
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit(li, editInput, span, saveBtn, editBtn, actions);
    if (e.key === 'Escape') cancelEdit(li, editInput, span, saveBtn, editBtn, actions);
  });
}

/**
 * saveEdit
 * Validates the edited text and commits the change, restoring normal view.
 * @param {HTMLElement} li        — task list item
 * @param {HTMLInputElement} editInput — the inline edit field
 * @param {HTMLElement} span      — original task text span
 * @param {HTMLElement} saveBtn   — the Save button
 * @param {HTMLElement} editBtn   — the original Edit button
 * @param {HTMLElement} actions   — actions container
 */
function saveEdit(li, editInput, span, saveBtn, editBtn, actions) {
  const newText = editInput.value.trim();

  if (newText === '') {
    /* Highlight empty field instead of saving blank text */
    editInput.style.borderColor = '#ef4444';
    editInput.focus();
    return;
  }

  /* Update the span text */
  span.textContent = newText;

  /* Restore span in place of input */
  li.replaceChild(span, editInput);

  /* Restore Edit button in place of Save button */
  actions.replaceChild(editBtn, saveBtn);
}

/**
 * cancelEdit
 * Discards any changes and restores the original task view (triggered by Escape).
 */
function cancelEdit(li, editInput, span, saveBtn, editBtn, actions) {
  li.replaceChild(span, editInput);
  actions.replaceChild(editBtn, saveBtn);
}

/* ===================================================================
   7. toggleComplete  — Task 6 (Bonus)
   Marks/unmarks a task as complete with visual strikethrough.
=================================================================== */

/**
 * toggleComplete
 * Adds or removes the "done" class on a task item when the checkbox changes.
 * @param {HTMLElement}      li       — task list item
 * @param {HTMLInputElement} checkbox — the completion checkbox
 */
function toggleComplete(li, checkbox) {
  if (checkbox.checked) {
    li.classList.add('done');
  } else {
    li.classList.remove('done');
  }
  updateCounter();
}

/* ===================================================================
   8. updateCounter  — Task 6 (Bonus)
   Counts pending vs completed tasks and updates the header counter.
=================================================================== */

/**
 * updateCounter
 * Reads all task items in the DOM and refreshes the pending/completed labels.
 */
function updateCounter() {
  const allItems      = taskList.querySelectorAll('.task-item');
  const completedItems = taskList.querySelectorAll('.task-item.done');
  const total         = allItems.length;
  const done          = completedItems.length;
  const pending       = total - done;

  pendingCount.textContent   = `${pending} Pending`;
  completedCount.textContent = `${done} Completed`;
}

/* ===================================================================
   9. toggleEmptyState
   Shows or hides the "No tasks yet" message based on list contents.
=================================================================== */

/**
 * toggleEmptyState
 * Displays the empty-state paragraph when the task list is empty.
 */
function toggleEmptyState() {
  const hasItems = taskList.querySelectorAll('.task-item').length > 0;
  emptyState.style.display = hasItems ? 'none' : 'block';
}

/* ===================================================================
   10. shakeInput
   Briefly shakes the input box to signal an empty-submit attempt.
=================================================================== */

/**
 * shakeInput
 * Adds and removes a CSS shake animation class on the task input.
 */
function shakeInput() {
  taskInput.style.borderColor = '#ef4444';
  taskInput.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.2)';

  /* Reset the error style after a short delay */
  setTimeout(() => {
    taskInput.style.borderColor = '';
    taskInput.style.boxShadow   = '';
  }, 600);
}

/* ===================================================================
   11. Keyboard Shortcut — press Enter to add a task
=================================================================== */
taskInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') addTask();
});

/* ===================================================================
   12. Initialise UI on page load
=================================================================== */
document.addEventListener('DOMContentLoaded', function () {
  toggleEmptyState();   // show empty state message initially
  updateCounter();      // initialise counters at 0
});
