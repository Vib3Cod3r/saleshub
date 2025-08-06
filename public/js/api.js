// API Configuration and Utilities
class APIClient {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            
            // Handle unauthorized requests
            if (error.message.includes('401') || error.message.includes('Invalid or expired token')) {
                this.setToken(null);
                window.location.reload();
            }
            
            // Use error handler if available
            if (window.errorHandler) {
                window.errorHandler.handleAPIError(error);
            }
            
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const searchParams = new URLSearchParams(params);
        const queryString = searchParams.toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET',
        });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // PATCH request
    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }

    // Authentication endpoints
    async login(credentials) {
        const response = await this.post('/auth/login', credentials);
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async register(userData) {
        const response = await this.post('/auth/register', userData);
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async logout() {
        try {
            await this.post('/auth/logout');
        } finally {
            this.setToken(null);
        }
    }

    async getCurrentUser() {
        return this.get('/auth/me');
    }

    async getUsers() {
        return this.get('/auth/users');
    }

    // Dashboard endpoints
    async getDashboardOverview(period = '30') {
        return this.get('/dashboard/overview', { period });
    }

    async getRevenueChart(period = '12') {
        return this.get('/dashboard/revenue-chart', { period });
    }

    async getPipelineMetrics() {
        return this.get('/dashboard/pipeline-metrics');
    }

    async getRecentSales(limit = 5) {
        return this.get('/dashboard/recent-sales', { limit });
    }

    async getTopPerformers(period = '30') {
        return this.get('/dashboard/top-performers', { period });
    }

    async getLeadSources() {
        return this.get('/dashboard/lead-sources');
    }

    async getUpcomingTasks(days = 7) {
        return this.get('/dashboard/upcoming-tasks', { days });
    }

    async getForecast(months = 3) {
        return this.get('/dashboard/forecast', { months });
    }

    // Contacts endpoints
    async getContacts(params = {}) {
        return this.get('/contacts', params);
    }

    async getContact(id) {
        return this.get(`/contacts/${id}`);
    }

    async createContact(contactData) {
        return this.post('/contacts', contactData);
    }

    async updateContact(id, contactData) {
        return this.put(`/contacts/${id}`, contactData);
    }

    async deleteContact(id) {
        return this.delete(`/contacts/${id}`);
    }

    async getContactStats() {
        return this.get('/contacts/stats/summary');
    }

    // Deals endpoints
    async getDeals(params = {}) {
        return this.get('/deals', params);
    }

    async getDeal(id) {
        return this.get(`/deals/${id}`);
    }

    async createDeal(dealData) {
        return this.post('/deals', dealData);
    }

    async updateDeal(id, dealData) {
        return this.put(`/deals/${id}`, dealData);
    }

    async updateDealStage(id, stage) {
        return this.patch(`/deals/${id}/stage`, { stage });
    }

    async deleteDeal(id) {
        return this.delete(`/deals/${id}`);
    }

    async getPipeline() {
        return this.get('/deals/pipeline');
    }

    async getDealStats() {
        return this.get('/deals/stats/summary');
    }

    // Tasks endpoints
    async getTasks(params = {}) {
        return this.get('/tasks', params);
    }

    async getTask(id) {
        return this.get(`/tasks/${id}`);
    }

    async createTask(taskData) {
        return this.post('/tasks', taskData);
    }

    async updateTask(id, taskData) {
        return this.put(`/tasks/${id}`, taskData);
    }

    async completeTask(id) {
        return this.patch(`/tasks/${id}/complete`);
    }

    async deleteTask(id) {
        return this.delete(`/tasks/${id}`);
    }

    async getCalendarTasks(startDate, endDate) {
        return this.get('/tasks/calendar', { startDate, endDate });
    }

    async getOverdueTasks() {
        return this.get('/tasks/overdue');
    }

    async getTaskStats() {
        return this.get('/tasks/stats/summary');
    }

    // Communications endpoints
    async getCommunications(params = {}) {
        return this.get('/communications', params);
    }

    async getCommunication(id) {
        return this.get(`/communications/${id}`);
    }

    async createCommunication(commData) {
        return this.post('/communications', commData);
    }

    async updateCommunication(id, commData) {
        return this.put(`/communications/${id}`, commData);
    }

    async completeCommunication(id, outcome) {
        return this.patch(`/communications/${id}/complete`, { outcome });
    }

    async deleteCommunication(id) {
        return this.delete(`/communications/${id}`);
    }

    async getContactTimeline(contactId) {
        return this.get(`/communications/contact/${contactId}/timeline`);
    }

    async getDealCommunications(dealId) {
        return this.get(`/communications/deal/${dealId}`);
    }

    async getCommunicationStats() {
        return this.get('/communications/stats/summary');
    }
}

// Create global API instance
window.api = new APIClient();