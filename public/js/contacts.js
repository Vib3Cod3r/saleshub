// Contacts Management
class Contacts {
    constructor() {
        this.contacts = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPages = 0;
        this.isInitialized = false;
        this.filters = {
            search: '',
            leadStatus: '',
            leadSource: '',
            assignedTo: ''
        };
    }

    async initialize() {
        try {
            if (!this.isInitialized) {
                this.setupEventListeners();
                this.isInitialized = true;
            }

            await this.loadContacts();
        } catch (error) {
            console.error('Contacts initialization failed:', error);
            this.showError('Failed to load contacts');
        }
    }

    setupEventListeners() {
        // Add contact button
        const addBtn = document.getElementById('add-contact-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }
    }

    async loadContacts() {
        try {
            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                ...this.filters
            };

            const response = await api.getContacts(params);
            this.contacts = response.contacts;
            this.totalPages = response.pagination.totalPages;

            this.renderContactsTable();
            this.renderPagination();
        } catch (error) {
            console.error('Failed to load contacts:', error);
            throw error;
        }
    }

    renderContactsTable() {
        const container = document.getElementById('contacts-table-container');
        if (!container) return;

        if (this.contacts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users fa-3x text-muted"></i>
                    <h3>No contacts found</h3>
                    <p>Start by adding your first contact to begin managing your leads.</p>
                    <button class="btn btn-primary" onclick="window.contacts.showAddModal()">
                        <i class="fas fa-plus"></i>
                        Add Contact
                    </button>
                </div>
            `;
            return;
        }

        const table = Utils.createTable(this.contacts, [
            {
                key: 'name',
                label: 'Name',
                render: (value, contact) => {
                    const fullName = Utils.formatName(contact.firstName, contact.lastName);
                    const initials = Utils.getInitials(contact.firstName, contact.lastName);
                    return `
                        <div class="contact-cell">
                            <div class="contact-avatar">${initials}</div>
                            <div class="contact-info">
                                <div class="contact-name">${fullName}</div>
                                <div class="contact-email">${contact.email || ''}</div>
                            </div>
                        </div>
                    `;
                }
            },
            {
                key: 'company',
                label: 'Company',
                render: (value, contact) => contact.company || 'No Company'
            },
            {
                key: 'leadStatus',
                label: 'Status',
                render: (status) => {
                    const badgeClass = Utils.getStatusBadgeClass(status);
                    return `<span class="status-badge ${badgeClass}">${Utils.formatStatus(status)}</span>`;
                }
            },
            {
                key: 'leadSource',
                label: 'Source',
                render: (source) => source ? Utils.formatStatus(source) : 'Unknown'
            },
            {
                key: 'assignedTo',
                label: 'Assigned To',
                render: (assignedTo) => {
                    return assignedTo ? Utils.formatName(assignedTo.firstName, assignedTo.lastName) : 'Unassigned';
                }
            },
            {
                key: 'lastContactDate',
                label: 'Last Contact',
                render: (date) => date ? Utils.formatRelativeTime(date) : 'Never'
            },
            {
                key: 'actions',
                label: 'Actions',
                render: (value, contact) => `
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="window.contacts.viewContact('${contact.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="window.contacts.editContact('${contact.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon text-danger" onclick="window.contacts.deleteContact('${contact.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `
            }
        ], {
            onRowClick: (contact) => this.viewContact(contact.id)
        });

        container.innerHTML = '';
        container.appendChild(table);
    }

    renderPagination() {
        // Implementation for pagination
        console.log(`Page ${this.currentPage} of ${this.totalPages}`);
    }

    showAddModal() {
        const modalContent = `
            <form id="add-contact-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstName">First Name *</label>
                        <input type="text" id="firstName" name="firstName" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">Last Name *</label>
                        <input type="text" id="lastName" name="lastName" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email">
                </div>
                
                <div class="form-group">
                    <label for="phone">Phone</label>
                    <input type="tel" id="phone" name="phone">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="company">Company</label>
                        <input type="text" id="company" name="company">
                    </div>
                    <div class="form-group">
                        <label for="jobTitle">Job Title</label>
                        <input type="text" id="jobTitle" name="jobTitle">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="leadSource">Lead Source</label>
                        <select id="leadSource" name="leadSource">
                            <option value="">Select Source</option>
                            <option value="WEBSITE">Website</option>
                            <option value="EMAIL_CAMPAIGN">Email Campaign</option>
                            <option value="SOCIAL_MEDIA">Social Media</option>
                            <option value="REFERRAL">Referral</option>
                            <option value="COLD_CALL">Cold Call</option>
                            <option value="TRADE_SHOW">Trade Show</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="leadStatus">Lead Status</label>
                        <select id="leadStatus" name="leadStatus">
                            <option value="NEW">New</option>
                            <option value="QUALIFIED">Qualified</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="INTERESTED">Interested</option>
                            <option value="NOT_INTERESTED">Not Interested</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="notes">Notes</label>
                    <textarea id="notes" name="notes" rows="3"></textarea>
                </div>
            </form>
        `;

        const modal = Utils.createModal('Add New Contact', modalContent, {
            footer: `
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button type="submit" form="add-contact-form" class="btn btn-primary">Add Contact</button>
            `
        });

        // Handle form submission
        const form = modal.querySelector('#add-contact-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddContact(form, modal);
        });
    }

    async handleAddContact(form, modal) {
        try {
            const formData = Utils.serializeForm(form);
            
            const submitBtn = modal.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

            await api.createContact(formData);
            
            modal.remove();
            await this.loadContacts();
            this.showSuccess('Contact added successfully!');
        } catch (error) {
            console.error('Failed to add contact:', error);
            this.showError(error.message || 'Failed to add contact');
        }
    }

    async viewContact(contactId) {
        try {
            const contact = await api.getContact(contactId);
            this.showContactDetails(contact);
        } catch (error) {
            console.error('Failed to load contact details:', error);
            this.showError('Failed to load contact details');
        }
    }

    showContactDetails(contact) {
        const fullName = Utils.formatName(contact.firstName, contact.lastName);
        
        const modalContent = `
            <div class="contact-details">
                <div class="contact-header">
                    <div class="contact-avatar-large">${Utils.getInitials(contact.firstName, contact.lastName)}</div>
                    <div class="contact-info">
                        <h3>${fullName}</h3>
                        <p>${contact.jobTitle || 'No Title'} at ${contact.company || 'No Company'}</p>
                        <span class="status-badge ${Utils.getStatusBadgeClass(contact.leadStatus)}">${Utils.formatStatus(contact.leadStatus)}</span>
                    </div>
                </div>
                
                <div class="contact-details-grid">
                    <div class="detail-section">
                        <h4>Contact Information</h4>
                        <div class="detail-item">
                            <label>Email:</label>
                            <span>${contact.email || 'Not provided'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Phone:</label>
                            <span>${contact.phone || 'Not provided'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Lead Source:</label>
                            <span>${contact.leadSource ? Utils.formatStatus(contact.leadSource) : 'Unknown'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Assignment</h4>
                        <div class="detail-item">
                            <label>Assigned To:</label>
                            <span>${contact.assignedTo ? Utils.formatName(contact.assignedTo.firstName, contact.assignedTo.lastName) : 'Unassigned'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Last Contact:</label>
                            <span>${contact.lastContactDate ? Utils.formatDateTime(contact.lastContactDate) : 'Never'}</span>
                        </div>
                    </div>
                </div>
                
                ${contact.notes ? `
                    <div class="detail-section">
                        <h4>Notes</h4>
                        <p>${contact.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;

        Utils.createModal(`Contact Details - ${fullName}`, modalContent, {
            footer: `
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button type="button" class="btn btn-primary" onclick="window.contacts.editContact('${contact.id}')">Edit Contact</button>
            `
        });
    }

    async editContact(contactId) {
        // Implementation for edit contact modal
        console.log('Edit contact:', contactId);
    }

    async deleteContact(contactId) {
        if (confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
            try {
                await api.deleteContact(contactId);
                await this.loadContacts();
                this.showSuccess('Contact deleted successfully!');
            } catch (error) {
                console.error('Failed to delete contact:', error);
                this.showError('Failed to delete contact');
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

// Create global contacts instance
window.contacts = new Contacts();