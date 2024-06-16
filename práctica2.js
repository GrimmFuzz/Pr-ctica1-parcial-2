document.addEventListener('DOMContentLoaded', loadTasks);
document.getElementById('taskForm').addEventListener('submit', addTask);
document.getElementById('searchTask').addEventListener('input', searchTasks);
document.getElementById('showAll').addEventListener('click', () => filterTasks('all'));
document.getElementById('showOverdue').addEventListener('click', () => filterTasks('overdue'));
document.getElementById('showCompleted').addEventListener('click', () => filterTasks('completed'));

let tasks = [];

function addTask(e) {
    e.preventDefault();

    const taskName = document.getElementById('taskName').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const taskOwner = document.getElementById('taskOwner').value;

    if (new Date(endDate) < new Date(startDate)) {
        alert('La fecha de fin no puede ser menor que la fecha de inicio');
        return;
    }

    const task = {
        id: Date.now(),
        name: taskName,
        startDate: startDate,
        endDate: endDate,
        owner: taskOwner,
        completed: false,
        deleted: false
    };

    tasks.push(task);
    saveTasks();
    appendTask(task);
    document.getElementById('taskForm').reset();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
    refreshTaskLists();
}

function appendTask(task) {
    const taskList = document.getElementById('taskList');
    const taskItem = document.createElement('li');
    taskItem.className = `list-group-item d-flex justify-content-between align-items-center ${getTaskStatusClass(task)}`;
    taskItem.setAttribute('data-id', task.id);

    taskItem.innerHTML = `
        <span>
            <strong>${task.name}</strong> (Responsable: ${task.owner})<br>
            Inicio: ${task.startDate}, Fin: ${task.endDate}
        </span>
        <span>
            ${task.completed ? `<button class="btn btn-warning btn-sm task-action-btn" onclick="unmarkTask(${task.id})">Desmarcar</button>` : `<button class="btn btn-success btn-sm task-action-btn" onclick="markTask(${task.id})">Marcar</button>`}
            <button class="btn btn-danger btn-sm task-action-btn" onclick="deleteTask(${task.id})">Eliminar</button>
        </span>
    `;

    taskList.appendChild(taskItem);
}

function getTaskStatusClass(task) {
    const today = new Date().toISOString().split('T')[0];
    if (task.completed) {
        return 'task-completed';
    } else if (task.endDate < today) {
        return 'task-overdue';
    } else {
        return 'task-pending';
    }
}

function markTask(id) {
    updateTaskStatus(id, true);
}

function unmarkTask(id) {
    updateTaskStatus(id, false);
}

function updateTaskStatus(id, status) {
    tasks = tasks.map(task => task.id === id ? { ...task, completed: status } : task);
    saveTasks();
    refreshTaskLists();
}

function deleteTask(id) {
    tasks = tasks.map(task => task.id === id ? { ...task, deleted: true } : task);
    saveTasks();
    refreshTaskLists();
}

function appendDeletedTask(task) {
    const deletedTaskList = document.getElementById('deletedTaskList');
    const taskItem = document.createElement('li');
    taskItem.className = `list-group-item d-flex justify-content-between align-items-center task-deleted`;
    taskItem.setAttribute('data-id', task.id);

    taskItem.innerHTML = `
        <span>
            <strong>${task.name}</strong> (Responsable: ${task.owner})<br>
            Inicio: ${task.startDate}, Fin: ${task.endDate}
        </span>
    `;

    deletedTaskList.appendChild(taskItem);
}

function refreshTaskLists() {
    document.getElementById('taskList').innerHTML = '';
    document.getElementById('deletedTaskList').innerHTML = '';
    tasks.forEach(task => {
        if (task.deleted) {
            appendDeletedTask(task);
        } else {
            appendTask(task);
        }
    });
}

function searchTasks() {
    const query = document.getElementById('searchTask').value.toLowerCase();
    const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(query) && !task.deleted);
    document.getElementById('taskList').innerHTML = '';
    filteredTasks.forEach(task => appendTask(task));
}

function filterTasks(filter) {
    let filteredTasks = tasks;
    if (filter === 'overdue') {
        const today = new Date().toISOString().split('T')[0];
        filteredTasks = tasks.filter(task => task.endDate < today && !task.completed && !task.deleted);
    } else if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed && !task.deleted);
    }
    document.getElementById('taskList').innerHTML = '';
    filteredTasks.forEach(task => appendTask(task));
}
