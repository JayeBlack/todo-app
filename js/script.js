// js/script.js

// Select DOM elements
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const body = document.body;
const todoInput = document.querySelector('.todo-input input');
const todoList = document.querySelector('.todo-list');
const itemsLeft = document.querySelector('.items-left');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.querySelector('.clear-completed');

// Load todos and theme from localStorage
let todos = JSON.parse(localStorage.getItem('todos')) || [
  { id: 1, text: 'Complete online JavaScript course', completed: true },
  { id: 2, text: 'Jog around the park 3x', completed: false },
  { id: 3, text: '10 minutes meditation', completed: false },
  { id: 4, text: 'Read for 1 hour', completed: false },
  { id: 5, text: 'Pick up groceries', completed: false },
  { id: 6, text: 'Complete Todo App on Frontend Mentor', completed: false },
];

// Current filter state
let currentFilter = 'all';

// Function to save todos to localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Function to save theme to localStorage
function saveTheme() {
  const theme = body.classList.contains('dark-theme') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
}

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-theme');
  body.classList.toggle('light-theme');

  if (body.classList.contains('dark-theme')) {
    themeIcon.src = './images/icon-sun.svg';
    themeIcon.alt = 'Toggle to light mode';
  } else {
    themeIcon.src = './images/icon-moon.svg';
    themeIcon.alt = 'Toggle to dark mode';
  }

  saveTheme();
});

// Load theme from localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  body.classList.add(savedTheme === 'dark' ? 'dark-theme' : 'light-theme');
} else {
  body.classList.add('dark-theme'); // Default to dark theme if no preference is saved
}

// Update theme icon based on loaded theme
if (body.classList.contains('dark-theme')) {
  themeIcon.src = './images/icon-sun.svg';
  themeIcon.alt = 'Toggle to light mode';
} else {
  themeIcon.src = './images/icon-moon.svg';
  themeIcon.alt = 'Toggle to dark mode';
}

// Function to render todos based on the current filter
function renderTodos() {
  todoList.innerHTML = '';
  let filteredTodos = todos;

  if (currentFilter === 'active') {
    filteredTodos = todos.filter(todo => !todo.completed);
  } else if (currentFilter === 'completed') {
    filteredTodos = todos.filter(todo => todo.completed);
  }

  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    if (todo.completed) li.classList.add('completed');
    li.setAttribute('draggable', 'true');
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" id="todo-${todo.id}" ${todo.completed ? 'checked' : ''} aria-label="Mark as complete">
      <label for="todo-${todo.id}">${todo.text}</label>
      <button class="delete-btn" aria-label="Delete todo">
        <img src="./images/icon-cross.svg" alt="Delete">
      </button>
    `;

    todoList.appendChild(li);
  });

  updateItemsLeft();
  saveTodos(); // Save todos to localStorage after rendering
}

// Function to update the "items left" counter
function updateItemsLeft() {
  const activeTodos = todos.filter(todo => !todo.completed).length;
  itemsLeft.textContent = `${activeTodos} items left`;
}

// Add new todo
todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && todoInput.value.trim() !== '') {
    const newTodo = {
      id: todos.length ? todos[todos.length - 1].id + 1 : 1,
      text: todoInput.value.trim(),
      completed: false,
    };
    todos.push(newTodo);
    todoInput.value = '';
    renderTodos();
  }
});

// Mark todo as complete or incomplete
todoList.addEventListener('change', (e) => {
  if (e.target.type === 'checkbox') {
    const id = parseInt(e.target.parentElement.dataset.id);
    const todo = todos.find(t => t.id === id);
    todo.completed = e.target.checked;
    renderTodos();
  }
});

// Delete todo
todoList.addEventListener('click', (e) => {
  if (e.target.closest('.delete-btn')) {
    const id = parseInt(e.target.closest('.todo-item').dataset.id);
    todos = todos.filter(todo => todo.id !== id);
    renderTodos();
  }
});

// Filter todos
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    renderTodos();
  });
});

// Clear completed todos
clearCompletedBtn.addEventListener('click', () => {
  todos = todos.filter(todo => !todo.completed);
  renderTodos();
});

// Drag-and-Drop functionality
let draggedItem = null;

todoList.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('todo-item')) {
    draggedItem = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
  }
});

todoList.addEventListener('dragend', (e) => {
  if (e.target.classList.contains('todo-item')) {
    e.target.classList.remove('dragging');
    draggedItem = null;
  }
});

todoList.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
});

todoList.addEventListener('dragenter', (e) => {
  e.preventDefault();
  if (e.target.classList.contains('todo-item') && e.target !== draggedItem) {
    e.target.classList.add('drag-over');
  }
});

todoList.addEventListener('dragleave', (e) => {
  if (e.target.classList.contains('todo-item')) {
    e.target.classList.remove('drag-over');
  }
});

todoList.addEventListener('drop', (e) => {
  e.preventDefault();
  const targetItem = e.target.closest('.todo-item');
  if (targetItem && targetItem !== draggedItem) {
    const draggedId = parseInt(draggedItem.dataset.id);
    const targetId = parseInt(targetItem.dataset.id);

    const draggedIndex = todos.findIndex(todo => todo.id === draggedId);
    const targetIndex = todos.findIndex(todo => todo.id === targetId);

    // Reorder the todos array
    const [draggedTodo] = todos.splice(draggedIndex, 1);
    todos.splice(targetIndex, 0, draggedTodo);

    renderTodos();
  }
  targetItem.classList.remove('drag-over');
});

// Initial render
renderTodos();