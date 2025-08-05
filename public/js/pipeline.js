// Sales Pipeline Management
class Pipeline {
    constructor() {
        this.pipeline = {};
        this.isInitialized = false;
        this.sortableInstances = [];
    }

    async initialize() {
        try {
            if (!this.isInitialized) {
                this.setupEventListeners();
                this.isInitialized = true;
            }

            await this.loadPipeline();
        } catch (error) {
            console.error('Pipeline initialization failed:', error);
            this.showError('Failed to load pipeline');
        }
    }

    setupEventListeners() {
        // Add any pipeline-specific event listeners here
    }

    async loadPipeline() {
        try {
            this.pipeline = await api.getPipeline();
            this.renderPipeline();
        } catch (error) {
            console.error('Failed to load pipeline:', error);
            throw error;
        }
    }

    renderPipeline() {
        const container = document.getElementById('pipeline-board');
        if (!container) return;

        const stages = [
            'NEW_LEAD',
            'QUALIFIED',
            'CONTACTED',
            'MEETING_DEMO_SET',
            'PROPOSAL_NEGOTIATION',
            'DECISION_MAKER_BOUGHT_IN',
            'CONTRACT_SENT'
        ];

        const stageLabels = {
            'NEW_LEAD': 'New Lead',
            'QUALIFIED': 'Qualified',
            'CONTACTED': 'Contacted',
            'MEETING_DEMO_SET': 'Meeting/Demo Set',
            'PROPOSAL_NEGOTIATION': 'Proposal/Negotiation',
            'DECISION_MAKER_BOUGHT_IN': 'Decision Maker Bought In',
            'CONTRACT_SENT': 'Contract Sent'
        };

        container.innerHTML = stages.map(stage => {
            const stageData = this.pipeline[stage] || { deals: [], count: 0, totalValue: 0 };
            const deals = stageData.deals || [];

            return `
                <div class="pipeline-column" data-stage="${stage}">
                    <div class="pipeline-header">
                        <div class="pipeline-title">${stageLabels[stage]}</div>
                        <div class="pipeline-count">${deals.length}</div>
                    </div>
                    <div class="pipeline-meta">
                        <div class="pipeline-value">${Utils.formatCurrency(stageData.totalValue)}</div>
                    </div>
                    <div class="pipeline-deals" id="stage-${stage}">
                        ${deals.map(deal => this.renderDealCard(deal)).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Initialize drag and drop
        this.initializeDragAndDrop();
    }

    renderDealCard(deal) {
        const contactName = Utils.formatName(deal.contact.firstName, deal.contact.lastName);
        const company = deal.contact.company || 'No Company';
        const value = deal.value ? Utils.formatCurrency(deal.value) : 'No Value';
        const assignedTo = deal.assignedTo ? Utils.formatName(deal.assignedTo.firstName, deal.assignedTo.lastName) : 'Unassigned';

        return `
            <div class="deal-card" data-deal-id="${deal.id}" draggable="true">
                <div class="deal-title">${deal.title}</div>
                <div class="deal-company">${contactName} - ${company}</div>
                <div class="deal-value">${value}</div>
                <div class="deal-meta">
                    <span class="deal-probability">${deal.probability || 0}%</span>
                    <span class="deal-assigned">${assignedTo}</span>
                </div>
                ${deal.expectedCloseDate ? `
                    <div class="deal-due">Due: ${Utils.formatDate(deal.expectedCloseDate)}</div>
                ` : ''}
            </div>
        `;
    }

    initializeDragAndDrop() {
        // Destroy existing sortable instances
        this.sortableInstances.forEach(instance => {
            if (instance.destroy) {
                instance.destroy();
            }
        });
        this.sortableInstances = [];

        // Initialize Sortable for each pipeline column
        const columns = document.querySelectorAll('.pipeline-deals');
        columns.forEach(column => {
            const sortable = new Sortable(column, {
                group: 'pipeline',
                animation: 150,
                ghostClass: 'deal-card-ghost',
                chosenClass: 'deal-card-chosen',
                dragClass: 'deal-card-drag',
                onEnd: (evt) => {
                    this.handleDealMove(evt);
                }
            });
            this.sortableInstances.push(sortable);
        });

        // Add click handlers for deal cards
        document.querySelectorAll('.deal-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                const dealId = card.dataset.dealId;
                this.viewDealDetails(dealId);
            });
        });
    }

    async handleDealMove(evt) {
        const dealId = evt.item.dataset.dealId;
        const newStage = evt.to.id.replace('stage-', '');
        const oldStage = evt.from.id.replace('stage-', '');

        if (newStage === oldStage) return;

        try {
            await api.updateDealStage(dealId, newStage);
            this.showSuccess(`Deal moved to ${Utils.formatStatus(newStage)}`);
            
            // Reload pipeline to update counts and values
            await this.loadPipeline();
        } catch (error) {
            console.error('Failed to update deal stage:', error);
            this.showError('Failed to move deal');
            
            // Revert the move
            evt.from.appendChild(evt.item);
        }
    }

    async viewDealDetails(dealId) {
        try {
            // Use the deals module to show deal details
            if (window.deals) {
                await window.deals.viewDeal(dealId);
            }
        } catch (error) {
            console.error('Failed to view deal details:', error);
            this.showError('Failed to load deal details');
        }
    }

    showSuccess(message) {
        if (window.app) window.app.showSuccess(message);
    }

    showError(message) {
        if (window.app) window.app.showError(message);
    }
}

// Create global pipeline instance
window.pipeline = new Pipeline();