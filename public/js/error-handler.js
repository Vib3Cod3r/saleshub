// Error Handler for Sales CRM Application
class ErrorHandler {
    constructor() {
        this.errorContainer = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.init();
    }

    init() {
        this.createErrorContainer();
        this.checkConnection();
    }

    // Create error display container
    createErrorContainer() {
        // Remove existing error container if any
        const existingContainer = document.getElementById('error-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Create new error container
        this.errorContainer = document.createElement('div');
        this.errorContainer.id = 'error-container';
        this.errorContainer.className = 'error-container';
        this.errorContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Inter', sans-serif;
        `;

        this.errorContainer.innerHTML = `
            <div class="error-modal" style="
                background: white;
                border-radius: 12px;
                padding: 32px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            ">
                <div class="error-icon" style="
                    font-size: 48px;
                    color: #dc3545;
                    margin-bottom: 16px;
                ">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 style="
                    color: #333;
                    margin-bottom: 16px;
                    font-size: 24px;
                    font-weight: 600;
                ">Connection Error</h2>
                <p id="error-message" style="
                    color: #666;
                    margin-bottom: 24px;
                    line-height: 1.5;
                    font-size: 16px;
                ">Unable to connect to the server. Please check your connection and try again.</p>
                <div class="error-actions" style="
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    flex-wrap: wrap;
                ">
                    <button id="retry-btn" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: background 0.2s;
                    " onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#007bff'">
                        <i class="fas fa-redo"></i> Retry Connection
                    </button>
                    <button id="check-status-btn" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: background 0.2s;
                    " onmouseover="this.style.background='#545b62'" onmouseout="this.style.background='#6c757d'">
                        <i class="fas fa-info-circle"></i> Check Status
                    </button>
                </div>
                <div id="status-info" style="
                    margin-top: 20px;
                    padding: 16px;
                    background: #f8f9fa;
                    border-radius: 6px;
                    font-size: 14px;
                    color: #666;
                    display: none;
                "></div>
            </div>
        `;

        document.body.appendChild(this.errorContainer);
        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        const retryBtn = document.getElementById('retry-btn');
        const checkStatusBtn = document.getElementById('check-status-btn');

        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.retryConnection();
            });
        }

        if (checkStatusBtn) {
            checkStatusBtn.addEventListener('click', () => {
                this.checkServerStatus();
            });
        }
    }

    // Check connection to server
    async checkConnection() {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            // Server is responding - this is good
            if (response.status === 401) {
                // 401 means server is working but no auth token - this is expected for new users
                this.hideError();
                this.retryCount = 0;
                return true;
            } else if (response.ok) {
                this.hideError();
                this.retryCount = 0;
                return true;
            } else {
                throw new Error(`Server responded with status: ${response.status}`);
            }
        } catch (error) {
            console.error('Connection check failed:', error);
            this.showError('Unable to connect to the server. Please check if the server is running.');
            return false;
        }
    }

    // Show error message
    showError(message, type = 'connection') {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }

        if (this.errorContainer) {
            this.errorContainer.style.display = 'flex';
        }

        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }

        // Log error for debugging
        console.error('Sales CRM Error:', {
            type: type,
            message: message,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    }

    // Hide error message
    hideError() {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
        }
    }

    // Retry connection
    async retryConnection() {
        if (this.retryCount >= this.maxRetries) {
            this.showError('Maximum retry attempts reached. Please refresh the page or contact support.');
            return;
        }

        this.retryCount++;
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Retrying... (${this.retryCount}/${this.maxRetries})`;
            retryBtn.disabled = true;
        }

        try {
            const success = await this.checkConnection();
            if (success) {
                this.hideError();
                // Reload the application
                window.location.reload();
            } else {
                if (retryBtn) {
                    retryBtn.innerHTML = `<i class="fas fa-redo"></i> Retry Connection`;
                    retryBtn.disabled = false;
                }
            }
        } catch (error) {
            console.error('Retry failed:', error);
            if (retryBtn) {
                retryBtn.innerHTML = `<i class="fas fa-redo"></i> Retry Connection`;
                retryBtn.disabled = false;
            }
        }
    }

    // Check server status
    async checkServerStatus() {
        const statusInfo = document.getElementById('status-info');
        if (!statusInfo) return;

        statusInfo.style.display = 'block';
        statusInfo.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking server status...';

        try {
            // Check if server is responding
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 3000
            });

            const serverStatus = (response.ok || response.status === 401) ? 'Online' : 'Error';
            const statusColor = (response.ok || response.status === 401) ? '#28a745' : '#dc3545';

            statusInfo.innerHTML = `
                <div style="margin-bottom: 8px;">
                    <strong>Server Status:</strong> 
                    <span style="color: ${statusColor};">${serverStatus}</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Response Code:</strong> ${response.status}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>URL:</strong> ${window.location.origin}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Time:</strong> ${new Date().toLocaleString()}
                </div>
                <div style="font-size: 12px; color: #999; margin-top: 8px;">
                    If the server is offline, please ensure the Node.js server is running on port 3000
                </div>
            `;
        } catch (error) {
            statusInfo.innerHTML = `
                <div style="color: #dc3545; margin-bottom: 8px;">
                    <strong>Server Status:</strong> Offline
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Error:</strong> ${error.message}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>URL:</strong> ${window.location.origin}
                </div>
                <div style="font-size: 12px; color: #999; margin-top: 8px;">
                    Please check if the server is running: npm run dev
                </div>
            `;
        }
    }

    // Handle API errors
    handleAPIError(error, context = '') {
        console.error('API Error:', error);
        
        let userMessage = 'An error occurred while processing your request.';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            userMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            userMessage = 'Your session has expired. Please log in again.';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
            userMessage = 'You do not have permission to perform this action.';
        } else if (error.message.includes('404')) {
            userMessage = 'The requested resource was not found.';
        } else if (error.message.includes('500')) {
            userMessage = 'Server error occurred. Please try again later.';
        }

        this.showError(userMessage, 'api');
        
        // Show notification if app is loaded
        if (window.app && window.app.showError) {
            window.app.showError(userMessage);
        }
    }

    // Handle authentication errors
    handleAuthError(error) {
        console.error('Authentication Error:', error);
        
        let userMessage = 'Authentication failed. Please try logging in again.';
        
        if (error.message.includes('Invalid credentials')) {
            userMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('User not found')) {
            userMessage = 'No account found with this email address.';
        } else if (error.message.includes('Account locked')) {
            userMessage = 'Your account has been locked. Please contact support.';
        }

        this.showError(userMessage, 'auth');
    }

    // Handle database errors
    handleDatabaseError(error) {
        console.error('Database Error:', error);
        
        let userMessage = 'Database connection error. Please try again later.';
        
        if (error.message.includes('Connection refused')) {
            userMessage = 'Database connection failed. Please check if the database is running.';
        } else if (error.message.includes('Authentication failed')) {
            userMessage = 'Database authentication failed. Please check database credentials.';
        }

        this.showError(userMessage, 'database');
    }
}

// Initialize error handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.errorHandler = new ErrorHandler();
});

// Make error handler globally available
window.ErrorHandler = ErrorHandler; 