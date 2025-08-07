// Contacts Management
class Contacts {
    constructor() {
        this.contacts = [];
        this.currentPage = 1;
        this.pageSize = 25;
        this.totalPages = 0;
        this.isInitialized = false;
        this.filters = {
            search: '',
            leadStatus: '',
            leadSource: '',
            assignedTo: '',
            tab: 'all'
        };
        this.selectedContacts = new Set();
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
        // Create contact button
        const createBtn = document.getElementById('create-contact-btn');
        if (createBtn) {
            console.log('Create contact button found, adding event listener');
            createBtn.addEventListener('click', (e) => {
                console.log('Create contact button clicked');
                e.preventDefault();
                this.showCreateModal();
            });
        } else {
            console.error('Create contact button not found');
        }

        // Search functionality
        const searchInput = document.getElementById('contacts-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.debounceSearch();
            });
        }

        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Select all checkboxes
        const selectAllHeader = document.getElementById('select-all-contacts-header');
        const selectAllBody = document.getElementById('select-all-contacts');
        
        if (selectAllHeader) {
            selectAllHeader.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }
        
        if (selectAllBody) {
            selectAllBody.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }

        // Pagination
        const paginationButtons = document.querySelectorAll('.pagination-btn');
        paginationButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!btn.disabled && !btn.classList.contains('active')) {
                    const page = btn.textContent;
                    if (page === 'Prev') {
                        this.goToPage(this.currentPage - 1);
                    } else if (page === 'Next') {
                        this.goToPage(this.currentPage + 1);
                    } else {
                        this.goToPage(parseInt(page));
                    }
                }
            });
        });

        // Contact row click events (delegated to table body)
        const contactsTableBody = document.getElementById('contacts-table-body');
        if (contactsTableBody) {
            contactsTableBody.addEventListener('click', (e) => {
                console.log('Table body clicked:', e.target);
                const contactRow = e.target.closest('.contact-row-clickable');
                console.log('Contact row found:', contactRow);
                if (contactRow && !e.target.closest('.checkbox-container')) {
                    const contactId = contactRow.dataset.contactId;
                    console.log('Contact ID:', contactId);
                    if (contactId) {
                        this.showContactProfile(contactId);
                    } else {
                        console.error('No contact ID found in row');
                    }
                }
            });
        }
        
        // Also add direct click handlers to contact name cells as backup
        document.addEventListener('click', (e) => {
            const nameCell = e.target.closest('.name-column');
            if (nameCell) {
                const contactRow = nameCell.closest('.contact-row-clickable');
                if (contactRow && !e.target.closest('.checkbox-container')) {
                    const contactId = contactRow.dataset.contactId;
                    console.log('Name cell clicked, Contact ID:', contactId);
                    if (contactId) {
                        this.showContactProfile(contactId);
                    }
                }
            }
        });
    }

    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadContacts();
        }, 300);
    }

    switchTab(tab) {
        this.filters.tab = tab;
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        this.loadContacts();
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
            this.updatePagination();
            this.updateContactCount();
        } catch (error) {
            console.error('Failed to load contacts:', error);
            // For demo purposes, load sample data
            this.loadSampleData();
        }
    }

    loadSampleData() {
        // Sample data matching the screenshot
        this.contacts = [
            {
                id: '1',
                firstName: 'Steve',
                lastName: 'Finch',
                email: 's.finch@fanjango.com.hk',
                phone: '+852 9410 8647',
                company: 'Fanjango Limited',
                leadStatus: 'Open',
                assignedTo: { firstName: 'Theodore', lastName: 'Tse', email: 'ted@vib...' },
                lastActivityDate: null,
                createdAt: new Date(),
                isHubSpot: false
            },
            {
                id: '2',
                firstName: 'Theodore',
                lastName: 'Tse',
                email: 'ted@vib3cod3r.com',
                phone: '+852 9170 6477',
                company: 'vib3cod3r.com',
                leadStatus: 'In progress',
                assignedTo: { firstName: 'Steven', lastName: 'Finch', email: 's.finch@f...' },
                lastActivityDate: null,
                createdAt: new Date('2025-07-30T16:27:00'),
                isHubSpot: false
            },
            {
                id: '3',
                firstName: 'Brian',
                lastName: 'Halligan',
                email: 'bh@hubspot.com',
                phone: null,
                company: 'HubSpot',
                leadStatus: null,
                assignedTo: null,
                lastActivityDate: new Date('2025-08-02T16:20:00'),
                createdAt: new Date('2025-07-30T16:20:00'),
                isHubSpot: true
            },
            {
                id: '4',
                firstName: 'Maria',
                lastName: 'Johnson',
                email: 'emailmaria@hubspot.com',
                phone: null,
                company: 'HubSpot',
                leadStatus: null,
                assignedTo: null,
                lastActivityDate: new Date('2025-07-30T18:20:00'),
                createdAt: new Date('2025-07-30T16:20:00'),
                isHubSpot: true
            }
        ];

        this.renderContactsTable();
        this.updatePagination();
        this.updateContactCount();
    }

    renderContactsTable() {
        const tbody = document.getElementById('contacts-table-body');
        if (!tbody) return;

        if (this.contacts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center" style="padding: 48px 16px;">
                        <div class="empty-state">
                            <i class="fas fa-users fa-3x text-muted"></i>
                            <h3>No contacts found</h3>
                            <p>Start by adding your first contact to begin managing your leads.</p>
                            <button class="btn btn-primary" onclick="window.contacts.showCreateModal()">
                                <i class="fas fa-plus"></i>
                                Add Contact
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.contacts.map(contact => this.renderContactRow(contact)).join('');
    }

    renderContactRow(contact) {
        const fullName = `${contact.firstName} ${contact.lastName}`;
        const initials = this.getInitials(contact.firstName, contact.lastName);
        const avatarClass = contact.isHubSpot ? 'hubspot' : '';
        const companyIconClass = contact.isHubSpot ? 'hubspot' : '';
        
        return `
            <tr data-contact-id="${contact.id}" class="contact-row-clickable">
                <td class="checkbox-column">
                    <label class="checkbox-container">
                        <input type="checkbox" class="contact-checkbox" value="${contact.id}">
                        <span class="checkmark"></span>
                    </label>
                </td>
                <td class="name-column">
                    <div class="contact-name-cell">
                        <div class="contact-avatar ${avatarClass}">${initials}</div>
                        <div class="contact-name-info">
                            <div class="contact-name">${fullName}</div>
                            <div class="contact-email-small">${contact.email}</div>
                        </div>
                    </div>
                </td>
                <td class="email-column">${contact.email}</td>
                <td class="phone-column">${contact.phone || '--'}</td>
                <td class="owner-column">${contact.assignedTo ? `${contact.assignedTo.firstName} ${contact.assignedTo.lastName} (${contact.assignedTo.email})` : 'No owner'}</td>
                <td class="company-column">
                    <div class="company-info">
                        <div class="company-icon ${companyIconClass}">
                            ${contact.isHubSpot ? 'H' : '🏢'}
                        </div>
                        ${contact.company || '--'}
                    </div>
                </td>
                <td class="activity-column">${contact.lastActivityDate ? this.formatDateTime(contact.lastActivityDate) : '--'}</td>
                <td class="status-column">
                    ${contact.leadStatus ? `<span class="lead-status-badge ${contact.leadStatus.toLowerCase().replace(' ', '-')}">${contact.leadStatus}</span>` : '--'}
                </td>
                <td class="date-column">${this.formatDateTime(contact.createdAt)}</td>
            </tr>
        `;
    }

    updatePagination() {
        const paginationInfo = document.querySelector('.pagination-info');
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(start + this.pageSize - 1, this.contacts.length);
        const total = this.contacts.length;
        
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${start}-${end} of ${total} records`;
        }

        // Update pagination buttons
        const prevBtn = document.querySelector('.pagination-btn:first-child');
        const nextBtn = document.querySelector('.pagination-btn:nth-child(3)');
        
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;
    }

    updateContactCount() {
        const countElement = document.querySelector('.contacts-count');
        if (countElement) {
            countElement.textContent = `${this.contacts.length} records`;
        }
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.contact-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            if (checked) {
                this.selectedContacts.add(checkbox.value);
            } else {
                this.selectedContacts.delete(checkbox.value);
            }
        });

        // Update header checkbox
        const headerCheckbox = document.getElementById('select-all-contacts-header');
        const bodyCheckbox = document.getElementById('select-all-contacts');
        if (headerCheckbox) headerCheckbox.checked = checked;
        if (bodyCheckbox) bodyCheckbox.checked = checked;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadContacts();
    }

    getInitials(firstName, lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    formatDateTime(date) {
        if (!date) return '--';
        
        const now = new Date();
        const diffInHours = (now - new Date(date)) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return 'Today at ' + new Date(date).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            }) + ' GMT+8';
        } else {
            return new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }) + ' ' + new Date(date).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            }) + ' GMT+8';
        }
    }

    showCreateModal() {
        console.log('showCreateModal called');
        const modalContent = `
            <form id="create-contact-form">
                <div class="form-section">
                    <h4><i class="fas fa-user"></i> Contact Information</h4>
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
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" placeholder="contact@company.com">
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone</label>
                            <input type="tel" id="phone" name="phone" placeholder="+1 (555) 123-4567">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="company">Company</label>
                            <input type="text" id="company" name="company" placeholder="Company Name">
                        </div>
                        <div class="form-group">
                            <label for="jobTitle">Job Title</label>
                            <input type="text" id="jobTitle" name="jobTitle" placeholder="e.g., Sales Manager">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="website">Website</label>
                        <input type="url" id="website" name="website" placeholder="https://www.company.com">
                    </div>
                </div>
                
                <div class="form-section">
                    <h4><i class="fas fa-map-marker-alt"></i> Address Information</h4>
                    <div class="form-group">
                        <label for="address">Street Address</label>
                        <input type="text" id="address" name="address" placeholder="123 Business St">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="city">City</label>
                            <input type="text" id="city" name="city">
                        </div>
                        <div class="form-group">
                            <label for="state">State/Province</label>
                            <input type="text" id="state" name="state">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="zipCode">ZIP/Postal Code</label>
                            <input type="text" id="zipCode" name="zipCode">
                        </div>
                        <div class="form-group">
                            <label for="country">Country</label>
                            <input type="text" id="country" name="country" placeholder="United States">
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4><i class="fas fa-chart-line"></i> Sales & Lead Information</h4>
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
                                <option value="WEBINAR">Webinar</option>
                                <option value="ADVERTISEMENT">Advertisement</option>
                                <option value="PARTNER">Partner</option>
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
                                <option value="CONVERTED">Converted</option>
                                <option value="DEAD">Dead</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="assignedToId">Assign To</label>
                        <select id="assignedToId" name="assignedToId">
                            <option value="">Unassigned</option>
                            <!-- Will be populated with available users -->
                        </select>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4><i class="fas fa-sticky-note"></i> Additional Information</h4>
                    <div class="form-group">
                        <label for="notes">Notes</label>
                        <textarea id="notes" name="notes" rows="4" placeholder="Add any additional notes about this contact..."></textarea>
                    </div>
                </div>
            </form>
        `;

        const modal = Utils.createModal('Create New Contact', modalContent, {
            footer: `
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button type="submit" form="create-contact-form" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Create Contact
                </button>
            `,
            size: 'large'
        });

        // Load available users for assignment
        this.loadUsersForAssignment(modal);

        // Handle form submission
        const form = modal.querySelector('#create-contact-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreateContact(form, modal);
        });

        // Add form validation
        this.setupFormValidation(form);
    }

    async loadUsersForAssignment(modal) {
        try {
            const users = await api.getUsers();
            const select = modal.querySelector('#assignedToId');
            
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.firstName} ${user.lastName} (${user.email})`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    setupFormValidation(form) {
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    this.validateField(field);
                }
            });
        });

        // Email validation
        const emailField = form.querySelector('#email');
        if (emailField) {
            emailField.addEventListener('blur', () => {
                this.validateEmail(emailField);
            });
        }

        // Phone validation
        const phoneField = form.querySelector('#phone');
        if (phoneField) {
            phoneField.addEventListener('input', () => {
                this.formatPhoneNumber(phoneField);
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = value.length > 0;
        
        if (!isValid) {
            field.classList.add('error');
            this.showFieldError(field, 'This field is required');
        } else {
            field.classList.remove('error');
            this.clearFieldError(field);
        }
        
        return isValid;
    }

    validateEmail(emailField) {
        const email = emailField.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            emailField.classList.add('error');
            this.showFieldError(emailField, 'Please enter a valid email address');
            return false;
        } else {
            emailField.classList.remove('error');
            this.clearFieldError(emailField);
            return true;
        }
    }

    formatPhoneNumber(phoneField) {
        let value = phoneField.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        
        phoneField.value = value;
    }

    showFieldError(field, message) {
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async handleCreateContact(form, modal) {
        try {
            // Validate form
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            const emailField = form.querySelector('#email');
            if (emailField && emailField.value && !this.validateEmail(emailField)) {
                isValid = false;
            }

            if (!isValid) {
                this.showError('Please fix the errors in the form');
                return;
            }

            const formData = Utils.serializeForm(form);
            
            // Clean up phone number
            if (formData.phone) {
                formData.phone = formData.phone.replace(/\D/g, '');
            }
            
            const submitBtn = modal.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

            const response = await api.createContact(formData);
            
            modal.remove();
            await this.loadContacts();
            this.showSuccess(`Contact "${response.firstName} ${response.lastName}" created successfully!`);
        } catch (error) {
            console.error('Failed to create contact:', error);
            
            const submitBtn = modal.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            let errorMessage = 'Failed to create contact';
            if (error.message) {
                if (error.message.includes('email already exists')) {
                    errorMessage = 'A contact with this email already exists';
                } else {
                    errorMessage = error.message;
                }
            }
            
            this.showError(errorMessage);
        }
    }

    showSuccess(message) {
        if (window.app) window.app.showSuccess(message);
    }

    showError(message) {
        if (window.app) window.app.showError(message);
    }

    async showContactProfile(contactId) {
        console.log('showContactProfile called with ID:', contactId);
        try {
            const contact = await api.getContact(contactId);
            console.log('Contact data received:', contact);
            if (!contact) {
                console.error('Contact not found for ID:', contactId);
                this.showError('Contact not found');
                return;
            }
            
            // Create full-page layout instead of modal
            const profileContent = this.createContactProfileContent(contact);
            console.log('Profile content created');
            
            // Replace the page content area with the profile (preserving the header)
            const pageContent = document.querySelector('.page-content');
            console.log('Page content element:', pageContent);
            if (pageContent) {
                pageContent.innerHTML = profileContent;
                console.log('Profile content inserted into page content');
                this.setupProfileEventListeners(contact);
                console.log('Profile event listeners set up');
            } else {
                console.error('Page content element not found');
            }
        } catch (error) {
            console.error('Failed to load contact profile:', error);
            this.showError('Failed to load contact profile');
        }
    }

    loadContactsPage() {
        console.log('Loading contacts page...');
        
        // Get the original contacts page HTML from the server or recreate it
        const pageContent = document.querySelector('.page-content');
        console.log('Page content element found:', pageContent);
        if (pageContent) {
            console.log('Restoring contacts page HTML...');
            // Restore the original contacts page structure
            pageContent.innerHTML = `
                <!-- Contacts Page -->
                <div id="contacts-page" class="page active">
                    <!-- Contacts Header -->
                    <div class="contacts-header">
                        <div class="contacts-header-left">
                            <div class="contacts-title">
                                <h1>Contacts</h1>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="contacts-count">4 records</div>
                        </div>
                        
                        <div class="contacts-header-center">
                            <div class="contacts-tabs">
                                <button class="tab-btn active" data-tab="all">All contacts</button>
                                <button class="tab-btn" data-tab="my">My contacts</button>
                                <button class="tab-btn" data-tab="unassigned">Unassigned contacts</button>
                            </div>
                            <div class="view-actions">
                                <button class="btn btn-secondary btn-sm">
                                    <i class="fas fa-plus"></i>
                                    Add view (3/5)
                                </button>
                                <button class="btn btn-secondary btn-sm">All Views</button>
                            </div>
                        </div>
                        
                        <div class="contacts-header-right">
                            <button class="btn btn-secondary btn-sm">
                                <i class="fas fa-lock"></i>
                                Data Quality
                            </button>
                            <div class="dropdown">
                                <button class="btn btn-secondary btn-sm dropdown-toggle">
                                    Actions
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>
                            <button class="btn btn-secondary btn-sm">Import</button>
                            <button class="btn btn-primary btn-sm" id="create-contact-btn">
                                <i class="fas fa-plus"></i>
                                Create contact
                            </button>
                        </div>
                    </div>

                    <!-- Search and Filters -->
                    <div class="contacts-filters">
                        <div class="search-container">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="Search name, phone, email" id="contacts-search">
                        </div>
                        
                        <div class="filter-row">
                            <div class="filter-dropdown">
                                <button class="filter-btn">
                                    Contact owner
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>
                            <div class="filter-dropdown">
                                <button class="filter-btn">
                                    Create date
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>
                            <div class="filter-dropdown">
                                <button class="filter-btn">
                                    Last activity date
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>
                            <div class="filter-dropdown">
                                <button class="filter-btn">
                                    Lead status
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>
                            <div class="filter-dropdown">
                                <button class="filter-btn">
                                    + More
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>
                            <div class="filter-dropdown">
                                <button class="filter-btn">
                                    Advanced filters
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Contacts Table -->
                    <div class="contacts-table-container">
                        <div class="table-actions">
                            <div class="table-actions-left">
                                <label class="checkbox-container">
                                    <input type="checkbox" id="select-all-contacts">
                                    <span class="checkmark"></span>
                                </label>
                            </div>
                            <div class="table-actions-right">
                                <button class="btn btn-secondary btn-sm">Export</button>
                                <button class="btn btn-secondary btn-sm">Edit columns</button>
                            </div>
                        </div>
                        
                        <div class="table-container">
                            <table class="contacts-table">
                                <thead>
                                    <tr>
                                        <th class="checkbox-column">
                                            <label class="checkbox-container">
                                                <input type="checkbox" id="select-all-contacts-header">
                                                <span class="checkmark"></span>
                                            </label>
                                        </th>
                                        <th class="name-column">NAME</th>
                                        <th class="email-column">EMAIL</th>
                                        <th class="phone-column">PHONE NUMBER</th>
                                        <th class="owner-column">CONTACT OWNER</th>
                                        <th class="company-column">PRIMARY COMPANY</th>
                                        <th class="activity-column">LAST ACTIVITY DATE (GMT+8)</th>
                                        <th class="status-column">LEAD STATUS</th>
                                        <th class="date-column">CREATE DATE (GMT+8)</th>
                                    </tr>
                                </thead>
                                <tbody id="contacts-table-body">
                                    <!-- Contact rows will be populated here -->
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="table-footer">
                            <div class="pagination-info">Showing 1-4 of 4 records</div>
                            <div class="pagination">
                                <button class="pagination-btn" disabled>Prev</button>
                                <button class="pagination-btn active">1</button>
                                <button class="pagination-btn" disabled>Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            console.log('Contacts page HTML restored, reinitializing...');
            // Reinitialize the contacts functionality
            this.initialize();
            console.log('Contacts page loaded successfully!');
        } else {
            console.error('Page content element not found!');
        }
    }

    createContactProfileContent(contact) {
        const initials = Utils.getInitials(contact.firstName, contact.lastName);
        const fullName = Utils.formatName(contact.firstName, contact.lastName);
        const formattedPhone = contact.phone ? Utils.formatPhone(contact.phone) : '--';
        const formattedDate = contact.createdAt ? new Date(contact.createdAt).toLocaleString() : '--';
        
        return `
            <div class="contact-profile-page">
                <!-- Header with back button -->
                <div class="profile-header">
                    <button class="btn btn-secondary back-btn" id="back-to-contacts-btn">
                        <i class="fas fa-arrow-left"></i> Back to Contacts
                    </button>
                    <h1>Contact Profile</h1>
                </div>
                
                <div class="profile-layout">
                    <!-- Left Sidebar -->
                    <div class="profile-sidebar">
                        <!-- Contact Header -->
                        <div class="contact-header">
                            <div class="contact-avatar">
                                <span class="avatar-text">${initials}</span>
                            </div>
                            <div class="contact-info">
                                <h2 class="contact-name">${fullName}</h2>
                                <p class="contact-title">${contact.jobTitle || 'No title'} at ${contact.company || 'No company'}</p>
                                <p class="contact-email">
                                    <a href="mailto:${contact.email}">${contact.email}</a>
                                    <i class="fas fa-external-link-alt"></i>
                                </p>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="action-buttons">
                            <button class="action-btn" title="Note">
                                <i class="fas fa-sticky-note"></i>
                                <span>Note</span>
                            </button>
                            <button class="action-btn" title="Email">
                                <i class="fas fa-envelope"></i>
                                <span>Email</span>
                            </button>
                            <button class="action-btn" title="Call">
                                <i class="fas fa-phone"></i>
                                <span>Call</span>
                            </button>
                            <button class="action-btn" title="Task">
                                <i class="fas fa-tasks"></i>
                                <span>Task</span>
                            </button>
                            <button class="action-btn" title="Meeting">
                                <i class="fas fa-calendar"></i>
                                <span>Meeting</span>
                            </button>
                            <button class="action-btn" title="More">
                                <i class="fas fa-ellipsis-h"></i>
                                <span>More</span>
                            </button>
                        </div>
                        
                        <!-- About this contact -->
                        <div class="sidebar-section">
                            <div class="section-header">
                                <h3>About this contact</h3>
                                <div class="section-actions">
                                    <select class="actions-dropdown">
                                        <option>Actions</option>
                                        <option>Edit</option>
                                        <option>Delete</option>
                                    </select>
                                    <button class="gear-btn"><i class="fas fa-cog"></i></button>
                                </div>
                            </div>
                            <div class="contact-details">
                                <div class="detail-item">
                                    <label>Email:</label>
                                    <span>${contact.email}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Phone number:</label>
                                    <span>${formattedPhone}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Preferred channels:</label>
                                    <span>--</span>
                                </div>
                                <div class="detail-item">
                                    <label>Favorite Content Topics:</label>
                                    <span>--</span>
                                </div>
                                <div class="detail-item">
                                    <label>Lead status:</label>
                                    <div class="editable-field" data-field="leadStatus" data-contact-id="${contact.id}">
                                        <span class="field-value">${contact.leadStatus || 'Open'}</span>
                                        <button class="edit-field-btn" title="Edit lead status">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="detail-item">
                                    <label>Create date:</label>
                                    <span>${formattedDate}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Communication subscriptions -->
                        <div class="sidebar-section collapsed">
                            <div class="section-header">
                                <h3>Communication subscriptions</h3>
                            </div>
                            <p>Use subscription types to manage the communications this contact receives from you.</p>
                            <a href="#" class="link-btn">View subscriptions</a>
                        </div>
                        
                        <!-- Website activity -->
                        <div class="sidebar-section collapsed">
                            <div class="section-header">
                                <h3>Website activity</h3>
                            </div>
                            <p>Website activity shows you how many times a person has visited your site and viewed your pages.</p>
                        </div>
                    </div>
                    
                    <!-- Main Content Area -->
                    <div class="profile-main">
                        <!-- Navigation Tabs -->
                        <div class="profile-tabs">
                            <button class="tab-btn active" data-tab="overview">Overview</button>
                            <button class="tab-btn" data-tab="activities">Activities</button>
                            <button class="tab-btn" data-tab="intelligence">Intelligence</button>
                        </div>
                        
                        <!-- Tab Content -->
                        <div class="tab-content">
                            <!-- Overview Tab -->
                            <div class="tab-pane active" id="overview">
                                <!-- Data highlights -->
                                <div class="content-section">
                                    <div class="section-header">
                                        <h3>Data highlights</h3>
                                        <button class="gear-btn"><i class="fas fa-cog"></i></button>
                                    </div>
                                    <div class="highlights-grid">
                                        <div class="highlight-item">
                                            <label>CREATE DATE</label>
                                            <span>${formattedDate}</span>
                                        </div>
                                        <div class="highlight-item">
                                            <label>LIFECYCLE STAGE</label>
                                            <span>${contact.leadStatus || 'Lead'}</span>
                                        </div>
                                        <div class="highlight-item">
                                            <label>LAST ACTIVITY DATE</label>
                                            <span>--</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Recent activities -->
                                <div class="content-section">
                                    <div class="section-header">
                                        <h3>Recent activities</h3>
                                    </div>
                                    <div class="activities-search">
                                        <input type="text" placeholder="Search activities" class="search-input">
                                        <i class="fas fa-search"></i>
                                    </div>
                                    <div class="activities-filter">
                                        <a href="#" class="filter-link">Filter by: 5 activities</a>
                                    </div>
                                    <div class="activities-content">
                                        ${this.getRecentActivitiesHTML()}
                                    </div>
                                </div>
                                
                                <!-- Contacts -->
                                <div class="content-section">
                                    <div class="section-header">
                                        <h3>Contacts</h3>
                                        <div class="section-actions">
                                            <button class="add-btn">+ Add</button>
                                            <button class="gear-btn"><i class="fas fa-cog"></i></button>
                                        </div>
                                    </div>
                                    <div class="no-data">
                                        <p>No associated objects of this type exist or you don't have permission to view them.</p>
                                    </div>
                                </div>
                                
                                <!-- Companies -->
                                <div class="content-section">
                                    <div class="section-header">
                                        <h3>Companies</h3>
                                        <div class="section-actions">
                                            <button class="add-btn">+ Add</button>
                                            <button class="gear-btn"><i class="fas fa-cog"></i></button>
                                        </div>
                                    </div>
                                    <div class="companies-table">
                                        <div class="table-filters">
                                            <input type="text" placeholder="Search" class="search-input">
                                            <i class="fas fa-search"></i>
                                        </div>
                                        <div class="table-sort-headers">
                                            <span class="sort-header">Company owner</span>
                                            <span class="sort-header">Lead status</span>
                                            <span class="sort-header">Last activity date</span>
                                            <span class="sort-header">Create date</span>
                                        </div>
                                        <table class="data-table">
                                            <thead>
                                                <tr>
                                                    <th>COMPANY NAME</th>
                                                    <th>COMPANY DOMAIN NAME</th>
                                                    <th>PHONE NUMBER</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div class="company-info">
                                                            <i class="fas fa-globe"></i>
                                                            ${contact.company || 'No company'}
                                                            <span class="primary-tag">Primary</span>
                                                        </div>
                                                        <div class="company-domain">
                                                            <a href="#" class="domain-link">
                                                                ${contact.website || '--'}
                                                                <i class="fas fa-external-link-alt"></i>
                                                            </a>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <a href="#" class="domain-link">
                                                            ${contact.website || '--'}
                                                            <i class="fas fa-external-link-alt"></i>
                                                        </a>
                                                    </td>
                                                    <td>--</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <!-- Deals -->
                                <div class="content-section">
                                    <div class="section-header">
                                        <h3>Deals</h3>
                                        <div class="section-actions">
                                            <button class="add-btn">+ Add</button>
                                            <button class="gear-btn"><i class="fas fa-cog"></i></button>
                                        </div>
                                    </div>
                                    <div class="no-data">
                                        <p>No associated objects of this type exist or you don't have permission to view them.</p>
                                    </div>
                                </div>
                                
                                <!-- Tickets -->
                                <div class="content-section">
                                    <div class="section-header">
                                        <h3>Tickets</h3>
                                        <div class="section-actions">
                                            <button class="add-btn">+ Add</button>
                                            <button class="gear-btn"><i class="fas fa-cog"></i></button>
                                        </div>
                                    </div>
                                    <div class="no-data">
                                        <p>No associated objects of this type exist or you don't have permission to view them.</p>
                                    </div>
                                </div>
                                
                                <!-- Subscriptions -->
                                <div class="content-section">
                                    <div class="section-header">
                                        <h3>Subscriptions</h3>
                                        <div class="section-actions">
                                            <button class="add-btn">+ Add</button>
                                            <button class="gear-btn"><i class="fas fa-cog"></i></button>
                                        </div>
                                    </div>
                                    <div class="no-data">
                                        <p>No associated objects of this type exist or you don't have permission to view them.</p>
                                    </div>
                                </div>
                                
                                <!-- Payments -->
                                <div class="content-section">
                                    <div class="section-header">
                                        <h3>Payments</h3>
                                        <div class="section-actions">
                                            <button class="add-btn">+ Add</button>
                                            <button class="gear-btn"><i class="fas fa-cog"></i></button>
                                        </div>
                                    </div>
                                    <div class="no-data">
                                        <p>No associated objects of this type exist or you don't have permission to view them.</p>
                                    </div>
                                </div>
                                
                                <!-- Orders -->
                                <div class="content-section">
                                    <div class="section-header">
                                        <h3>Orders</h3>
                                        <div class="section-actions">
                                            <button class="add-btn">+ Add</button>
                                            <button class="gear-btn"><i class="fas fa-cog"></i></button>
                                        </div>
                                    </div>
                                    <div class="no-data">
                                        <p>No associated objects of this type exist or you don't have permission to view them.</p>
                                    </div>
                                </div>
                                
                                <!-- Upcoming activities -->
                                <div class="content-section">
                                    <div class="section-header">
                                        <h3>Upcoming activities</h3>
                                    </div>
                                    <div class="activities-search">
                                        <input type="text" placeholder="Search activities" class="search-input">
                                        <i class="fas fa-search"></i>
                                    </div>
                                    <div class="activities-filter">
                                        <a href="#" class="filter-link">Filter by: 5 activities</a>
                                    </div>
                                    <div class="activities-content">
                                        <div class="no-activities">
                                            <i class="fas fa-search"></i>
                                            <p>No activities</p>
                                        </div>
                                        <button class="time-filter-btn">All upcoming</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Activities Tab -->
                            <div class="tab-pane" id="activities">
                                <!-- Activity Search and Filters -->
                                <div class="content-section">
                                    <div class="section-header">
                                        <h3>Activity Search</h3>
                                    </div>
                                    <div class="activities-search">
                                        <input type="text" placeholder="Search activities" class="search-input">
                                        <i class="fas fa-search"></i>
                                    </div>
                                    <div class="activities-filter">
                                        <a href="#" class="filter-link">Filter by: All activities</a>
                                    </div>
                                </div>
                                
                                <!-- Activity Timeline -->
                                <div class="content-section">
                                    <div class="section-header">
                                        <h3>Activity Timeline</h3>
                                        <div class="section-actions">
                                            <button class="add-btn">+ Add activity</button>
                                            <button class="gear-btn"><i class="fas fa-cog"></i></button>
                                        </div>
                                    </div>
                                    
                                    <div class="activity-timeline">
                                        <!-- Today -->
                                        <div class="timeline-group">
                                            <div class="timeline-date">Today</div>
                                            
                                            <!-- Note Activity -->
                                            <div class="activity-item">
                                                <div class="activity-icon note">
                                                    <i class="fas fa-sticky-note"></i>
                                                </div>
                                                <div class="activity-content">
                                                    <div class="activity-header">
                                                        <span class="activity-type">Note</span>
                                                        <span class="activity-time">2 hours ago</span>
                                                    </div>
                                                    <div class="activity-body">
                                                        <p>Followed up with the client regarding their requirements. They seem interested in our premium package.</p>
                                                    </div>
                                                    <div class="activity-footer">
                                                        <span class="activity-owner">Created by John Doe</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- Email Activity -->
                                            <div class="activity-item">
                                                <div class="activity-icon email">
                                                    <i class="fas fa-envelope"></i>
                                                </div>
                                                <div class="activity-content">
                                                    <div class="activity-header">
                                                        <span class="activity-type">Email</span>
                                                        <span class="activity-time">4 hours ago</span>
                                                    </div>
                                                    <div class="activity-body">
                                                        <p>Sent proposal email with pricing details and next steps.</p>
                                                    </div>
                                                    <div class="activity-footer">
                                                        <span class="activity-owner">Sent by John Doe</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Yesterday -->
                                        <div class="timeline-group">
                                            <div class="timeline-date">Yesterday</div>
                                            
                                            <!-- Call Activity -->
                                            <div class="activity-item">
                                                <div class="activity-icon call">
                                                    <i class="fas fa-phone"></i>
                                                </div>
                                                <div class="activity-content">
                                                    <div class="activity-header">
                                                        <span class="activity-type">Call</span>
                                                        <span class="activity-time">1 day ago</span>
                                                    </div>
                                                    <div class="activity-body">
                                                        <p>Initial discovery call. Discussed their business needs and current challenges.</p>
                                                        <div class="call-details">
                                                            <span class="call-duration">Duration: 25 minutes</span>
                                                            <span class="call-status">Completed</span>
                                                        </div>
                                                    </div>
                                                    <div class="activity-footer">
                                                        <span class="activity-owner">Called by John Doe</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- Task Activity -->
                                            <div class="activity-item">
                                                <div class="activity-icon task">
                                                    <i class="fas fa-tasks"></i>
                                                </div>
                                                <div class="activity-content">
                                                    <div class="activity-header">
                                                        <span class="activity-type">Task</span>
                                                        <span class="activity-time">1 day ago</span>
                                                    </div>
                                                    <div class="activity-body">
                                                        <p>Prepare proposal document with custom pricing</p>
                                                        <div class="task-details">
                                                            <span class="task-status completed">Completed</span>
                                                            <span class="task-due">Due: Yesterday</span>
                                                        </div>
                                                    </div>
                                                    <div class="activity-footer">
                                                        <span class="activity-owner">Assigned to John Doe</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- This Week -->
                                        <div class="timeline-group">
                                            <div class="timeline-date">This Week</div>
                                            
                                            <!-- Meeting Activity -->
                                            <div class="activity-item">
                                                <div class="activity-icon meeting">
                                                    <i class="fas fa-calendar"></i>
                                                </div>
                                                <div class="activity-content">
                                                    <div class="activity-header">
                                                        <span class="activity-type">Meeting</span>
                                                        <span class="activity-time">3 days ago</span>
                                                    </div>
                                                    <div class="activity-body">
                                                        <p>Product demo meeting with technical team</p>
                                                        <div class="meeting-details">
                                                            <span class="meeting-duration">Duration: 45 minutes</span>
                                                            <span class="meeting-status">Completed</span>
                                                        </div>
                                                    </div>
                                                    <div class="activity-footer">
                                                        <span class="activity-owner">Scheduled by John Doe</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- Email Activity -->
                                            <div class="activity-item">
                                                <div class="activity-icon email">
                                                    <i class="fas fa-envelope"></i>
                                                </div>
                                                <div class="activity-content">
                                                    <div class="activity-header">
                                                        <span class="activity-type">Email</span>
                                                        <span class="activity-time">4 days ago</span>
                                                    </div>
                                                    <div class="activity-body">
                                                        <p>Sent welcome email and onboarding materials</p>
                                                    </div>
                                                    <div class="activity-footer">
                                                        <span class="activity-owner">Sent by John Doe</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Load More Activities -->
                                    <div class="load-more-activities">
                                        <button class="btn btn-secondary">Load more activities</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Intelligence Tab -->
                            <div class="tab-pane" id="intelligence">
                                <div class="tab-placeholder">
                                    <h3>Intelligence</h3>
                                    <p>Contact intelligence and insights will be displayed here.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Sidebar -->
                    <div class="profile-sidebar right-sidebar">
                        <div class="sidebar-section">
                            <div class="section-header">
                                <h3>Breeze record summary</h3>
                            </div>
                        </div>
                        
                        <!-- Contact summary -->
                        <div class="sidebar-section">
                            <div class="section-header">
                                <h3>Contact summary</h3>
                                <span class="priority-tag">A1</span>
                            </div>
                            <div class="summary-content">
                                <div class="summary-dot"></div>
                                <button class="ask-btn">+ Ask a question</button>
                            </div>
                        </div>
                        
                        <!-- Companies -->
                        <div class="sidebar-section">
                            <div class="section-header">
                                <h3>Companies (1)</h3>
                                <button class="add-btn">+ Add</button>
                            </div>
                            <div class="company-summary">
                                <span class="primary-tag">Primary</span>
                                <div class="company-info">
                                    <strong>${contact.company || 'No company'}</strong>
                                    <a href="#" class="domain-link">
                                        ${contact.website || '--'}
                                        <i class="fas fa-external-link-alt"></i>
                                    </a>
                                </div>
                                <p class="company-phone">--</p>
                                <a href="#" class="link-btn">View associated Company</a>
                            </div>
                        </div>
                        
                        <!-- Deals -->
                        <div class="sidebar-section collapsed">
                            <div class="section-header">
                                <h3>Deals (0)</h3>
                                <button class="add-btn">+ Add</button>
                            </div>
                            <p>Track the revenue opportunities associated with this record.</p>
                        </div>
                        
                        <!-- Quotes -->
                        <div class="sidebar-section collapsed">
                            <div class="section-header">
                                <h3>Quotes (0)</h3>
                                <button class="add-btn">+ Add</button>
                            </div>
                            <p>Track the sales documents associated with this record.</p>
                        </div>
                        
                        <!-- Tickets -->
                        <div class="sidebar-section collapsed">
                            <div class="section-header">
                                <h3>Tickets (0)</h3>
                                <button class="add-btn">+ Add</button>
                            </div>
                            <p>Track the customer requests associated with this record.</p>
                        </div>
                        
                        <!-- Payment Links -->
                        <div class="sidebar-section collapsed">
                            <div class="section-header">
                                <h3>Payment Links (0)</h3>
                                <div class="dropdown">
                                    <button class="add-btn">Add</button>
                                </div>
                            </div>
                            <p>Give customers a fast, flexible way to pay. Add a payment link to accept a payment and associate it with this record.</p>
                            <button class="setup-btn">Set up payments</button>
                        </div>
                        
                        <!-- Contacts -->
                        <div class="sidebar-section collapsed">
                            <div class="section-header">
                                <h3>Contacts (0)</h3>
                                <button class="add-btn">+ Add</button>
                            </div>
                            <p>See the people associated with this record.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupProfileEventListeners(contact) {
        // Tab switching functionality
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Remove active class from all tabs and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding pane
                button.classList.add('active');
                const targetPane = document.getElementById(targetTab);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
        
        // Collapsible sidebar sections
        const sidebarSections = document.querySelectorAll('.sidebar-section');
        sidebarSections.forEach(section => {
            const header = section.querySelector('.section-header');
            if (header) {
                header.addEventListener('click', () => {
                    section.classList.toggle('collapsed');
                });
            }
        });
        
        // Action buttons functionality
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.title;
                if (action === 'Note') {
                    this.showNoteDialog(contact);
                } else {
                    this.showSuccess(`${action} action clicked for ${contact.firstName} ${contact.lastName}`);
                }
            });
        });
        
        // Actions dropdown
        const actionsDropdown = document.querySelector('.actions-dropdown');
        if (actionsDropdown) {
            actionsDropdown.addEventListener('change', (e) => {
                const action = e.target.value;
                if (action === 'Edit') {
                    this.showEditContactModal(contact);
                } else if (action === 'Delete') {
                    this.confirmDeleteContact(contact);
                }
            });
        }

        // Back to contacts button
        const backToContactsBtn = document.getElementById('back-to-contacts-btn');
        console.log('Back button found:', backToContactsBtn);
        if (backToContactsBtn) {
            backToContactsBtn.addEventListener('click', (e) => {
                console.log('Back button clicked!');
                e.preventDefault();
                console.log('Loading contacts page directly...');
                this.loadContactsPage();
            });
            console.log('Back button event listener added');
        } else {
            console.error('Back button not found!');
        }
        
        // Backup: Document-level event listener for back button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#back-to-contacts-btn')) {
                console.log('Back button clicked via document listener!');
                e.preventDefault();
                console.log('Loading contacts page via document listener...');
                this.loadContactsPage();
            }
        });

        // Make all note activities clickable and editable
        this.setupNoteActivitiesListeners(contact);
        
        // Setup editable fields
        this.setupEditableFields(contact);
    }

    async showEditContactModal(contact) {
        // This would be similar to showCreateModal but pre-populated with contact data
        // For now, we'll show a simple message
        this.showSuccess('Edit functionality will be implemented in the next iteration');
    }

    async confirmDeleteContact(contact) {
        const confirmModal = Utils.createModal('Confirm Delete', `
            <p>Are you sure you want to delete the contact "${contact.firstName} ${contact.lastName}"?</p>
            <p>This action cannot be undone.</p>
        `, {
            size: 'medium',
            closeable: true,
            footer: `
                <button class="btn btn-secondary" id="cancel-delete-btn">Cancel</button>
                <button class="btn btn-danger" id="confirm-delete-btn">Delete Contact</button>
            `
        });

        const cancelBtn = confirmModal.querySelector('#cancel-delete-btn');
        const confirmBtn = confirmModal.querySelector('#confirm-delete-btn');

        cancelBtn.addEventListener('click', () => {
            confirmModal.remove();
        });

        confirmBtn.addEventListener('click', async () => {
            try {
                await api.deleteContact(contact.id);
                confirmModal.remove();
                await this.loadContacts();
                this.showSuccess(`Contact "${contact.firstName} ${contact.lastName}" deleted successfully`);
            } catch (error) {
                console.error('Failed to delete contact:', error);
                this.showError('Failed to delete contact');
            }
        });
    }

    setupEditableFields(contact) {
        const editableFields = document.querySelectorAll('.editable-field');
        editableFields.forEach(field => {
            const editBtn = field.querySelector('.edit-field-btn');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const fieldType = field.dataset.field;
                    const contactId = field.dataset.contactId;
                    
                    if (fieldType === 'leadStatus') {
                        this.showLeadStatusDialog(contact, field);
                    }
                });
            }
        });
    }

    showLeadStatusDialog(contact, fieldElement) {
        const currentStatus = contact.leadStatus || 'Open';
        const statusOptions = [
            'Open',
            'New',
            'Contacted',
            'Qualified',
            'Unqualified',
            'Converted',
            'Lost'
        ];

        const dialogContent = `
            <div class="lead-status-dialog">
                <div class="dialog-header">
                    <h3>Edit Lead Status</h3>
                    <button class="btn btn-icon close-dialog-btn" title="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="dialog-content">
                    <div class="form-group">
                        <label for="lead-status-select">Lead Status:</label>
                        <select id="lead-status-select" class="form-control">
                            ${statusOptions.map(status => 
                                `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${status}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="dialog-footer">
                    <button class="btn btn-secondary cancel-btn">Cancel</button>
                    <button class="btn btn-primary save-btn">Save</button>
                </div>
            </div>
        `;

        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = dialogContent;
        document.body.appendChild(dialog);

        // Event listeners
        const closeBtn = dialog.querySelector('.close-dialog-btn');
        const cancelBtn = dialog.querySelector('.cancel-btn');
        const saveBtn = dialog.querySelector('.save-btn');
        const statusSelect = dialog.querySelector('#lead-status-select');

        const closeDialog = () => {
            dialog.remove();
        };

        closeBtn.addEventListener('click', closeDialog);
        cancelBtn.addEventListener('click', closeDialog);
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                closeDialog();
            }
        });

        saveBtn.addEventListener('click', async () => {
            const newStatus = statusSelect.value;
            try {
                // Update the contact object
                contact.leadStatus = newStatus;
                
                // Update the display
                const fieldValue = fieldElement.querySelector('.field-value');
                if (fieldValue) {
                    fieldValue.textContent = newStatus;
                }
                
                // In a real application, you would save to the database here
                // await this.updateContactLeadStatus(contact.id, newStatus);
                
                this.showSuccess('Lead status updated successfully!');
                closeDialog();
            } catch (error) {
                console.error('Error updating lead status:', error);
                this.showError('Failed to update lead status');
            }
        });

        // Focus on the select element
        setTimeout(() => {
            if (statusSelect) {
                statusSelect.focus();
            }
        }, 100);
    }

    showNoteDialog(contact) {
        // Get existing notes for this contact
        const existingNotes = this.getExistingNotes(contact);
        
        const noteContent = `
            <div class="note-dialog">
                <div class="note-header">
                    <div class="note-title">
                        <h3>Notes</h3>
                        <span class="note-subtitle">For ${contact.firstName} ${contact.lastName}</span>
                    </div>
                    <div class="note-actions">
                        <button class="btn btn-icon" title="Close" id="close-note-dialog">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="note-content">
                    <!-- Previous Notes Display -->
                    <div class="previous-notes">
                        <h4>Previous Notes</h4>
                        <div class="notes-list">
                            ${existingNotes.length > 0 ? existingNotes.map(note => `
                                <div class="note-item" data-note-id="${note.id}">
                                    <div class="note-item-header">
                                        <div class="note-item-info">
                                            <span class="note-owner">${note.owner}</span>
                                            <span class="note-timestamp">${this.formatDateTime(note.timestamp)}</span>
                                        </div>
                                        <div class="note-item-actions">
                                            <button class="btn btn-icon edit-note-btn" title="Edit" data-note-id="${note.id}">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-icon delete-note-btn" title="Delete" data-note-id="${note.id}">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="note-item-content">
                                        <p>${note.content}</p>
                                    </div>
                                </div>
                            `).join('') : '<div class="no-notes">No previous notes</div>'}
                        </div>
                    </div>
                    
                    <!-- New Note Section -->
                    <div class="new-note-section">
                        <h4>Add New Note</h4>
                        <div class="note-textarea-container">
                            <textarea 
                                id="note-content" 
                                placeholder="Start typing to leave a note..." 
                                rows="4"
                                class="note-textarea"
                            ></textarea>
                        </div>
                        
                        <div class="note-formatting">
                            <div class="formatting-buttons">
                                <button class="btn btn-icon" title="Bold">
                                    <i class="fas fa-bold"></i>
                                </button>
                                <button class="btn btn-icon" title="Italic">
                                    <i class="fas fa-italic"></i>
                                </button>
                                <button class="btn btn-icon" title="Underline">
                                    <i class="fas fa-underline"></i>
                                </button>
                                <div class="dropdown">
                                    <button class="btn btn-icon dropdown-toggle" title="More">
                                        <i class="fas fa-ellipsis-h"></i>
                                    </button>
                                    <div class="dropdown-menu">
                                        <a href="#" class="dropdown-item">
                                            <i class="fas fa-link"></i> Link
                                        </a>
                                        <a href="#" class="dropdown-item">
                                            <i class="fas fa-image"></i> Image
                                        </a>
                                        <a href="#" class="dropdown-item">
                                            <i class="fas fa-table"></i> Table
                                        </a>
                                        <a href="#" class="dropdown-item">
                                            <i class="fas fa-paperclip"></i> Attachment
                                        </a>
                                    </div>
                                </div>
                                <button class="btn btn-icon" title="Bullet List">
                                    <i class="fas fa-list-ul"></i>
                                </button>
                                <button class="btn btn-icon" title="Numbered List">
                                    <i class="fas fa-list-ol"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="note-options">
                            <label class="checkbox-container">
                                <input type="checkbox" id="create-todo">
                                <span class="checkmark"></span>
                                Create a To-do task to follow up In 3 business days (Monday)
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="note-footer">
                    <div class="note-footer-content">
                        <div class="note-footer-left"></div>
                        <div class="note-footer-right">
                            <button class="btn btn-primary" id="create-note-btn">
                                Create note
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Create the note dialog as an overlay
        const noteDialog = document.createElement('div');
        noteDialog.className = 'note-dialog-overlay';
        noteDialog.innerHTML = noteContent;
        document.body.appendChild(noteDialog);

        // Add event listeners
        const createNoteBtn = noteDialog.querySelector('#create-note-btn');
        const noteTextarea = noteDialog.querySelector('#note-content');
        const closeBtn = noteDialog.querySelector('#close-note-dialog');

        // Add error handling for missing elements
        if (!createNoteBtn || !noteTextarea || !closeBtn) {
            console.error('Required note dialog elements not found:', {
                createNoteBtn: !!createNoteBtn,
                noteTextarea: !!noteTextarea,
                closeBtn: !!closeBtn
            });
            return;
        }

        // Setup edit and delete buttons for existing notes
        this.setupNoteItemActions(noteDialog, contact);

        createNoteBtn.addEventListener('click', async () => {
            const noteContent = noteTextarea.value.trim();
            if (!noteContent) {
                this.showError('Please enter note content');
                return;
            }

            try {
                // Create the note activity
                const noteActivity = {
                    id: Date.now(), // Simple ID generation
                    type: 'Note',
                    content: noteContent,
                    timestamp: new Date(),
                    owner: 'John Doe',
                    timeAgo: 'Just now'
                };

                // Add the note to the activities timeline
                this.addNoteToActivities(noteActivity, contact);
                
                // Add the note to the dialog's previous notes list
                this.addNoteToDialog(noteActivity, noteDialog);
                
                // Clear the textarea
                noteTextarea.value = '';
                
                // Show success message
                this.showSuccess('Note created successfully!');
            } catch (error) {
                console.error('Failed to save note:', error);
                this.showError('Failed to save note');
            }
        });

        closeBtn.addEventListener('click', () => {
            noteDialog.remove();
        });

        // Close dialog when clicking outside
        noteDialog.addEventListener('click', (e) => {
            if (e.target === noteDialog) {
                noteDialog.remove();
            }
        });

        // Focus on the textarea
        if (noteTextarea) {
            noteTextarea.focus();
        }
    }

    addNoteToActivities(noteActivity, contact) {
        // Find the activities timeline
        const activitiesTimeline = document.querySelector('#activities .activity-timeline');
        if (!activitiesTimeline) {
            console.error('Activities timeline not found');
            return;
        }

        // Find or create the "Today" group
        let todayGroup = activitiesTimeline.querySelector('.timeline-group:first-child');
        if (!todayGroup || !todayGroup.querySelector('.timeline-date').textContent.includes('Today')) {
            // Create new "Today" group if it doesn't exist
            todayGroup = document.createElement('div');
            todayGroup.className = 'timeline-group';
            todayGroup.innerHTML = `
                <div class="timeline-date">Today</div>
            `;
            activitiesTimeline.insertBefore(todayGroup, activitiesTimeline.firstChild);
        }

        // Create the note activity HTML with click handler
        const noteActivityHTML = `
            <div class="activity-item note-activity" data-note-content="${noteActivity.content}" data-note-owner="${noteActivity.owner}" data-note-timestamp="${noteActivity.timestamp.toISOString()}">
                <div class="activity-icon note">
                    <i class="fas fa-sticky-note"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-type">Note</span>
                        <span class="activity-time">${noteActivity.timeAgo}</span>
                    </div>
                    <div class="activity-body">
                        <p>${noteActivity.content}</p>
                    </div>
                    <div class="activity-footer">
                        <span class="activity-owner">Created by ${noteActivity.owner}</span>
                    </div>
                </div>
            </div>
        `;

        // Insert the new note at the top of the "Today" group
        const todayDateElement = todayGroup.querySelector('.timeline-date');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = noteActivityHTML;
        const noteElement = tempDiv.firstElementChild;
        
        todayGroup.insertBefore(noteElement, todayDateElement.nextSibling);

        // Add click event listener to the note
        noteElement.addEventListener('click', () => {
            this.showEditableNoteDialog(noteActivity, contact, noteElement);
        });
    }

    setupNoteActivitiesListeners(contact) {
        // Find all note activity items in the timeline
        const noteActivities = document.querySelectorAll('.activity-item .activity-icon.note');
        
        noteActivities.forEach(noteIcon => {
            const activityItem = noteIcon.closest('.activity-item');
            if (activityItem) {
                // Add clickable styling
                activityItem.classList.add('note-activity');
                
                // Extract note data from the activity item
                const noteContent = activityItem.querySelector('.activity-body p')?.textContent || '';
                const activityOwner = activityItem.querySelector('.activity-owner')?.textContent || 'Unknown';
                const activityTime = activityItem.querySelector('.activity-time')?.textContent || '';
                
                // Create note activity object
                const noteActivity = {
                    id: activityItem.dataset.noteId || Date.now(), // Use existing ID if available
                    type: 'Note',
                    content: noteContent,
                    owner: activityOwner.replace('Created by ', '').replace('Sent by ', '').replace('Called by ', '').replace('Assigned to ', '').replace('Scheduled by ', ''),
                    timeAgo: activityTime,
                    timestamp: new Date() // For existing notes, we'll use current time as fallback
                };
                
                // Add click event listener
                activityItem.addEventListener('click', () => {
                    this.showEditableNoteDialog(noteActivity, contact, activityItem);
                });
            }
        });
    }

    showEditableNoteDialog(noteActivity, contact, noteElement) {
        const existingNotes = this.getExistingNotes(contact);
        const noteContent = `
            <div class="note-dialog">
                <div class="note-header">
                    <div class="note-title">
                        <h3>Notes</h3>
                        <span class="note-subtitle">For ${contact.firstName} ${contact.lastName}</span>
                    </div>
                    <div class="note-actions">
                        <button class="btn btn-icon" title="Close" id="close-editable-note-dialog">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="note-content">
                    <!-- Previous Notes Display -->
                    <div class="previous-notes">
                        <h4>Previous Notes</h4>
                        <div class="notes-list">
                            ${existingNotes.length > 0 ? existingNotes.map(note => `
                                <div class="note-item" data-note-id="${note.id}">
                                    <div class="note-item-header">
                                        <div class="note-item-info">
                                            <span class="note-owner">${note.owner}</span>
                                            <span class="note-timestamp">${this.formatDateTime(note.timestamp)}</span>
                                        </div>
                                        <div class="note-item-actions">
                                            <button class="btn btn-icon edit-note-btn" title="Edit" data-note-id="${note.id}">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-icon delete-note-btn" title="Delete" data-note-id="${note.id}">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="note-item-content">
                                        <p>${note.content}</p>
                                    </div>
                                </div>
                            `).join('') : '<div class="no-notes">No previous notes</div>'}
                        </div>
                    </div>
                    
                    <!-- New Note Section -->
                    <div class="new-note-section">
                        <h4>Add New Note</h4>
                        <div class="note-textarea-container">
                            <textarea
                                id="editable-note-content"
                                placeholder="Start typing to leave a note..."
                                rows="4"
                                class="note-textarea"
                            >${noteActivity.content}</textarea>
                        </div>
                        <div class="note-formatting">
                            <div class="formatting-buttons">
                                <button class="btn btn-icon" title="Bold">
                                    <i class="fas fa-bold"></i>
                                </button>
                                <button class="btn btn-icon" title="Italic">
                                    <i class="fas fa-italic"></i>
                                </button>
                                <button class="btn btn-icon" title="Underline">
                                    <i class="fas fa-underline"></i>
                                </button>
                                <button class="btn btn-icon" title="Strikethrough">
                                    <i class="fas fa-strikethrough"></i>
                                </button>
                                <div class="dropdown">
                                    <button class="btn btn-icon dropdown-toggle" title="More">
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="dropdown-menu">
                                        <a href="#" class="dropdown-item">
                                            <i class="fas fa-link"></i> Link
                                        </a>
                                        <a href="#" class="dropdown-item">
                                            <i class="fas fa-image"></i> Image
                                        </a>
                                        <a href="#" class="dropdown-item">
                                            <i class="fas fa-table"></i> Table
                                        </a>
                                        <a href="#" class="dropdown-item">
                                            <i class="fas fa-paperclip"></i> Attachment
                                        </a>
                                    </div>
                                </div>
                                <button class="btn btn-icon" title="Bullet List">
                                    <i class="fas fa-list-ul"></i>
                                </button>
                                <button class="btn btn-icon" title="Numbered List">
                                    <i class="fas fa-list-ol"></i>
                                </button>
                                <button class="btn btn-icon" title="Image">
                                    <i class="fas fa-image"></i>
                                </button>
                                <button class="btn btn-icon" title="Table">
                                    <i class="fas fa-table"></i>
                                </button>
                                <button class="btn btn-icon" title="Attachment">
                                    <i class="fas fa-paperclip"></i>
                                </button>
                            </div>
                        </div>
                        <div class="note-options">
                            <div class="checkbox-container">
                                <input type="checkbox" id="notify-team" checked>
                                <label for="notify-team">Notify team</label>
                            </div>
                            <div class="checkbox-container">
                                <input type="checkbox" id="add-to-timeline" checked>
                                <label for="add-to-timeline">Add to timeline</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="note-footer">
                    <div class="note-footer-content">
                        <div class="note-footer-left"></div>
                        <div class="note-footer-right">
                            <button class="btn btn-primary" id="save-editable-note-btn">
                                Save
                            </button>
                            <button class="btn btn-link" id="cancel-editable-note-btn">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Create the note dialog as an overlay
        const noteDialog = document.createElement('div');
        noteDialog.className = 'note-dialog-overlay';
        noteDialog.innerHTML = noteContent;
        document.body.appendChild(noteDialog);

        // Add event listeners
        const saveNoteBtn = noteDialog.querySelector('#save-editable-note-btn');
        const cancelNoteBtn = noteDialog.querySelector('#cancel-editable-note-btn');
        const closeBtn = noteDialog.querySelector('#close-editable-note-dialog');
        const noteTextarea = noteDialog.querySelector('#editable-note-content');

        // Add error handling for missing elements
        if (!saveNoteBtn || !noteTextarea || !cancelNoteBtn || !closeBtn) {
            console.error('Required editable note dialog elements not found');
            return;
        }

        // Setup note item actions (edit/delete for previous notes)
        this.setupNoteItemActions(noteDialog, contact);

        saveNoteBtn.addEventListener('click', async () => {
            const updatedContent = noteTextarea.value.trim();
            if (!updatedContent) {
                this.showError('Please enter note content');
                return;
            }

            try {
                // Update the note activity
                noteActivity.content = updatedContent;
                noteActivity.timestamp = new Date();
                noteActivity.timeAgo = 'Just now';

                // Update the note element in the timeline
                const noteBody = noteElement.querySelector('.activity-body p');
                const noteTime = noteElement.querySelector('.activity-time');
                if (noteBody) noteBody.textContent = updatedContent;
                if (noteTime) noteTime.textContent = 'Just now';

                // Show success message and close dialog
                this.showSuccess('Note updated successfully!');
                noteDialog.remove();
            } catch (error) {
                console.error('Failed to update note:', error);
                this.showError('Failed to update note');
            }
        });

        cancelNoteBtn.addEventListener('click', () => {
            noteDialog.remove();
        });

        closeBtn.addEventListener('click', () => {
            noteDialog.remove();
        });

        // Close dialog when clicking outside
        noteDialog.addEventListener('click', (e) => {
            if (e.target === noteDialog) {
                noteDialog.remove();
            }
        });

        // Focus on textarea
        if (noteTextarea) {
            noteTextarea.focus();
            noteTextarea.select();
        }
    }

    setupNoteItemActions(noteDialog, contact) {
        const editNoteBtns = noteDialog.querySelectorAll('.edit-note-btn');
        const deleteNoteBtns = noteDialog.querySelectorAll('.delete-note-btn');

        editNoteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const noteId = e.currentTarget.dataset.noteId;
                const noteItem = e.currentTarget.closest('.note-item');
                const noteContent = noteItem.querySelector('.note-item-content p').textContent;
                const noteOwner = noteItem.querySelector('.note-item-info .note-owner').textContent;
                const noteTimestamp = noteItem.querySelector('.note-item-info .note-timestamp').textContent;

                // Create edit dialog
                const editDialogContent = `
                    <div class="note-dialog">
                        <div class="note-header">
                            <div class="note-title">
                                <h3>Edit Note by ${noteOwner}</h3>
                            </div>
                            <div class="note-actions">
                                <span class="note-timestamp">${noteTimestamp}</span>
                            </div>
                        </div>
                        
                        <div class="note-content">
                            <div class="note-textarea-container">
                                <textarea 
                                    id="edit-note-content" 
                                    placeholder="Start typing to leave a note..." 
                                    rows="6"
                                    class="note-textarea"
                                >${noteContent}</textarea>
                            </div>
                            
                            <div class="note-formatting">
                                <div class="formatting-buttons">
                                    <button class="btn btn-icon" title="Bold">
                                        <i class="fas fa-bold"></i>
                                    </button>
                                    <button class="btn btn-icon" title="Italic">
                                        <i class="fas fa-italic"></i>
                                    </button>
                                    <button class="btn btn-icon" title="Underline">
                                        <i class="fas fa-underline"></i>
                                    </button>
                                    <button class="btn btn-icon" title="Strikethrough">
                                        <i class="fas fa-strikethrough"></i>
                                    </button>
                                    <div class="dropdown">
                                        <button class="btn btn-icon dropdown-toggle" title="More">
                                            <i class="fas fa-chevron-down"></i>
                                        </button>
                                        <div class="dropdown-menu">
                                            <a href="#" class="dropdown-item">
                                                <i class="fas fa-link"></i> Link
                                            </a>
                                            <a href="#" class="dropdown-item">
                                                <i class="fas fa-image"></i> Image
                                            </a>
                                            <a href="#" class="dropdown-item">
                                                <i class="fas fa-table"></i> Table
                                            </a>
                                            <a href="#" class="dropdown-item">
                                                <i class="fas fa-paperclip"></i> Attachment
                                            </a>
                                        </div>
                                    </div>
                                    <button class="btn btn-icon" title="Bullet List">
                                        <i class="fas fa-list-ul"></i>
                                    </button>
                                    <button class="btn btn-icon" title="Numbered List">
                                        <i class="fas fa-list-ol"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="note-footer">
                            <div class="note-footer-content">
                                <div class="note-footer-left">
                                    <button class="btn btn-primary" id="save-note-btn">
                                        Save
                                    </button>
                                    <button class="btn btn-link" id="cancel-edit-btn">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Create the edit dialog as an overlay
                const editDialog = document.createElement('div');
                editDialog.className = 'note-dialog-overlay';
                editDialog.innerHTML = editDialogContent;
                document.body.appendChild(editDialog);

                // Add event listeners for the edit dialog
                const saveBtn = editDialog.querySelector('#save-note-btn');
                const cancelBtn = editDialog.querySelector('#cancel-edit-btn');
                const editTextarea = editDialog.querySelector('#edit-note-content');

                saveBtn.addEventListener('click', async () => {
                    const updatedContent = editTextarea.value.trim();
                    if (!updatedContent) {
                        this.showError('Please enter note content');
                        return;
                    }

                    try {
                        // Update the note content in the original dialog
                        const originalNoteItem = noteDialog.querySelector(`.note-item[data-note-id="${noteId}"]`);
                        if (originalNoteItem) {
                            const noteBody = originalNoteItem.querySelector('.note-item-content p');
                            const noteTime = originalNoteItem.querySelector('.note-item-info .note-timestamp');
                            if (noteBody) noteBody.textContent = updatedContent;
                            if (noteTime) noteTime.textContent = 'Just now';
                        }

                        // Update the note in the activities timeline if it exists
                        const timelineNote = document.querySelector(`.activity-item[data-note-id="${noteId}"]`);
                        if (timelineNote) {
                            const timelineNoteBody = timelineNote.querySelector('.activity-body p');
                            const timelineNoteTime = timelineNote.querySelector('.activity-time');
                            if (timelineNoteBody) timelineNoteBody.textContent = updatedContent;
                            if (timelineNoteTime) timelineNoteTime.textContent = 'Just now';
                        }

                        editDialog.remove();
                        this.showSuccess('Note updated successfully!');
                    } catch (error) {
                        console.error('Failed to update note:', error);
                        this.showError('Failed to update note');
                    }
                });

                cancelBtn.addEventListener('click', () => {
                    editDialog.remove();
                });

                // Close edit dialog when clicking outside
                editDialog.addEventListener('click', (e) => {
                    if (e.target === editDialog) {
                        editDialog.remove();
                    }
                });

                // Focus on textarea
                if (editTextarea) {
                    editTextarea.focus();
                    editTextarea.select();
                }
            });
        });

        deleteNoteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const noteId = e.currentTarget.dataset.noteId;
                const noteItem = e.currentTarget.closest('.note-item');

                // Create confirmation dialog
                const confirmDialogContent = `
                    <div class="note-dialog" style="max-width: 400px;">
                        <div class="note-header">
                            <div class="note-title">
                                <h3>Confirm Delete</h3>
                            </div>
                            <div class="note-actions">
                                <button class="btn btn-icon" title="Close" id="close-confirm-dialog">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="note-content">
                            <p>Are you sure you want to delete this note?</p>
                            <p style="color: #6c757d; font-size: 0.875rem;">This action cannot be undone.</p>
                        </div>
                        
                        <div class="note-footer">
                            <div class="note-footer-content">
                                <div class="note-footer-left">
                                    <button class="btn btn-secondary" id="cancel-delete-btn">
                                        Cancel
                                    </button>
                                </div>
                                <div class="note-footer-right">
                                    <button class="btn btn-danger" id="confirm-delete-btn">
                                        Delete Note
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Create the confirmation dialog as an overlay
                const confirmDialog = document.createElement('div');
                confirmDialog.className = 'note-dialog-overlay';
                confirmDialog.innerHTML = confirmDialogContent;
                document.body.appendChild(confirmDialog);

                // Add event listeners for the confirmation dialog
                const cancelDeleteBtn = confirmDialog.querySelector('#cancel-delete-btn');
                const confirmDeleteBtn = confirmDialog.querySelector('#confirm-delete-btn');
                const closeConfirmBtn = confirmDialog.querySelector('#close-confirm-dialog');

                cancelDeleteBtn.addEventListener('click', () => {
                    confirmDialog.remove();
                });

                closeConfirmBtn.addEventListener('click', () => {
                    confirmDialog.remove();
                });

                confirmDeleteBtn.addEventListener('click', async () => {
                    try {
                        // Remove the note from the dialog's notes list
                        if (noteItem) {
                            noteItem.remove();
                        }

                        // Remove the note from the activities timeline if it exists
                        const timelineNote = document.querySelector(`.activity-item[data-note-id="${noteId}"]`);
                        if (timelineNote) {
                            timelineNote.remove();
                        }

                        confirmDialog.remove();
                        this.showSuccess('Note deleted successfully!');
                    } catch (error) {
                        console.error('Failed to delete note:', error);
                        this.showError('Failed to delete note');
                    }
                });

                // Close confirmation dialog when clicking outside
                confirmDialog.addEventListener('click', (e) => {
                    if (e.target === confirmDialog) {
                        confirmDialog.remove();
                    }
                });
            });
        });
    }

    getExistingNotes(contact) {
        // This is a placeholder. In a real app, you'd fetch notes from an API
        // For now, we'll simulate fetching some notes
        return [
            { id: '1', content: 'Initial contact. They seem interested in our premium package.', owner: 'John Doe', timestamp: new Date('2023-10-27T10:00:00') },
            { id: '2', content: 'Followed up with a proposal email. Waiting for response.', owner: 'Jane Smith', timestamp: new Date('2023-10-27T14:30:00') },
            { id: '3', content: 'Discussed pricing and next steps. They are considering the offer.', owner: 'John Doe', timestamp: new Date('2023-10-28T09:15:00') },
            { id: '4', content: 'They have not responded to the proposal. Need to follow up.', owner: 'Jane Smith', timestamp: new Date('2023-10-28T11:00:00') },
        ];
    }

    addNoteToDialog(noteActivity, noteDialog) {
        const notesList = noteDialog.querySelector('.notes-list');
        if (notesList) {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.dataset.noteId = noteActivity.id;
            noteItem.innerHTML = `
                <div class="note-item-header">
                    <div class="note-item-info">
                        <span class="note-owner">${noteActivity.owner}</span>
                        <span class="note-timestamp">${this.formatDateTime(noteActivity.timestamp)}</span>
                    </div>
                    <div class="note-item-actions">
                        <button class="btn btn-icon edit-note-btn" title="Edit" data-note-id="${noteActivity.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon delete-note-btn" title="Delete" data-note-id="${noteActivity.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-item-content">
                    <p>${noteActivity.content}</p>
                </div>
            `;
            notesList.appendChild(noteItem);
        }
    }

    getRecentActivitiesHTML() {
        // Sample activities data - in a real app, this would come from the database
        const recentActivities = [
            {
                type: 'Note',
                content: 'Followed up with the client regarding their requirements. They seem interested in our premium package.',
                time: '2 hours ago',
                owner: 'John Doe',
                icon: 'fas fa-sticky-note',
                iconClass: 'note'
            },
            {
                type: 'Email',
                content: 'Sent proposal email with pricing details and next steps.',
                time: '4 hours ago',
                owner: 'John Doe',
                icon: 'fas fa-envelope',
                iconClass: 'email'
            },
            {
                type: 'Call',
                content: 'Initial discovery call. Discussed their business needs and current challenges.',
                time: '1 day ago',
                owner: 'John Doe',
                icon: 'fas fa-phone',
                iconClass: 'call'
            },
            {
                type: 'Task',
                content: 'Prepare proposal document with custom pricing',
                time: '1 day ago',
                owner: 'John Doe',
                icon: 'fas fa-tasks',
                iconClass: 'task'
            },
            {
                type: 'Meeting',
                content: 'Product demo meeting with technical team',
                time: '3 days ago',
                owner: 'John Doe',
                icon: 'fas fa-calendar',
                iconClass: 'meeting'
            }
        ];

        if (recentActivities.length === 0) {
            return `
                <div class="no-activities">
                    <i class="fas fa-search"></i>
                    <p>No activities</p>
                </div>
            `;
        }

        const activitiesHTML = recentActivities.map(activity => `
            <div class="recent-activity-item">
                <div class="activity-icon ${activity.iconClass}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-type">${activity.type}</span>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                    <div class="activity-body">
                        <p>${activity.content}</p>
                    </div>
                    <div class="activity-footer">
                        <span class="activity-owner">${activity.type === 'Note' ? 'Created by' : activity.type === 'Email' ? 'Sent by' : activity.type === 'Call' ? 'Called by' : activity.type === 'Task' ? 'Assigned to' : 'Scheduled by'} ${activity.owner}</span>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <div class="recent-activities-list">
                ${activitiesHTML}
            </div>
        `;
    }
}

// Create global contacts instance
window.contacts = new Contacts();