import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchResultCard } from '../../components/results/SearchResultCard';

describe('SearchResultCard', () => {
  const mockContact = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0123',
    company: 'Acme Corp',
    title: 'Software Engineer',
    status: 'active',
    entityType: 'Contact',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockCompany = {
    id: '2',
    name: 'Acme Corporation',
    industry: 'Technology',
    website: 'https://acme.com',
    employees: 500,
    revenue: 1000000,
    status: 'active',
    entityType: 'Company',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockDeal = {
    id: '3',
    name: 'Enterprise Deal',
    value: 50000,
    stage: 'negotiation',
    probability: 0.75,
    closeDate: '2024-03-01T00:00:00Z',
    status: 'active',
    entityType: 'Deal',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render contact card correctly', () => {
      render(<SearchResultCard item={mockContact} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should render company card correctly', () => {
      render(<SearchResultCard item={mockCompany} />);
      
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('https://acme.com')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
    });

    it('should render deal card correctly', () => {
      render(<SearchResultCard item={mockDeal} />);
      
      expect(screen.getByText('Enterprise Deal')).toBeInTheDocument();
      expect(screen.getByText('$50,000')).toBeInTheDocument();
      expect(screen.getByText('negotiation')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Mar 1, 2024')).toBeInTheDocument();
      expect(screen.getByText('Deal')).toBeInTheDocument();
    });

    it('should render entity type badge correctly', () => {
      render(<SearchResultCard item={mockContact} />);
      
      const badge = screen.getByText('Contact');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should render status badge correctly', () => {
      render(<SearchResultCard item={mockContact} />);
      
      const statusBadge = screen.getByText('active');
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  describe('Entity-Specific Display', () => {
    it('should show contact-specific information', () => {
      render(<SearchResultCard item={mockContact} />);
      
      // Should show contact icon
      expect(screen.getByTestId('contact-icon')).toBeInTheDocument();
      
      // Should show contact details
      expect(screen.getByText('Email:')).toBeInTheDocument();
      expect(screen.getByText('Phone:')).toBeInTheDocument();
      expect(screen.getByText('Company:')).toBeInTheDocument();
      expect(screen.getByText('Title:')).toBeInTheDocument();
    });

    it('should show company-specific information', () => {
      render(<SearchResultCard item={mockCompany} />);
      
      // Should show company icon
      expect(screen.getByTestId('company-icon')).toBeInTheDocument();
      
      // Should show company details
      expect(screen.getByText('Industry:')).toBeInTheDocument();
      expect(screen.getByText('Website:')).toBeInTheDocument();
      expect(screen.getByText('Employees:')).toBeInTheDocument();
      expect(screen.getByText('Revenue:')).toBeInTheDocument();
    });

    it('should show deal-specific information', () => {
      render(<SearchResultCard item={mockDeal} />);
      
      // Should show deal icon
      expect(screen.getByTestId('deal-icon')).toBeInTheDocument();
      
      // Should show deal details
      expect(screen.getByText('Value:')).toBeInTheDocument();
      expect(screen.getByText('Stage:')).toBeInTheDocument();
      expect(screen.getByText('Probability:')).toBeInTheDocument();
      expect(screen.getByText('Close Date:')).toBeInTheDocument();
    });
  });

  describe('Text Highlighting', () => {
    it('should highlight search terms in text', () => {
      const searchQuery = 'john';
      render(<SearchResultCard item={mockContact} searchQuery={searchQuery} />);
      
      const highlightedText = screen.getByText(/john/i);
      expect(highlightedText).toHaveClass('bg-yellow-200');
    });

    it('should highlight multiple search terms', () => {
      const searchQuery = 'acme corp';
      render(<SearchResultCard item={mockContact} searchQuery={searchQuery} />);
      
      const highlightedTexts = screen.getAllByText(/acme|corp/i);
      highlightedTexts.forEach(text => {
        expect(text).toHaveClass('bg-yellow-200');
      });
    });

    it('should handle case-insensitive highlighting', () => {
      const searchQuery = 'JOHN';
      render(<SearchResultCard item={mockContact} searchQuery={searchQuery} />);
      
      const highlightedText = screen.getByText(/john/i);
      expect(highlightedText).toHaveClass('bg-yellow-200');
    });

    it('should not highlight when no search query provided', () => {
      render(<SearchResultCard item={mockContact} />);
      
      const nameText = screen.getByText('John Doe');
      expect(nameText).not.toHaveClass('bg-yellow-200');
    });
  });

  describe('Quick Actions', () => {
    it('should render quick action buttons', () => {
      render(<SearchResultCard item={mockContact} />);
      
      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should handle view action click', async () => {
      const user = userEvent.setup();
      const onView = jest.fn();
      
      render(<SearchResultCard item={mockContact} onView={onView} />);
      
      const viewButton = screen.getByRole('button', { name: /view/i });
      await user.click(viewButton);
      
      expect(onView).toHaveBeenCalledWith(mockContact);
    });

    it('should handle edit action click', async () => {
      const user = userEvent.setup();
      const onEdit = jest.fn();
      
      render(<SearchResultCard item={mockContact} onEdit={onEdit} />);
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);
      
      expect(onEdit).toHaveBeenCalledWith(mockContact);
    });

    it('should handle delete action click', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      
      render(<SearchResultCard item={mockContact} onDelete={onDelete} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);
      
      // Should show confirmation dialog
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);
      
      expect(onDelete).toHaveBeenCalledWith(mockContact);
    });

    it('should cancel delete action', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      
      render(<SearchResultCard item={mockContact} onDelete={onDelete} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe('Card Interactions', () => {
    it('should handle card click', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(<SearchResultCard item={mockContact} onClick={onClick} />);
      
      const card = screen.getByTestId('result-card');
      await user.click(card);
      
      expect(onClick).toHaveBeenCalledWith(mockContact);
    });

    it('should handle card hover', async () => {
      const user = userEvent.setup();
      
      render(<SearchResultCard item={mockContact} />);
      
      const card = screen.getByTestId('result-card');
      fireEvent.mouseEnter(card);
      
      // Should show hover state
      expect(card).toHaveClass('hover:shadow-lg');
    });

    it('should handle card focus', async () => {
      const user = userEvent.setup();
      
      render(<SearchResultCard item={mockContact} />);
      
      const card = screen.getByTestId('result-card');
      await user.tab();
      
      // Should show focus state
      expect(card).toHaveClass('focus:ring-2');
    });
  });

  describe('Data Formatting', () => {
    it('should format currency values correctly', () => {
      render(<SearchResultCard item={mockDeal} />);
      
      expect(screen.getByText('$50,000')).toBeInTheDocument();
    });

    it('should format large currency values correctly', () => {
      const largeDeal = { ...mockDeal, value: 1234567 };
      render(<SearchResultCard item={largeDeal} />);
      
      expect(screen.getByText('$1,234,567')).toBeInTheDocument();
    });

    it('should format percentages correctly', () => {
      render(<SearchResultCard item={mockDeal} />);
      
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should format dates correctly', () => {
      render(<SearchResultCard item={mockDeal} />);
      
      expect(screen.getByText('Mar 1, 2024')).toBeInTheDocument();
    });

    it('should format phone numbers correctly', () => {
      render(<SearchResultCard item={mockContact} />);
      
      expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
    });

    it('should format URLs correctly', () => {
      render(<SearchResultCard item={mockCompany} />);
      
      const urlLink = screen.getByText('https://acme.com');
      expect(urlLink).toHaveAttribute('href', 'https://acme.com');
      expect(urlLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Status Indicators', () => {
    it('should show active status with green color', () => {
      render(<SearchResultCard item={mockContact} />);
      
      const statusBadge = screen.getByText('active');
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should show inactive status with red color', () => {
      const inactiveContact = { ...mockContact, status: 'inactive' };
      render(<SearchResultCard item={inactiveContact} />);
      
      const statusBadge = screen.getByText('inactive');
      expect(statusBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('should show pending status with yellow color', () => {
      const pendingContact = { ...mockContact, status: 'pending' };
      render(<SearchResultCard item={pendingContact} />);
      
      const statusBadge = screen.getByText('pending');
      expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  describe('Priority Indicators', () => {
    it('should show high priority indicator', () => {
      const highPriorityContact = { ...mockContact, priority: 'high' };
      render(<SearchResultCard item={highPriorityContact} />);
      
      const priorityIndicator = screen.getByTestId('priority-high');
      expect(priorityIndicator).toHaveClass('bg-red-500');
    });

    it('should show medium priority indicator', () => {
      const mediumPriorityContact = { ...mockContact, priority: 'medium' };
      render(<SearchResultCard item={mediumPriorityContact} />);
      
      const priorityIndicator = screen.getByTestId('priority-medium');
      expect(priorityIndicator).toHaveClass('bg-yellow-500');
    });

    it('should show low priority indicator', () => {
      const lowPriorityContact = { ...mockContact, priority: 'low' };
      render(<SearchResultCard item={lowPriorityContact} />);
      
      const priorityIndicator = screen.getByTestId('priority-low');
      expect(priorityIndicator).toHaveClass('bg-green-500');
    });
  });

  describe('Metadata Display', () => {
    it('should show creation date', () => {
      render(<SearchResultCard item={mockContact} />);
      
      expect(screen.getByText('Created: Jan 1, 2024')).toBeInTheDocument();
    });

    it('should show last updated date', () => {
      render(<SearchResultCard item={mockContact} />);
      
      expect(screen.getByText('Updated: Jan 1, 2024')).toBeInTheDocument();
    });

    it('should show relative time for recent updates', () => {
      const recentContact = {
        ...mockContact,
        updatedAt: new Date().toISOString(),
      };
      render(<SearchResultCard item={recentContact} />);
      
      expect(screen.getByText(/Updated: just now/)).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should handle missing optional fields gracefully', () => {
      const incompleteContact = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        entityType: 'Contact',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      
      render(<SearchResultCard item={incompleteContact} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('N/A')).toBeInTheDocument(); // For missing phone
    });

    it('should handle null values gracefully', () => {
      const contactWithNulls = {
        ...mockContact,
        phone: null,
        company: null,
        title: null,
      };
      
      render(<SearchResultCard item={contactWithNulls} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<SearchResultCard item={mockContact} />);
      
      const card = screen.getByTestId('result-card');
      expect(card).toHaveAttribute('aria-label', 'Contact: John Doe');
    });

    it('should have proper role attributes', () => {
      render(<SearchResultCard item={mockContact} />);
      
      const card = screen.getByTestId('result-card');
      expect(card).toHaveAttribute('role', 'button');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SearchResultCard item={mockContact} />);
      
      const card = screen.getByTestId('result-card');
      await user.tab();
      
      expect(card).toHaveFocus();
    });

    it('should have proper heading structure', () => {
      render(<SearchResultCard item={mockContact} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('John Doe');
    });
  });

  describe('Performance', () => {
    it('should handle large data sets efficiently', () => {
      const largeContact = {
        ...mockContact,
        description: 'A'.repeat(1000), // Large description
      };
      
      // Should render without performance issues
      expect(() => render(<SearchResultCard item={largeContact} />)).not.toThrow();
    });

    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<SearchResultCard item={mockContact} />);
      
      // Re-render with same props
      rerender(<SearchResultCard item={mockContact} />);
      
      // Should not cause performance issues
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<SearchResultCard item={mockContact} />);
      
      const card = screen.getByTestId('result-card');
      expect(card).toBeInTheDocument();
      
      // Should have mobile-friendly classes
      expect(card).toHaveClass('p-4');
    });

    it('should handle touch events on mobile', async () => {
      const user = userEvent.setup();
      render(<SearchResultCard item={mockContact} />);
      
      const card = screen.getByTestId('result-card');
      
      // Simulate touch event
      fireEvent.touchStart(card);
      fireEvent.touchEnd(card);
      
      expect(card).toBeInTheDocument();
    });
  });
});
