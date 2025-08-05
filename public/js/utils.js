// Utility Functions
const Utils = {
    // Date formatting utilities
    formatDate(date, options = {}) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
    },

    formatDateTime(date) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatRelativeTime(date) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diffMs = now - dateObj;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 7) {
            return this.formatDate(dateObj);
        } else if (diffDays > 0) {
            return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
        } else {
            return 'Just now';
        }
    },

    // Currency formatting
    formatCurrency(amount, options = {}) {
        if (amount === null || amount === undefined) return '$0';
        
        const defaultOptions = {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        };
        
        return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(amount);
    },

    // String utilities
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    formatName(firstName, lastName) {
        const first = firstName ? firstName.trim() : '';
        const last = lastName ? lastName.trim() : '';
        return [first, last].filter(Boolean).join(' ');
    },

    getInitials(firstName, lastName) {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return first + last;
    },

    truncateText(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // Status and priority formatting
    formatStatus(status) {
        if (!status) return '';
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    },

    getStatusBadgeClass(status) {
        const statusMap = {
            'NEW': 'new',
            'NEW_LEAD': 'new',
            'QUALIFIED': 'qualified',
            'CONTACTED': 'contacted',
            'INTERESTED': 'qualified',
            'MEETING_DEMO_SET': 'contacted',
            'PROPOSAL_NEGOTIATION': 'contacted',
            'DECISION_MAKER_BOUGHT_IN': 'qualified',
            'CONTRACT_SENT': 'qualified',
            'CLOSED_WON': 'closed-won',
            'CLOSED_LOST': 'closed-lost',
            'CONVERTED': 'closed-won',
            'NOT_INTERESTED': 'closed-lost',
            'DEAD': 'closed-lost',
            'COMPLETED': 'closed-won',
            'PENDING': 'new',
            'IN_PROGRESS': 'contacted',
            'CANCELLED': 'closed-lost'
        };
        
        return statusMap[status] || 'new';
    },

    getPriorityColor(priority) {
        const priorityMap = {
            'LOW': '#64748b',
            'MEDIUM': '#f59e0b',
            'HIGH': '#ef4444',
            'URGENT': '#dc2626'
        };
        
        return priorityMap[priority] || '#64748b';
    },

    // Form utilities
    serializeForm(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validatePhone(phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    },

    // DOM utilities
    createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        if (options.className) element.className = options.className;
        if (options.innerHTML) element.innerHTML = options.innerHTML;
        if (options.textContent) element.textContent = options.textContent;
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }
        
        return element;
    },

    // Modal utilities
    createModal(title, content, options = {}) {
        const modal = this.createElement('div', {
            className: 'modal',
            innerHTML: `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button type="button" class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
                </div>
            `
        });

        // Add to modals container
        const container = document.getElementById('modals-container');
        if (container) {
            container.appendChild(modal);
        } else {
            document.body.appendChild(modal);
        }

        // Add close functionality
        const closeBtn = modal.querySelector('.modal-close');
        const closeModal = () => {
            modal.remove();
            if (options.onClose) options.onClose();
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // ESC key to close
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        return modal;
    },

    // Table utilities
    createTable(data, columns, options = {}) {
        const table = this.createElement('table', { className: 'table' });
        
        // Create header
        const thead = this.createElement('thead');
        const headerRow = this.createElement('tr');
        
        columns.forEach(column => {
            const th = this.createElement('th', {
                textContent: column.label || column.key,
                attributes: column.sortable ? { 'data-sortable': 'true' } : {}
            });
            
            if (column.sortable) {
                th.style.cursor = 'pointer';
                th.addEventListener('click', () => {
                    if (options.onSort) options.onSort(column.key);
                });
            }
            
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create body
        const tbody = this.createElement('tbody');
        
        data.forEach((row, index) => {
            const tr = this.createElement('tr');
            
            columns.forEach(column => {
                const td = this.createElement('td');
                
                if (column.render) {
                    td.innerHTML = column.render(row[column.key], row, index);
                } else {
                    td.textContent = row[column.key] || '';
                }
                
                tr.appendChild(td);
            });
            
            if (options.onRowClick) {
                tr.style.cursor = 'pointer';
                tr.addEventListener('click', () => options.onRowClick(row, index));
            }
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        return table;
    },

    // Loading utilities
    showLoading(element) {
        if (element) {
            element.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Loading...</span>
                </div>
            `;
        }
    },

    hideLoading(element, originalContent = '') {
        if (element) {
            element.innerHTML = originalContent;
        }
    },

    // Pagination utilities
    createPagination(currentPage, totalPages, onPageChange) {
        const pagination = this.createElement('div', { className: 'pagination' });
        
        // Previous button
        const prevBtn = this.createElement('button', {
            className: `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`,
            innerHTML: '<i class="fas fa-chevron-left"></i>',
            events: {
                click: () => {
                    if (currentPage > 1) onPageChange(currentPage - 1);
                }
            }
        });
        pagination.appendChild(prevBtn);
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = this.createElement('button', {
                className: `pagination-btn ${i === currentPage ? 'active' : ''}`,
                textContent: i,
                events: {
                    click: () => onPageChange(i)
                }
            });
            pagination.appendChild(pageBtn);
        }
        
        // Next button
        const nextBtn = this.createElement('button', {
            className: `pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`,
            innerHTML: '<i class="fas fa-chevron-right"></i>',
            events: {
                click: () => {
                    if (currentPage < totalPages) onPageChange(currentPage + 1);
                }
            }
        });
        pagination.appendChild(nextBtn);
        
        return pagination;
    },

    // Debounce utility
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle utility
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Local storage utilities
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },

    getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },

    removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
        }
    }
};

// Make utils globally available
window.Utils = Utils;