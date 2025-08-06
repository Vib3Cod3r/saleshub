// Main Application Controller
class SalesCRMApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    // Initialize the application
    init() {
        console.log('Initializing Sales CRM Application...');
        
        // Update loading message
        this.updateLoadingMessage('Checking server connection...');
        
        // Check server connection first
        this.checkServerConnection().then(() => {
            // Check authentication status
            this.checkAuthStatus();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize components
            this.initializeComponents();
            
            console.log('Sales CRM Application initialized successfully');
        }).catch((error) => {
            console.error('Server connection failed:', error);
            if (window.errorHandler) {
                window.errorHandler.showError('Unable to connect to the server. Please check if the server is running.');
            }
        });
    }

    // Check server connection
    async checkServerConnection() {
        try {
            this.updateLoadingMessage('Connecting to server...');
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            // Server is responding - this is good
            if (response.status === 401) {
                // 401 means server is working but no auth token - this is expected for new users
                this.updateLoadingMessage('Server connected successfully');
                return true;
            } else if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            this.updateLoadingMessage('Server connected successfully');
            return true;
        } catch (error) {
            console.error('Server connection check failed:', error);
            throw error;
        }
    }

    // Update loading message
    updateLoadingMessage(message) {
        const loadingMessage = document.getElementById('loading-message');
        const progressText = document.querySelector('.progress-text');
        
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
    }

    // Check authentication status
    async checkAuthStatus() {
        this.updateLoadingMessage('Checking authentication...');
        const token = localStorage.getItem('authToken');
        
        if (token) {
            try {
                // Verify token is valid
                const user = await api.getCurrentUser();
                this.currentUser = user;
                this.isAuthenticated = true;
                this.updateLoadingMessage('Loading dashboard...');
                this.showMainApp();
                this.updateUserInfo();
                this.loadDashboard();
            } catch (error) {
                console.error('Token validation failed:', error);
                this.handleAuthError(error);
                this.showLoginModal();
            }
        } else {
            this.updateLoadingMessage('Please sign in...');
            this.showLoginModal();
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form submission
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Modal navigation
        const showRegisterLink = document.getElementById('show-register');
        const showLoginLink = document.getElementById('show-login');
        
        if (showRegisterLink) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterModal();
            });
        }
        
        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }

        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Global search
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }

        // Add new button
        const addNewBtn = document.getElementById('add-new-btn');
        if (addNewBtn) {
            addNewBtn.addEventListener('click', () => {
                this.handleAddNew();
            });
        }
    }

    // Handle login
    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Validate form
        const errors = Auth.validateLoginForm({ email, password });
        if (errors.length > 0) {
            this.showError(errors.join(', '));
            return;
        }

        try {
            this.showLoading('Signing in...');
            
            const response = await api.login({ email, password });
            
            // Store user data
            Auth.setCurrentUser(response.user);
            this.currentUser = response.user;
            this.isAuthenticated = true;
            
            this.hideLoading();
            this.showSuccess('Login successful!');
            
            // Hide login modal and show main app
            this.hideLoginModal();
            this.showMainApp();
            this.updateUserInfo();
            this.loadDashboard();
            
        } catch (error) {
            this.hideLoading();
            const errorMessage = Auth.handleAuthError(error);
            this.showError(errorMessage);
        }
    }

    // Handle registration
    async handleRegister() {
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('regEmail').value,
            username: document.getElementById('username').value,
            password: document.getElementById('regPassword').value
        };

        // Validate form
        const errors = Auth.validateRegistrationForm(formData);
        if (errors.length > 0) {
            this.showError(errors.join(', '));
            return;
        }

        try {
            this.showLoading('Creating account...');
            
            const response = await api.register(formData);
            
            // Store user data
            Auth.setCurrentUser(response.user);
            this.currentUser = response.user;
            this.isAuthenticated = true;
            
            this.hideLoading();
            this.showSuccess('Account created successfully!');
            
            // Hide register modal and show main app
            this.hideRegisterModal();
            this.showMainApp();
            this.updateUserInfo();
            this.loadDashboard();
            
        } catch (error) {
            this.hideLoading();
            const errorMessage = Auth.handleAuthError(error);
            this.showError(errorMessage);
        }
    }

    // Handle logout
    async handleLogout() {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear authentication data
            Auth.clearAuth();
            this.currentUser = null;
            this.isAuthenticated = false;
            
            // Show login modal
            this.hideMainApp();
            this.showLoginModal();
            this.showSuccess('Logged out successfully');
        }
    }

    // Show login modal
    showLoginModal() {
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        const loadingScreen = document.getElementById('loading-screen');
        
        // Hide loading screen
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
        
        if (registerModal) registerModal.style.display = 'none';
        
        // Clear forms
        this.clearForms();
    }

    // Show register modal
    showRegisterModal() {
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        const loadingScreen = document.getElementById('loading-screen');
        
        // Hide loading screen
        if (loadingScreen) loadingScreen.style.display = 'none';
        
        if (loginModal) loginModal.style.display = 'none';
        if (registerModal) registerModal.style.display = 'flex';
        
        // Clear forms
        this.clearForms();
    }

    // Hide login modal
    hideLoginModal() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) loginModal.style.display = 'none';
    }

    // Hide register modal
    hideRegisterModal() {
        const registerModal = document.getElementById('register-modal');
        if (registerModal) registerModal.style.display = 'none';
    }

    // Show main app
    showMainApp() {
        const app = document.getElementById('app');
        const loadingScreen = document.getElementById('loading-screen');
        
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (app) app.style.display = 'flex';
    }

    // Hide main app
    hideMainApp() {
        const app = document.getElementById('app');
        if (app) app.style.display = 'none';
    }

    // Update user information in the UI
    updateUserInfo() {
        if (!this.currentUser) return;

        const userInitials = document.getElementById('user-initials');
        const userName = document.getElementById('user-name');
        const userRole = document.getElementById('user-role');

        if (userInitials) {
            userInitials.textContent = Utils.getInitials(this.currentUser.firstName, this.currentUser.lastName);
        }

        if (userName) {
            userName.textContent = Utils.formatName(this.currentUser.firstName, this.currentUser.lastName);
        }

        if (userRole) {
            userRole.textContent = Auth.formatUserRole(this.currentUser.role);
        }
    }

    // Navigate to a specific page
    navigateToPage(page) {
        console.log('navigateToPage called with:', page);
        
        // Update navigation active state
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === page) {
                item.classList.add('active');
            }
        });

        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        console.log('Target page element:', targetPage);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            
            // Update page title
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = this.getPageTitle(page);
            }

            // Load page-specific content
            console.log('Loading page content for:', page);
            this.loadPageContent(page);
        } else {
            console.error(`Target page '${page}-page' not found`);
        }
    }

    // Get page title
    getPageTitle(page) {
        const titles = {
            dashboard: 'Dashboard',
            deals: 'Deals',
            contacts: 'Contacts',
            tasks: 'Tasks',
            pipeline: 'Pipeline',
            communications: 'Communications',
            settings: 'Settings'
        };
        return titles[page] || 'Dashboard';
    }

    // Load page-specific content
    loadPageContent(page) {
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'contacts':
                this.loadContacts();
                break;
            case 'deals':
                this.loadDeals();
                break;
            case 'tasks':
                this.loadTasks();
                break;
            case 'pipeline':
                this.loadPipeline();
                break;
            case 'communications':
                this.loadCommunications();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // Load dashboard
    async loadDashboard() {
        try {
            // This will be handled by dashboard.js
            if (window.Dashboard) {
                window.Dashboard.loadDashboard();
            }
        } catch (error) {
            this.showError('Failed to load dashboard: ' + error.message);
        }
    }

    // Load contacts
    async loadContacts() {
        try {
            if (window.contacts) {
                await window.contacts.initialize();
            }
        } catch (error) {
            this.showError('Failed to load contacts: ' + error.message);
        }
    }

    // Load deals
    async loadDeals() {
        try {
            if (window.Deals) {
                window.Deals.loadDeals();
            }
        } catch (error) {
            this.showError('Failed to load deals: ' + error.message);
        }
    }

    // Load tasks
    async loadTasks() {
        try {
            if (window.Tasks) {
                window.Tasks.loadTasks();
            }
        } catch (error) {
            this.showError('Failed to load tasks: ' + error.message);
        }
    }

    // Load pipeline
    async loadPipeline() {
        try {
            if (window.Pipeline) {
                window.Pipeline.loadPipeline();
            }
        } catch (error) {
            this.showError('Failed to load pipeline: ' + error.message);
        }
    }

    // Load communications
    async loadCommunications() {
        try {
            if (window.Communications) {
                window.Communications.loadCommunications();
            }
        } catch (error) {
            this.showError('Failed to load communications: ' + error.message);
        }
    }

    // Load settings
    async loadSettings() {
        try {
            // Settings page implementation
            console.log('Loading settings...');
        } catch (error) {
            this.showError('Failed to load settings: ' + error.message);
        }
    }

    // Handle global search
    handleGlobalSearch(query) {
        if (query.length < 2) return;
        
        // Implement global search functionality
        console.log('Global search:', query);
    }

    // Handle add new button
    handleAddNew() {
        switch (this.currentPage) {
            case 'deals':
                this.showAddDealModal();
                break;
            case 'contacts':
                this.showAddContactModal();
                break;
            case 'tasks':
                this.showAddTaskModal();
                break;
            default:
                this.showAddDealModal();
        }
    }

    // Show add deal modal
    showAddDealModal() {
        if (window.Deals) {
            window.Deals.showAddDealModal();
        }
    }

    // Show add contact modal
    showAddContactModal() {
        if (window.contacts) {
            window.contacts.showCreateModal();
        }
    }

    // Show add task modal
    showAddTaskModal() {
        if (window.Tasks) {
            window.Tasks.showAddTaskModal();
        }
    }

    // Clear forms
    clearForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => form.reset());
    }

    // Show loading
    showLoading(message = 'Loading...') {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            const loaderText = loadingScreen.querySelector('p');
            if (loaderText) loaderText.textContent = message;
            loadingScreen.style.display = 'flex';
        }
    }

    // Hide loading
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    // Show success message
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Show error message
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Show warning message
    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        notificationContainer.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    // Get notification icon
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Handle authentication errors
    handleAuthError(error) {
        console.error('Authentication error:', error);
        Auth.clearAuth();
        this.currentUser = null;
        this.isAuthenticated = false;
        this.showError('Authentication failed. Please log in again.');
        this.showLoginModal();
    }

    // Initialize components
    initializeComponents() {
        // Initialize Auth system
        if (window.Auth) {
            window.Auth.init();
        }

        // Initialize contacts component
        if (window.contacts) {
            console.log('Initializing contacts component...');
            window.contacts.initialize();
        }

        // Initialize other components as needed
        console.log('Components initialized');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Sales CRM App...');
    window.app = new SalesCRMApp();
});

// Make app globally available
window.SalesCRMApp = SalesCRMApp;