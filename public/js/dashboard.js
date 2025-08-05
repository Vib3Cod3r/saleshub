// Dashboard Controller
class Dashboard {
    constructor() {
        this.revenueChart = null;
        this.refreshInterval = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            if (!this.isInitialized) {
                this.setupEventListeners();
                this.isInitialized = true;
            }

            await this.loadDashboardData();
            this.setupAutoRefresh();
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    setupEventListeners() {
        // Add any dashboard-specific event listeners here
        const dateRange = document.getElementById('date-range');
        if (dateRange) {
            dateRange.addEventListener('click', () => {
                this.showDateRangePicker();
            });
        }
    }

    async loadDashboardData() {
        try {
            // Load all dashboard data in parallel
            const [
                overview,
                revenueData,
                recentSales,
                pipelineMetrics
            ] = await Promise.all([
                api.getDashboardOverview(),
                api.getRevenueChart(),
                api.getRecentSales(),
                api.getPipelineMetrics()
            ]);

            // Update metrics cards
            this.updateMetricsCards(overview);

            // Update revenue chart
            this.updateRevenueChart(revenueData);

            // Update recent sales list
            this.updateRecentSales(recentSales);

            // Update date range display
            this.updateDateRange(overview.period);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            throw error;
        }
    }

    updateMetricsCards(data) {
        // Monthly Revenue
        this.updateMetricCard('monthly-revenue', this.formatCurrency(data.monthlyRevenue));
        this.updateMetricChange('revenue-change', data.changes.revenue, 'from last month');

        // New Deals Closed
        this.updateMetricCard('new-deals', data.newDealsThisPeriod);
        this.updateMetricChange('deals-change', data.changes.newDeals, 'from last month');

        // Pipeline Value
        this.updateMetricCard('pipeline-value', this.formatCurrency(data.totalPipelineValue));
        this.updateMetricChange('pipeline-change', data.changes.revenue, 'total pipeline');

        // Conversion Rate
        this.updateMetricCard('conversion-rate', `${data.conversionRate}%`);
        this.updateMetricChange('conversion-change', data.changes.closedDeals, 'lead to close');
    }

    updateMetricCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Add animation effect
            element.style.opacity = '0.5';
            setTimeout(() => {
                element.textContent = value;
                element.style.opacity = '1';
            }, 150);
        }
    }

    updateMetricChange(elementId, change, suffix) {
        const element = document.getElementById(elementId);
        if (element) {
            const isPositive = parseFloat(change) >= 0;
            const icon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
            const sign = isPositive ? '+' : '';
            
            element.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
            element.innerHTML = `
                <i class="fas ${icon}"></i>
                ${sign}${change}% ${suffix}
            `;
        }
    }

    updateRevenueChart(data) {
        const ctx = document.getElementById('revenue-chart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.revenueChart) {
            this.revenueChart.destroy();
        }

        const months = data.map(item => item.month);
        const revenues = data.map(item => item.revenue);
        const deals = data.map(item => item.deals);

        this.revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue',
                    data: revenues,
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const revenue = this.formatCurrency(context.parsed.y);
                                const dealCount = deals[context.dataIndex];
                                return [
                                    `Revenue: ${revenue}`,
                                    `Deals: ${dealCount}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    },
                    y: {
                        border: {
                            display: false
                        },
                        grid: {
                            color: '#f1f5f9'
                        },
                        ticks: {
                            color: '#64748b',
                            callback: (value) => this.formatCurrency(value, true)
                        }
                    }
                },
                elements: {
                    bar: {
                        borderRadius: 4
                    }
                }
            }
        });
    }

    updateRecentSales(sales) {
        const container = document.getElementById('recent-sales-list');
        if (!container) return;

        if (sales.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted p-4">
                    <i class="fas fa-chart-line fa-2x mb-2"></i>
                    <p>No recent sales to display</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sales.map(sale => {
            const initials = `${sale.contact.firstName.charAt(0)}${sale.contact.lastName.charAt(0)}`.toUpperCase();
            const fullName = `${sale.contact.firstName} ${sale.contact.lastName}`;
            const company = sale.contact.company || 'No Company';
            const amount = this.formatCurrency(sale.value);
            const assignedTo = sale.assignedTo ? `${sale.assignedTo.firstName} ${sale.assignedTo.lastName}` : 'Unassigned';

            return `
                <div class="sales-item" data-deal-id="${sale.id}">
                    <div class="sales-avatar">${initials}</div>
                    <div class="sales-info">
                        <div class="sales-name">${fullName}</div>
                        <div class="sales-company">${company}</div>
                    </div>
                    <div class="sales-amount">+${amount}</div>
                </div>
            `;
        }).join('');

        // Add click handlers for sales items
        container.querySelectorAll('.sales-item').forEach(item => {
            item.addEventListener('click', () => {
                const dealId = item.dataset.dealId;
                this.openDealDetails(dealId);
            });
        });
    }

    updateDateRange(period) {
        const element = document.getElementById('date-range');
        if (element && period) {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period.days);

            const options = { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            };

            const startFormatted = startDate.toLocaleDateString('en-US', options);
            const endFormatted = endDate.toLocaleDateString('en-US', options);

            element.textContent = `${startFormatted} - ${endFormatted}`;
        }
    }

    setupAutoRefresh() {
        // Clear existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Refresh dashboard every 5 minutes
        this.refreshInterval = setInterval(() => {
            if (document.getElementById('dashboard-page').classList.contains('active')) {
                this.loadDashboardData();
            }
        }, 5 * 60 * 1000);
    }

    async openDealDetails(dealId) {
        try {
            // Navigate to deals page and show deal details
            if (window.app) {
                await window.app.navigateToPage('deals');
                if (window.deals) {
                    window.deals.showDealDetails(dealId);
                }
            }
        } catch (error) {
            console.error('Failed to open deal details:', error);
        }
    }

    showDateRangePicker() {
        // Implement date range picker functionality
        console.log('Date range picker would open here');
    }

    formatCurrency(amount, abbreviated = false) {
        if (amount === null || amount === undefined) return '$0';
        
        const num = parseFloat(amount);
        
        if (abbreviated && num >= 1000) {
            if (num >= 1000000) {
                return `$${(num / 1000000).toFixed(1)}M`;
            } else {
                return `$${(num / 1000).toFixed(1)}K`;
            }
        }
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    }

    showError(message) {
        if (window.app) {
            window.app.showError(message);
        }
    }

    destroy() {
        if (this.revenueChart) {
            this.revenueChart.destroy();
            this.revenueChart = null;
        }

        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }

        this.isInitialized = false;
    }
}

// Create global dashboard instance
window.dashboard = new Dashboard();