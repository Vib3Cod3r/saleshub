'use client';

import { useState } from 'react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Mail,
  Phone,
  Building,
  User,
  ChevronDown,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  leadStatus: string;
  leadSource?: string;
  lastContactDate?: string;
  assignedTo?: string;
  avatar: string;
}

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with real API calls
  const contacts: Contact[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc.',
      jobTitle: 'CTO',
      leadStatus: 'qualified',
      leadSource: 'Website',
      lastContactDate: '2024-01-15',
      assignedTo: 'Alex Thompson',
      avatar: 'JS'
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@innovationlabs.com',
      phone: '+1 (555) 234-5678',
      company: 'Innovation Labs',
      jobTitle: 'VP of Engineering',
      leadStatus: 'proposal',
      leadSource: 'Referral',
      lastContactDate: '2024-01-12',
      assignedTo: 'Maria Garcia',
      avatar: 'SJ'
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Davis',
      email: 'mike.davis@startupxyz.com',
      phone: '+1 (555) 345-6789',
      company: 'StartupXYZ',
      jobTitle: 'Founder',
      leadStatus: 'negotiation',
      leadSource: 'LinkedIn',
      lastContactDate: '2024-01-10',
      assignedTo: 'David Chen',
      avatar: 'MD'
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Wilson',
      email: 'emily.wilson@enterprisesolutions.com',
      phone: '+1 (555) 456-7890',
      company: 'Enterprise Solutions',
      jobTitle: 'Director of IT',
      leadStatus: 'closed-won',
      leadSource: 'Trade Show',
      lastContactDate: '2024-01-08',
      assignedTo: 'Alex Thompson',
      avatar: 'EW'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Contacts', count: contacts.length },
    { id: 'leads', label: 'Leads', count: contacts.filter(c => c.leadStatus === 'new').length },
    { id: 'qualified', label: 'Qualified', count: contacts.filter(c => c.leadStatus === 'qualified').length },
    { id: 'proposal', label: 'Proposal', count: contacts.filter(c => c.leadStatus === 'proposal').length },
    { id: 'negotiation', label: 'Negotiation', count: contacts.filter(c => c.leadStatus === 'negotiation').length },
    { id: 'closed', label: 'Closed', count: contacts.filter(c => c.leadStatus === 'closed-won' || c.leadStatus === 'closed-lost').length }
  ];

  const leadStatuses = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'qualified', label: 'Qualified', color: 'bg-green-100 text-green-800' },
    { value: 'proposal', label: 'Proposal', color: 'bg-purple-100 text-purple-800' },
    { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
    { value: 'closed-won', label: 'Closed Won', color: 'bg-green-100 text-green-800' },
    { value: 'closed-lost', label: 'Closed Lost', color: 'bg-red-100 text-red-800' }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = leadStatuses.find(s => s.value === status);
    return statusConfig ? (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status}
      </span>
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(contacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = selectedTab === 'all' || contact.leadStatus === selectedTab;
    
    return matchesSearch && matchesTab;
  });

  return (
    <AuthenticatedLayout>
      <div className="contacts-page">
        {/* Contacts Header */}
        <div className="contacts-header">
          <div className="contacts-header-left">
            <div className="contacts-title">
              <h1>Contacts</h1>
              <User className="h-6 w-6" />
            </div>
            <div className="contacts-count">
              {filteredContacts.length} contacts
            </div>
          </div>

          <div className="contacts-header-center">
            <div className="contacts-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${selectedTab === tab.id ? 'active' : ''}`}
                  onClick={() => setSelectedTab(tab.id)}
                >
                  {tab.label}
                  <span className="tab-count">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="contacts-header-right">
            <button className="btn btn-secondary">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button className="btn btn-primary">
              <Plus className="h-4 w-4" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Contacts Filters */}
        <div className="contacts-filters">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-row">
            <div className="filter-dropdown">
              <button className="filter-btn">
                Lead Status
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="filter-dropdown">
              <button className="filter-btn">
                Lead Source
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="filter-dropdown">
              <button className="filter-btn">
                Assigned To
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="contacts-table-container">
          <div className="table-actions">
            <div className="table-actions-left">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedContacts.length === contacts.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span className="checkmark"></span>
                Select All
              </label>
            </div>
            <div className="table-actions-right">
              {selectedContacts.length > 0 && (
                <button className="btn btn-secondary">
                  Bulk Actions
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="contacts-table-wrapper">
            <table className="contacts-table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input type="checkbox" />
                  </th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Lead Status</th>
                  <th>Lead Source</th>
                  <th>Assigned To</th>
                  <th>Last Contact</th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="contact-row-clickable">
                    <td className="checkbox-column">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </td>
                    <td className="name-column">
                      <div className="contact-name-cell">
                        <div className="contact-avatar">
                          <span>{contact.avatar}</span>
                        </div>
                        <div className="contact-name-info">
                          <div className="contact-name">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="contact-email-small">
                            {contact.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="company-column">
                      {contact.company && (
                        <div className="company-info">
                          <Building className="company-icon" />
                          <span>{contact.company}</span>
                        </div>
                      )}
                    </td>
                    <td className="email-column">
                      <div className="contact-email">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </div>
                    </td>
                    <td className="phone-column">
                      {contact.phone && (
                        <div className="contact-phone">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                        </div>
                      )}
                    </td>
                    <td className="status-column">
                      {getStatusBadge(contact.leadStatus)}
                    </td>
                    <td className="source-column">
                      {contact.leadSource}
                    </td>
                    <td className="owner-column">
                      {contact.assignedTo}
                    </td>
                    <td className="date-column">
                      {contact.lastContactDate && new Date(contact.lastContactDate).toLocaleDateString()}
                    </td>
                    <td className="actions-column">
                      <div className="action-buttons">
                        <button className="action-btn" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="action-btn" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="action-btn" title="More">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="contacts-pagination">
            <div className="pagination-info">
              Showing 1-{filteredContacts.length} of {contacts.length} contacts
            </div>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled>
                Previous
              </button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">3</button>
              <button className="pagination-btn">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
} 