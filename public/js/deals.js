// Deals Management
class Deals {
    constructor() {
        this.deals = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPages = 0;
        this.isInitialized = false;
        this.contacts = [];
        this.filters = {
            search: '',
            stage: '',
            assignedTo: '',
            minValue: '',
            maxValue: ''
        };
    }

    async initialize() {
        try {
            if (!this.isInitialized) {
                this.setupEventListeners();
                this.isInitialized = true;
            }

            await this.loadDeals();
            await this.loadContacts(); // For deal creation
        } catch (error) {
            console.error('Deals initialization failed:', error);
            this.showError('Failed to load deals');
        }
    }

    setupEventListeners() {
        const addBtn = document.getElementById('add-deal-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }
    }

    async loadDeals() {
        try {
            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                ...this.filters
            };

            const response = await api.getDeals(params);
            this.deals = response.deals;
            this.totalPages = response.pagination.totalPages;

            this.renderDealsTable();
        } catch (error) {
            console.error('Failed to load deals:', error);
            throw error;
        }
    }

    async loadContacts() {
        try {
            const response = await api.getContacts({ limit: 100 });
            this.contacts = response.contacts;
        } catch (error) {
            console.error('Failed to load contacts for deals:', error);
        }
    }

    renderDealsTable() {
        const container = document.getElementById('deals-table-container');
        if (!container) return;

        if (this.deals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-handshake fa-3x text-muted"></i>
                    <h3>No deals found</h3>
                    <p>Create your first deal to start tracking sales opportunities.</p>
                    <button class="btn btn-primary" onclick="window.deals.showAddModal()">
                        <i class="fas fa-plus"></i>
                        Add Deal
                    </button>
                </div>
            `;
            return;
        }

        const table = Utils.createTable(this.deals, [
            {
                key: 'title',
                label: 'Deal Title',
                render: (title, deal) => `
                    <div class="deal-title-cell">
                        <div class="deal-title">${title}</div>
                        <div class="deal-contact">${Utils.formatName(deal.contact.firstName, deal.contact.lastName)}</div>
                    </div>
                `
            },
            {
                key: 'company',
                label: 'Company',
                render: (value, deal) => deal.contact.company || 'No Company'
            },
            {
                key: 'value',
                label: 'Value',
                render: (value) => value ? Utils.formatCurrency(value) : 'No Value'
            },
            {
                key: 'stage',
                label: 'Stage',
                render: (stage) => {
                    const badgeClass = Utils.getStatusBadgeClass(stage);
                    return `<span class="status-badge ${badgeClass}">${Utils.formatStatus(stage)}</span>`;
                }
            },
            {
                key: 'probability',
                label: 'Probability',
                render: (probability) => `${probability || 0}%`
            },
            {
                key: 'expectedCloseDate',
                label: 'Expected Close',
                render: (date) => date ? Utils.formatDate(date) : 'Not Set'
            },
            {
                key: 'assignedTo',
                label: 'Assigned To',
                render: (assignedTo) => {
                    return assignedTo ? Utils.formatName(assignedTo.firstName, assignedTo.lastName) : 'Unassigned';
                }
            },
            {
                key: 'actions',
                label: 'Actions',
                render: (value, deal) => `
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="window.deals.viewDeal('${deal.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="window.deals.editDeal('${deal.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon text-danger" onclick="window.deals.deleteDeal('${deal.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `
            }
        ], {
            onRowClick: (deal) => this.viewDeal(deal.id)
        });

        container.innerHTML = '';
        container.appendChild(table);
    }

    showAddModal() {
        const contactOptions = this.contacts.map(contact => {
            const fullName = Utils.formatName(contact.firstName, contact.lastName);
            const company = contact.company ? ` (${contact.company})` : '';
            return `<option value="${contact.id}">${fullName}${company}</option>`;
        }).join('');

        const modalContent = `
            <form id="add-deal-form">
                <div class="form-group">
                    <label for="title">Deal Title *</label>
                    <input type="text" id="title" name="title" required>
                </div>
                
                <div class="form-group">
                    <label for="contactId">Contact *</label>
                    <select id="contactId" name="contactId" required>
                        <option value="">Select Contact</option>
                        ${contactOptions}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="3"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="value">Deal Value</label>
                        <input type="number" id="value" name="value" min="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label for="probability">Probability (%)</label>
                        <input type="number" id="probability" name="probability" min="0" max="100">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="stage">Stage</label>
                        <select id="stage" name="stage">
                            <option value="NEW_LEAD">New Lead</option>
                            <option value="QUALIFIED">Qualified</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="MEETING_DEMO_SET">Meeting/Demo Set</option>
                            <option value="PROPOSAL_NEGOTIATION">Proposal/Negotiation</option>
                            <option value="DECISION_MAKER_BOUGHT_IN">Decision Maker Bought In</option>
                            <option value="CONTRACT_SENT">Contract Sent</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="expectedCloseDate">Expected Close Date</label>
                        <input type="date" id="expectedCloseDate" name="expectedCloseDate">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="notes">Notes</label>
                    <textarea id="notes" name="notes" rows="3"></textarea>
                </div>
            </form>
        `;

        const modal = Utils.createModal('Add New Deal', modalContent, {
            footer: `
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button type="submit" form="add-deal-form" class="btn btn-primary">Add Deal</button>
            `
        });

        const form = modal.querySelector('#add-deal-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddDeal(form, modal);
        });
    }

    async handleAddDeal(form, modal) {
        try {
            const formData = Utils.serializeForm(form);
            
            const submitBtn = modal.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

            await api.createDeal(formData);
            
            modal.remove();
            await this.loadDeals();
            this.showSuccess('Deal added successfully!');
        } catch (error) {
            console.error('Failed to add deal:', error);
            this.showError(error.message || 'Failed to add deal');
        }
    }

    async viewDeal(dealId) {
        try {
            const deal = await api.getDeal(dealId);
            this.showDealDetails(deal);
        } catch (error) {
            console.error('Failed to load deal details:', error);
            this.showError('Failed to load deal details');
        }
    }

    showDealDetails(deal) {
        const contactName = Utils.formatName(deal.contact.firstName, deal.contact.lastName);
        const value = deal.value ? Utils.formatCurrency(deal.value) : 'No Value';
        
        const modalContent = `
            <div class="deal-details">
                <div class="deal-header">
                    <div class="deal-info">
                        <h3>${deal.title}</h3>
                        <p>Contact: ${contactName} ${deal.contact.company ? `(${deal.contact.company})` : ''}</p>
                        <div class="deal-meta">
                            <span class="status-badge ${Utils.getStatusBadgeClass(deal.stage)}">${Utils.formatStatus(deal.stage)}</span>
                            <span class="deal-value">${value}</span>
                            <span class="deal-probability">${deal.probability || 0}% probability</span>
                        </div>
                    </div>
                </div>
                
                <div class="deal-details-grid">
                    <div class="detail-section">
                        <h4>Deal Information</h4>
                        <div class="detail-item">
                            <label>Expected Close Date:</label>
                            <span>${deal.expectedCloseDate ? Utils.formatDate(deal.expectedCloseDate) : 'Not set'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Assigned To:</label>
                            <span>${deal.assignedTo ? Utils.formatName(deal.assignedTo.firstName, deal.assignedTo.lastName) : 'Unassigned'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Created:</label>
                            <span>${Utils.formatDateTime(deal.createdAt)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Last Updated:</label>
                            <span>${Utils.formatDateTime(deal.updatedAt)}</span>
                        </div>
                    </div>
                </div>
                
                ${deal.description ? `
                    <div class="detail-section">
                        <h4>Description</h4>
                        <p>${deal.description}</p>
                    </div>
                ` : ''}
                
                ${deal.notes ? `
                    <div class="detail-section">
                        <h4>Notes</h4>
                        <p>${deal.notes}</p>
                    </div>
                ` : ''}
                
                <div class="detail-section">
                    <h4>Recent Activities</h4>
                    <div class="activities-list">
                        ${deal.communications && deal.communications.length > 0 ? 
                            deal.communications.map(comm => `
                                <div class="activity-item">
                                    <div class="activity-icon">
                                        <i class="fas ${this.getCommunicationIcon(comm.type)}"></i>
                                    </div>
                                    <div class="activity-content">
                                        <div class="activity-title">${comm.subject || Utils.formatStatus(comm.type)}</div>
                                        <div class="activity-meta">${Utils.formatDateTime(comm.createdAt)} by ${Utils.formatName(comm.user.firstName, comm.user.lastName)}</div>
                                    </div>
                                </div>
                            `).join('') :
                            '<p class="text-muted">No recent activities</p>'
                        }
                    </div>
                </div>
            </div>
        `;

        Utils.createModal(`Deal Details - ${deal.title}`, modalContent, {
            footer: `
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button type="button" class="btn btn-primary" onclick="window.deals.editDeal('${deal.id}')">Edit Deal</button>
            `
        });
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

    async editDeal(dealId) {
        console.log('Edit deal:', dealId);
        // Implementation for edit deal modal
    }

    async deleteDeal(dealId) {
        if (confirm('Are you sure you want to delete this deal? This action cannot be undone.')) {
            try {
                await api.deleteDeal(dealId);
                await this.loadDeals();
                this.showSuccess('Deal deleted successfully!');
            } catch (error) {
                console.error('Failed to delete deal:', error);
                this.showError('Failed to delete deal');
            }
        }
    }

    showDealDetails(dealId) {
        // Navigate to detailed view or open modal
        this.viewDeal(dealId);
    }

    showSuccess(message) {
        if (window.app) window.app.showSuccess(message);
    }

    showError(message) {
        if (window.app) window.app.showError(message);
    }
}

// Create global deals instance
window.deals = new Deals();