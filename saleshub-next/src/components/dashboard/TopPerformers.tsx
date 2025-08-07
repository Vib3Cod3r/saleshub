'use client';

const topPerformers = [
  {
    id: 1,
    name: 'John Smith',
    role: 'Sales Manager',
    deals: 15,
    revenue: '$125,000',
    avatar: 'JS'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Sales Rep',
    deals: 12,
    revenue: '$98,500',
    avatar: 'SJ'
  },
  {
    id: 3,
    name: 'Mike Davis',
    role: 'Sales Rep',
    deals: 10,
    revenue: '$87,200',
    avatar: 'MD'
  },
  {
    id: 4,
    name: 'Lisa Wilson',
    role: 'Sales Rep',
    deals: 8,
    revenue: '$76,400',
    avatar: 'LW'
  }
];

export function TopPerformers() {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Top Performers</h3>
        <p>Best performing sales team members</p>
      </div>
      <div className="card-content">
        <div className="performers-list">
          {topPerformers.map((performer, index) => (
            <div key={performer.id} className="performer-item">
              <div className="performer-rank">#{index + 1}</div>
              <div className="performer-avatar">
                <span>{performer.avatar}</span>
              </div>
              <div className="performer-info">
                <div className="performer-name">{performer.name}</div>
                <div className="performer-role">{performer.role}</div>
              </div>
              <div className="performer-stats">
                <div className="performer-deals">{performer.deals} deals</div>
                <div className="performer-revenue">{performer.revenue}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 