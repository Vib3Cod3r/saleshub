// Communications Management
class Communications {
    constructor() {
        this.communications = [];
        this.isInitialized = false;
        this.currentPage = 1;
        this.pageSize = 10;
    }

    async initialize() {
        try {
            if (!this.isInitialized) {
                this.setupEventListeners();
                this.isInitialized = true;
            }

            await this.loadCommunications();
        } catch (error) {
            console.error('Communications initialization failed:', error);
            this.showError('Failed to load communications');
        }
    }

    setupEventListeners() {
        const addBtn = document.getElementById('add-communication-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }
    }

    async loadCommunications() {
        try {
            const params = {
                page: this.currentPage,
                limit: this.pageSize
            };

            const response = await api.getCommunications(params);
            this.communications = response.communications;
            this.renderCommunications();
        } catch (error) {
            console.error('Failed to load communications:', error);
            throw error;
        }
    }

    renderCommunications() {
        const container = document.getElementById('communications-container');
        if (!container) return;

        if (this.communications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments fa-3x text-muted"></i>
                    <h3>No communications found</h3>
                    <p>Start logging your communications to track customer interactions.</p>
                    <button class="btn btn-primary" onclick="window.communications.showAddModal()">
                        <i class="fas fa-plus"></i>
                        Log Communication
                    </button>
                </div>
            `;
            return;
        }

        const communicationsHtml = this.communications.map(comm => `
            <div class="communication-item" data-communication-id="${comm.id}">
                <div class="communication-icon">
                    <i class="fas ${this.getCommunicationIcon(comm.type)}"></i>
                </div>
                <div class="communication-content">
                    <div class="communication-header">
                        <h4>${comm.subject || Utils.formatStatus(comm.type)}</h4>
                        <span class="communication-type">${Utils.formatStatus(comm.type)}</span>
                    </div>
                    <div class="communication-details">
                        ${comm.contact ? `
                            <span class="communication-contact">
                                ${Utils.formatName(comm.contact.firstName, comm.contact.lastName)}
                                ${comm.contact.company ? `(${comm.contact.company})` : ''}
                            </span>
                        ` : ''}
                        <span class="communication-date">${Utils.formatDateTime(comm.createdAt)}</span>
                        <span class="communication-user">by ${Utils.formatName(comm.user.firstName, comm.user.lastName)}</span>
                    </div>
                    ${comm.content ? `<p class="communication-preview">${Utils.truncateText(comm.content, 150)}</p>` : ''}
                    ${comm.outcome ? `<div class="communication-outcome"><strong>Outcome:</strong> ${comm.outcome}</div>` : ''}
                </div>
                <div class="communication-actions">
                    <button class="btn-icon" onclick="window.communications.viewCommunication('${comm.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="window.communications.editCommunication('${comm.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon text-danger" onclick="window.communications.deleteCommunication('${comm.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = communicationsHtml;
    }

    getCommunicationIcon(type) {
        const iconMap = {
            'EMAIL': 'fa-envelope',
            'PHONE_CALL': 'fa-phone',
            'MEETING': 'fa-calendar',
            'TEXT_MESSAGE': 'fa-sms',
            'VIDEO_CALL': 'fa-video',
            'NOTE': 'fa-sticky-note'
        };
        return iconMap[type] || 'fa-comment';
    }

    showAddModal() {
        const modalContent = `
            <form id="add-communication-form">
                <div class="form-group">
                    <label for="type">Communication Type *</label>
                    <select id="type" name="type" required>
                        <option value="EMAIL">Email</option>
                        <option value="PHONE_CALL">Phone Call</option>
                        <option value="MEETING">Meeting</option>
                        <option value="VIDEO_CALL">Video Call</option>
                        <option value="TEXT_MESSAGE">Text Message</option>
                        <option value="NOTE">Note</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="subject">Subject</label>
                    <input type="text" id="subject" name="subject">
                </div>
                
                <div class="form-group">
                    <label for="content">Content</label>
                    <textarea id="content" name="content" rows="4"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="direction">Direction</label>
                        <select id="direction" name="direction">
                            <option value="OUTBOUND">Outbound</option>
                            <option value="INBOUND">Inbound</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="duration">Duration (minutes)</label>
                        <input type="number" id="duration" name="duration" min="1">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="outcome">Outcome</label>
                    <textarea id="outcome" name="outcome" rows="2"></textarea>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="scheduled" name="scheduled">
                        Schedule for later
                    </label>
                </div>
                
                <div class="form-group" id="scheduled-date-group" style="display: none;">
                    <label for="scheduledFor">Scheduled Date & Time</label>
                    <input type="datetime-local" id="scheduledFor" name="scheduledFor">
                </div>
            </form>
        `;

        const modal = Utils.createModal('Log Communication', modalContent, {
            footer: `
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button type="submit" form="add-communication-form" class="btn btn-primary">Log Communication</button>
            `
        });

        // Show/hide scheduled date field
        const scheduledCheckbox = modal.querySelector('#scheduled');
        const scheduledGroup = modal.querySelector('#scheduled-date-group');
        
        scheduledCheckbox.addEventListener('change', () => {
            scheduledGroup.style.display = scheduledCheckbox.checked ? 'block' : 'none';
        });

        const form = modal.querySelector('#add-communication-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddCommunication(form, modal);
        });
    }

    async handleAddCommunication(form, modal) {
        try {
            const formData = Utils.serializeForm(form);
            
            // Convert checkbox to boolean
            formData.scheduled = !!formData.scheduled;
            
            const submitBtn = modal.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging...';

            await api.createCommunication(formData);
            
            modal.remove();
            await this.loadCommunications();
            this.showSuccess('Communication logged successfully!');
        } catch (error) {
            console.error('Failed to log communication:', error);
            this.showError(error.message || 'Failed to log communication');
        }
    }

    async viewCommunication(commId) {
        try {
            const comm = await api.getCommunication(commId);
            this.showCommunicationDetails(comm);
        } catch (error) {
            console.error('Failed to load communication details:', error);
            this.showError('Failed to load communication details');
        }
    }

    showCommunicationDetails(comm) {
        const modalContent = `
            <div class="communication-details">
                <div class="communication-header">
                    <div class="communication-icon-large">
                        <i class="fas ${this.getCommunicationIcon(comm.type)}"></i>
                    </div>
                    <div class="communication-info">
                        <h3>${comm.subject || Utils.formatStatus(comm.type)}</h3>
                        <p>${Utils.formatStatus(comm.type)} - ${Utils.formatStatus(comm.direction)}</p>
                        <div class="communication-meta">
                            <span>${Utils.formatDateTime(comm.createdAt)}</span>
                            <span>by ${Utils.formatName(comm.user.firstName, comm.user.lastName)}</span>
                        </div>
                    </div>
                </div>
                
                ${comm.contact ? `
                    <div class="detail-section">
                        <h4>Contact</h4>
                        <p>${Utils.formatName(comm.contact.firstName, comm.contact.lastName)}
                        ${comm.contact.company ? ` (${comm.contact.company})` : ''}</p>
                    </div>
                ` : ''}
                
                ${comm.content ? `
                    <div class="detail-section">
                        <h4>Content</h4>
                        <p>${comm.content}</p>
                    </div>
                ` : ''}
                
                ${comm.outcome ? `
                    <div class="detail-section">
                        <h4>Outcome</h4>
                        <p>${comm.outcome}</p>
                    </div>
                ` : ''}
                
                ${comm.duration ? `
                    <div class="detail-section">
                        <h4>Duration</h4>
                        <p>${comm.duration} minutes</p>
                    </div>
                ` : ''}
                
                ${comm.scheduled && comm.scheduledFor ? `
                    <div class="detail-section">
                        <h4>Scheduled For</h4>
                        <p>${Utils.formatDateTime(comm.scheduledFor)}</p>
                    </div>
                ` : ''}
            </div>
        `;

        Utils.createModal('Communication Details', modalContent, {
            footer: `
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button type="button" class="btn btn-primary" onclick="window.communications.editCommunication('${comm.id}')">Edit</button>
            `
        });
    }

    editCommunication(commId) {
        console.log('Edit communication:', commId);
        // Implementation for edit communication modal
    }

    async deleteCommunication(commId) {
        if (confirm('Are you sure you want to delete this communication?')) {
            try {
                await api.deleteCommunication(commId);
                await this.loadCommunications();
                this.showSuccess('Communication deleted successfully!');
            } catch (error) {
                console.error('Failed to delete communication:', error);
                this.showError('Failed to delete communication');
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

// Create global communications instance
window.communications = new Communications();