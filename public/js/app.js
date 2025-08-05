// Main Application Controller
class CRMApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.isAuthenticated = false;
        
        this.init();
    }

    async init() {
        try {
            // Show loading screen
            this.showLoading();

            // Setup modal listeners immediately (needed for login/register)
            this.setupModalListeners();

            // Check if user is authenticated
            await this.checkAuthentication();

            if (this.isAuthenticated) {
                await this.initializeApp();
            } else {
                this.showLogin();
            }
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showError('Failed to initialize application');
            this.showLogin();
        } finally {
            this.hideLoading();
        }
    }

    async checkAuthentication() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            this.isAuthenticated = false;
            return;
        }

        try {
            this.currentUser = await api.getCurrentUser();
            this.isAuthenticated = true;
        } catch (error) {
            console.error('Authentication check failed:', error);
            this.isAuthenticated = false;
            localStorage.removeItem('authToken');
        }
    }

    async initializeApp() {
        // Hide login/register modals
        this.hideLogin();
        this.hideRegister();

        // Show main app
        document.getElementById('app').style.display = 'flex';

        // Setup navigation
        this.setupNavigation();

        // Setup global event listeners
        this.setupEventListeners();

        // Initialize current page
        await this.navigateToPage(this.currentPage);

        // Update user profile
        this.updateUserProfile();

        // Setup periodic data refresh
        this.setupDataRefresh();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'dashboard';
            this.navigateToPage(page, false);
        });
    }

    setupEventListeners() {
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Global search
        const searchInput = document.getElementById('global-search');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performGlobalSearch(e.target.value);
            }, 300);
        });

        // Add new buttons
        document.getElementById('add-new-btn').addEventListener('click', () => {
            this.showAddModal();
        });

        // Modal event listeners
        this.setupModalListeners();
    }

    setupModalListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(e);
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister(e);
        });

        // Show register modal
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegister();
        });

        // Show login modal
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });
    }

    async navigateToPage(page, updateHistory = true) {
        // Update active navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Hide all pages
        document.querySelectorAll('.page').forEach(pageEl => {
            pageEl.classList.remove('active');
        });

        // Show current page
        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
        }

        // Update page title
        this.updatePageTitle(page);

        // Update add button text
        this.updateAddButton(page);

        // Update browser history
        if (updateHistory) {
            history.pushState({ page }, '', `#${page}`);
        }

        this.currentPage = page;

        // Initialize page content
        await this.initializePage(page);
    }

    async initializePage(page) {
        switch (page) {
            case 'dashboard':
                if (window.dashboard) {
                    await window.dashboard.initialize();
                }
                break;
            case 'contacts':
                if (window.contacts) {
                    await window.contacts.initialize();
                }
                break;
            case 'deals':
                if (window.deals) {
                    await window.deals.initialize();
                }
                break;
            case 'tasks':
                if (window.tasks) {
                    await window.tasks.initialize();
                }
                break;
            case 'pipeline':
                if (window.pipeline) {
                    await window.pipeline.initialize();
                }
                break;
            case 'communications':
                if (window.communications) {
                    await window.communications.initialize();
                }
                break;
            case 'settings':
                // Initialize settings page
                break;
        }
    }

    updatePageTitle(page) {
        const titles = {
            dashboard: 'Dashboard',
            contacts: 'Contacts & Leads',
            deals: 'Deals',
            tasks: 'Tasks',
            pipeline: 'Sales Pipeline',
            communications: 'Communications',
            settings: 'Settings'
        };

        document.getElementById('page-title').textContent = titles[page] || 'Dashboard';
    }

    updateAddButton(page) {
        const button = document.getElementById('add-new-btn');
        const span = button.querySelector('span');
        
        const buttonTexts = {
            dashboard: 'Add New Deal',
            contacts: 'Add New Contact',
            deals: 'Add New Deal',
            tasks: 'Add New Task',
            pipeline: 'Add New Deal',
            communications: 'Log Communication',
            settings: 'Add New'
        };

        span.textContent = buttonTexts[page] || 'Add New';
    }

    showAddModal() {
        switch (this.currentPage) {
            case 'contacts':
                if (window.contacts) {
                    window.contacts.showAddModal();
                }
                break;
            case 'deals':
            case 'dashboard':
            case 'pipeline':
                if (window.deals) {
                    window.deals.showAddModal();
                }
                break;
            case 'tasks':
                if (window.tasks) {
                    window.tasks.showAddModal();
                }
                break;
            case 'communications':
                if (window.communications) {
                    window.communications.showAddModal();
                }
                break;
        }
    }

    async handleLogin(e) {
        const formData = new FormData(e.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            this.showFormLoading(e.target);
            const response = await api.login(credentials);
            this.currentUser = response.user;
            this.isAuthenticated = true;
            
            this.showSuccess('Login successful! Welcome back.');
            await this.initializeApp();
        } catch (error) {
            console.error('Login failed:', error);
            this.showError(error.message || 'Login failed. Please try again.');
        } finally {
            this.hideFormLoading(e.target);
        }
    }

    async handleRegister(e) {
        const formData = new FormData(e.target);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            this.showFormLoading(e.target);
            const response = await api.register(userData);
            this.currentUser = response.user;
            this.isAuthenticated = true;
            
            this.showSuccess('Account created successfully! Welcome to Sales CRM.');
            await this.initializeApp();
        } catch (error) {
            console.error('Registration failed:', error);
            this.showError(error.message || 'Registration failed. Please try again.');
        } finally {
            this.hideFormLoading(e.target);
        }
    }

    async logout() {
        try {
            await api.logout();
            this.showSuccess('Logged out successfully.');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.currentUser = null;
            this.isAuthenticated = false;
            document.getElementById('app').style.display = 'none';
            this.showLogin();
        }
    }

    updateUserProfile() {
        if (!this.currentUser) return;

        const initials = `${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}`.toUpperCase();
        const fullName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        const role = this.formatRole(this.currentUser.role);

        document.getElementById('user-initials').textContent = initials;
        document.getElementById('user-name').textContent = fullName;
        document.getElementById('user-role').textContent = role;
    }

    formatRole(role) {
        const roleMap = {
            'ADMIN': 'Administrator',
            'SALES_MANAGER': 'Sales Manager',
            'SALES_REP': 'Sales Representative'
        };
        return roleMap[role] || role;
    }

    async performGlobalSearch(query) {
        if (!query.trim()) return;

        try {
            // Implement global search across all entities
            console.log('Performing global search for:', query);
            // This would search across contacts, deals, tasks, etc.
        } catch (error) {
            console.error('Global search failed:', error);
        }
    }

    setupDataRefresh() {
        // Refresh data every 5 minutes
        setInterval(() => {
            if (this.isAuthenticated && document.visibilityState === 'visible') {
                this.refreshCurrentPageData();
            }
        }, 5 * 60 * 1000);

        // Refresh when tab becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isAuthenticated) {
                this.refreshCurrentPageData();
            }
        });
    }

    async refreshCurrentPageData() {
        try {
            await this.initializePage(this.currentPage);
        } catch (error) {
            console.error('Data refresh failed:', error);
        }
    }

    // UI Helper Methods
    showLoading() {
        document.getElementById('loading-screen').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-screen').style.display = 'none';
    }

    showLogin() {
        document.getElementById('login-modal').style.display = 'flex';
        document.getElementById('register-modal').style.display = 'none';
    }

    hideLogin() {
        document.getElementById('login-modal').style.display = 'none';
    }

    showRegister() {
        document.getElementById('register-modal').style.display = 'flex';
        document.getElementById('login-modal').style.display = 'none';
    }

    hideRegister() {
        document.getElementById('register-modal').style.display = 'none';
    }

    showFormLoading(form) {
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }

    hideFormLoading(form) {
        const button = form.querySelector('button[type="submit"]');
        button.disabled = false;
        const originalTexts = {
            'login-form': 'Sign In',
            'register-form': 'Create Account'
        };
        button.textContent = originalTexts[form.id] || 'Submit';
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Allow manual dismissal
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CRMApp();
});