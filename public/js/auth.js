// Authentication utilities and helpers
const Auth = {
    // Check if user is currently authenticated
    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        return !!token;
    },

    // Get current user info from localStorage or API
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Save user info to localStorage
    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    // Clear authentication data
    clearAuth() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    },

    // Check if current user has specific role
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },

    // Check if current user has permission for action
    hasPermission(action, resource, resourceOwnerId = null) {
        const user = this.getCurrentUser();
        if (!user) return false;

        // Admin has all permissions
        if (user.role === 'ADMIN') return true;

        // Sales Manager permissions
        if (user.role === 'SALES_MANAGER') {
            switch (action) {
                case 'read':
                    return true; // Can read all resources
                case 'create':
                    return ['contacts', 'deals', 'tasks', 'communications'].includes(resource);
                case 'update':
                    return ['contacts', 'deals', 'tasks', 'communications'].includes(resource);
                case 'delete':
                    return ['contacts', 'deals', 'tasks', 'communications'].includes(resource);
                default:
                    return false;
            }
        }

        // Sales Rep permissions
        if (user.role === 'SALES_REP') {
            switch (action) {
                case 'read':
                    // Can only read own resources or unassigned
                    return !resourceOwnerId || resourceOwnerId === user.id;
                case 'create':
                    return ['contacts', 'deals', 'tasks', 'communications'].includes(resource);
                case 'update':
                    // Can only update own resources
                    return ['contacts', 'deals', 'tasks', 'communications'].includes(resource) &&
                           (!resourceOwnerId || resourceOwnerId === user.id);
                case 'delete':
                    // Can only delete own resources
                    return ['contacts', 'deals', 'tasks', 'communications'].includes(resource) &&
                           (!resourceOwnerId || resourceOwnerId === user.id);
                default:
                    return false;
            }
        }

        return false;
    },

    // Get user avatar/initials
    getUserAvatar(user) {
        if (user.avatar) {
            return `<img src="${user.avatar}" alt="${user.firstName} ${user.lastName}" class="user-avatar-img">`;
        } else {
            const initials = Utils.getInitials(user.firstName, user.lastName);
            return `<div class="user-avatar">${initials}</div>`;
        }
    },

    // Format user display name
    getUserDisplayName(user) {
        return Utils.formatName(user.firstName, user.lastName);
    },

    // Format user role for display
    formatUserRole(role) {
        const roleMap = {
            'ADMIN': 'Administrator',
            'SALES_MANAGER': 'Sales Manager',
            'SALES_REP': 'Sales Representative'
        };
        return roleMap[role] || role;
    },

    // Login form validation
    validateLoginForm(formData) {
        const errors = [];

        if (!formData.email) {
            errors.push('Email is required');
        } else if (!Utils.validateEmail(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!formData.password) {
            errors.push('Password is required');
        } else if (formData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        return errors;
    },

    // Registration form validation
    validateRegistrationForm(formData) {
        const errors = [];

        if (!formData.firstName) {
            errors.push('First name is required');
        }

        if (!formData.lastName) {
            errors.push('Last name is required');
        }

        if (!formData.email) {
            errors.push('Email is required');
        } else if (!Utils.validateEmail(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!formData.username) {
            errors.push('Username is required');
        } else if (formData.username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }

        if (!formData.password) {
            errors.push('Password is required');
        } else if (formData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        return errors;
    },

    // Handle authentication errors
    handleAuthError(error) {
        console.error('Authentication error:', error);
        
        if (error.message.includes('Invalid credentials')) {
            return 'Invalid email or password. Please try again.';
        } else if (error.message.includes('User already exists')) {
            return 'An account with this email or username already exists.';
        } else if (error.message.includes('Network')) {
            return 'Network error. Please check your connection and try again.';
        } else {
            return error.message || 'An unexpected error occurred. Please try again.';
        }
    },

    // Setup auto-logout on token expiration
    setupAutoLogout() {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            const timeUntilExpiration = expirationTime - currentTime;

            if (timeUntilExpiration > 0) {
                setTimeout(() => {
                    this.handleTokenExpiration();
                }, timeUntilExpiration);
            } else {
                this.handleTokenExpiration();
            }
        } catch (error) {
            console.error('Error parsing token:', error);
            this.handleTokenExpiration();
        }
    },

    // Handle token expiration
    handleTokenExpiration() {
        this.clearAuth();
        if (window.app) {
            window.app.showWarning('Your session has expired. Please log in again.');
            window.app.logout();
        } else {
            window.location.reload();
        }
    },

    // Check for authentication on page visibility change
    setupVisibilityCheck() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isAuthenticated()) {
                // Verify token is still valid
                api.getCurrentUser().catch(error => {
                    if (error.message.includes('401') || error.message.includes('Invalid or expired token')) {
                        this.handleTokenExpiration();
                    }
                });
            }
        });
    },

    // Initialize authentication system
    init() {
        this.setupAutoLogout();
        this.setupVisibilityCheck();
    }
};

// Initialize auth system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Make Auth globally available
window.Auth = Auth;