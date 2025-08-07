'use client';

import { DollarSign, TrendingUp, Funnel, Percent } from 'lucide-react';

const metrics = [
  {
    label: 'Monthly Revenue',
    value: '$48,500',
    change: '+12.5% from last month',
    changeType: 'positive',
    icon: DollarSign,
    color: 'blue'
  },
  {
    label: 'New Deals Closed',
    value: '12',
    change: '+3 from last month',
    changeType: 'positive',
    icon: TrendingUp,
    color: 'green'
  },
  {
    label: 'Pipeline Value',
    value: '$320,000',
    change: '+8.2% total pipeline',
    changeType: 'positive',
    icon: Funnel,
    color: 'purple'
  },
  {
    label: 'Conversion Rate',
    value: '18.4%',
    change: '+2.1% lead to close',
    changeType: 'positive',
    icon: Percent,
    color: 'orange'
  }
];

export function DashboardMetrics() {
  return (
    <div className="metrics-grid">
      {metrics.map((metric, index) => (
        <div key={index} className="metric-card">
          <div className={`metric-icon metric-icon-${metric.color}`}>
            <metric.icon className="metric-icon-svg" />
          </div>
          <div className="metric-content">
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
            <div className={`metric-change ${metric.changeType}`}>
              <TrendingUp className="metric-change-icon" />
              {metric.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 