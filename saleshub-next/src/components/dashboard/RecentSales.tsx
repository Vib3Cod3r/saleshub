'use client';

const recentSales = [
  {
    id: 1,
    name: 'John Smith',
    company: 'TechCorp Solutions',
    amount: '$12,500',
    date: '2 hours ago',
    status: 'closed'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    company: 'Global Manufacturing',
    amount: '$8,200',
    date: '4 hours ago',
    status: 'closed'
  },
  {
    id: 3,
    name: 'Mike Davis',
    company: 'StartupXYZ',
    amount: '$15,800',
    date: '1 day ago',
    status: 'closed'
  },
  {
    id: 4,
    name: 'Lisa Wilson',
    company: 'Innovation Labs',
    amount: '$6,400',
    date: '2 days ago',
    status: 'closed'
  }
];

export function RecentSales() {
  return (
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
                <span>{sale.name.split(' ').map(n => n[0]).join('')}</span>
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
  );
} 