'use client';

import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Percent,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function DashboardPage() {
  // Mock data - replace with real API calls
  const metrics = [
    {
      label: 'Monthly Revenue',
      value: '$48,500',
      change: '+12.5%',
      changeType: 'positive',
      changeText: 'from last month',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      label: 'New Deals Closed',
      value: '12',
      change: '+3',
      changeType: 'positive',
      changeText: 'from last month',
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      label: 'Pipeline Value',
      value: '$320,000',
      change: '+8.2%',
      changeType: 'positive',
      changeText: 'total pipeline',
      icon: BarChart3,
      color: 'bg-purple-500'
    },
    {
      label: 'Conversion Rate',
      value: '18.4%',
      change: '+2.1%',
      changeType: 'positive',
      changeText: 'lead to close',
      icon: Percent,
      color: 'bg-orange-500'
    }
  ];

  const recentSales = [
    {
      id: 1,
      name: 'John Smith',
      company: 'TechCorp Inc.',
      amount: '$25,000',
      date: '2 hours ago',
      avatar: 'JS'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      company: 'Innovation Labs',
      amount: '$18,500',
      date: '4 hours ago',
      avatar: 'SJ'
    },
    {
      id: 3,
      name: 'Mike Davis',
      company: 'StartupXYZ',
      amount: '$32,000',
      date: '1 day ago',
      avatar: 'MD'
    },
    {
      id: 4,
      name: 'Emily Wilson',
      company: 'Enterprise Solutions',
      amount: '$45,000',
      date: '2 days ago',
      avatar: 'EW'
    }
  ];

  const topPerformers = [
    {
      name: 'Alex Thompson',
      deals: 8,
      revenue: '$156,000',
      avatar: 'AT'
    },
    {
      name: 'Maria Garcia',
      deals: 6,
      revenue: '$142,000',
      avatar: 'MG'
    },
    {
      name: 'David Chen',
      deals: 5,
      revenue: '$98,000',
      avatar: 'DC'
    }
  ];

  return (
    <AuthenticatedLayout>
      <div className="dashboard-page">
        {/* Metrics Grid */}
        <div className="metrics-grid">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="metric-card">
                <div className="metric-icon">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="metric-content">
                  <div className="metric-label">{metric.label}</div>
                  <div className="metric-value">{metric.value}</div>
                  <div className={`metric-change ${metric.changeType}`}>
                    {metric.changeType === 'positive' ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {metric.change} {metric.changeText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Revenue Chart */}
          <div className="chart-container">
            <div className="card">
              <div className="card-header">
                <h3>Revenue Overview</h3>
                <p>Monthly revenue and deals closed over time</p>
              </div>
              <div className="card-content">
                <div className="chart-placeholder">
                  <div className="chart-message">
                    <TrendingUp className="h-12 w-12 text-gray-400" />
                    <p>Revenue chart will be implemented with Chart.js</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="recent-sales">
            <div className="card">
              <div className="card-header">
                <h3>Recent Sales</h3>
                <p>Latest deals closed by your team</p>
              </div>
              <div className="card-content">
                <div className="sales-list">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="sales-item">
                      <div className="sales-avatar">
                        <span>{sale.avatar}</span>
                      </div>
                      <div className="sales-info">
                        <div className="sales-name">{sale.name}</div>
                        <div className="sales-company">{sale.company}</div>
                      </div>
                      <div className="sales-amount">{sale.amount}</div>
                      <div className="sales-date">{sale.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="top-performers">
            <div className="card">
              <div className="card-header">
                <h3>Top Performers</h3>
                <p>Best performing sales representatives</p>
              </div>
              <div className="card-content">
                <div className="performers-list">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.name} className="performer-item">
                      <div className="performer-rank">#{index + 1}</div>
                      <div className="performer-avatar">
                        <span>{performer.avatar}</span>
                      </div>
                      <div className="performer-info">
                        <div className="performer-name">{performer.name}</div>
                        <div className="performer-stats">
                          {performer.deals} deals • {performer.revenue}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Overview */}
          <div className="pipeline-overview">
            <div className="card">
              <div className="card-header">
                <h3>Pipeline Overview</h3>
                <p>Deals by stage and value</p>
              </div>
              <div className="card-content">
                <div className="pipeline-stages">
                  <div className="pipeline-stage">
                    <div className="stage-header">
                      <h4>Prospecting</h4>
                      <span className="stage-count">24 deals</span>
                    </div>
                    <div className="stage-value">$180,000</div>
                  </div>
                  <div className="pipeline-stage">
                    <div className="stage-header">
                      <h4>Qualified</h4>
                      <span className="stage-count">18 deals</span>
                    </div>
                    <div className="stage-value">$320,000</div>
                  </div>
                  <div className="pipeline-stage">
                    <div className="stage-header">
                      <h4>Proposal</h4>
                      <span className="stage-count">12 deals</span>
                    </div>
                    <div className="stage-value">$450,000</div>
                  </div>
                  <div className="pipeline-stage">
                    <div className="stage-header">
                      <h4>Negotiation</h4>
                      <span className="stage-count">8 deals</span>
                    </div>
                    <div className="stage-value">$280,000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
