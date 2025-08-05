// Tasks Management
class Tasks {
    constructor() {
        this.tasks = [];
        this.isInitialized = false;
    }

    async initialize() {
        try {
            if (!this.isInitialized) {
                this.setupEventListeners();
                this.isInitialized = true;
            }

            await this.loadTasks();
        } catch (error) {
            console.error('Tasks initialization failed:', error);
            this.showError('Failed to load tasks');
        }
    }

    setupEventListeners() {
        const addBtn = document.getElementById('add-task-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }
    }

    async loadTasks() {
        try {
            const response = await api.getTasks();
            this.tasks = response.tasks;
            this.renderTasks();
        } catch (error) {
            console.error('Failed to load tasks:', error);
            throw error;
        }
    }

    renderTasks() {
        const container = document.getElementById('tasks-container');
        if (!container) return;

        if (this.tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks fa-3x text-muted"></i>
                    <h3>No tasks found</h3>
                    <p>Create your first task to start organizing your work.</p>
                    <button class="btn btn-primary" onclick="window.tasks.showAddModal()">
                        <i class="fas fa-plus"></i>
                        Add Task
                    </button>
                </div>
            `;
            return;
        }

        const tasksHtml = this.tasks.map(task => `
            <div class="task-card ${task.status.toLowerCase()}" data-task-id="${task.id}">
                <div class="task-header">
                    <h4>${task.title}</h4>
                    <span class="task-priority priority-${task.priority.toLowerCase()}">${Utils.formatStatus(task.priority)}</span>
                </div>
                <div class="task-content">
                    ${task.description ? `<p>${Utils.truncateText(task.description, 100)}</p>` : ''}
                    <div class="task-meta">
                        <span class="task-type">${Utils.formatStatus(task.type)}</span>
                        ${task.dueDate ? `<span class="task-due">Due: ${Utils.formatDate(task.dueDate)}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon" onclick="window.tasks.completeTask('${task.id}')" title="Complete">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-icon" onclick="window.tasks.editTask('${task.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon text-danger" onclick="window.tasks.deleteTask('${task.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = tasksHtml;
    }

    showAddModal() {
        Utils.createModal('Add New Task', 'Task creation form will be implemented here', {
            footer: '<button type="button" class="btn btn-secondary" onclick="this.closest(\'.modal\').remove()">Close</button>'
        });
    }

    async completeTask(taskId) {
        try {
            await api.completeTask(taskId);
            await this.loadTasks();
            this.showSuccess('Task completed!');
        } catch (error) {
            console.error('Failed to complete task:', error);
            this.showError('Failed to complete task');
        }
    }

    editTask(taskId) {
        console.log('Edit task:', taskId);
    }

    async deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await api.deleteTask(taskId);
                await this.loadTasks();
                this.showSuccess('Task deleted successfully!');
            } catch (error) {
                console.error('Failed to delete task:', error);
                this.showError('Failed to delete task');
            }
        }
    }

    showSuccess(message) {
        if (window.app) window.app.showSuccess(message);
    }

    showError(message) {
        if (window.app) window.app.showError(message);
    }
}

// Create global tasks instance
window.tasks = new Tasks();