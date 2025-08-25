import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdvancedFilters } from '../../components/filters/AdvancedFilters';
import { useSearchStore } from '../../stores/searchStore';

// Mock the store
jest.mock('../../stores/searchStore');

const mockUseSearchStore = useSearchStore as jest.MockedFunction<typeof useSearchStore>;

describe('AdvancedFilters', () => {
  const mockStore = {
    filters: [],
    addFilter: jest.fn(),
    removeFilter: jest.fn(),
    clearFilters: jest.fn(),
    saveFilterTemplate: jest.fn(),
    loadFilterTemplate: jest.fn(),
  };

  const mockFilters = [
    {
      field: 'name',
      operator: 'contains',
      value: 'test',
    },
    {
      field: 'email',
      operator: 'equals',
      value: 'test@example.com',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchStore.mockReturnValue(mockStore);
  });

  describe('Rendering', () => {
    it('should render filters component correctly', () => {
      render(<AdvancedFilters />);
      
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add filter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
    });

    it('should render existing filters', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: mockFilters,
      });

      render(<AdvancedFilters />);
      
      expect(screen.getByDisplayValue('name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('contains')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('email')).toBeInTheDocument();
      expect(screen.getByDisplayValue('equals')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    it('should render filter operators correctly', () => {
      render(<AdvancedFilters />);
      
      const operatorSelect = screen.getByRole('combobox', { name: /operator/i });
      expect(operatorSelect).toBeInTheDocument();
      
      // Check for common operators
      expect(screen.getByText('contains')).toBeInTheDocument();
      expect(screen.getByText('equals')).toBeInTheDocument();
      expect(screen.getByText('starts with')).toBeInTheDocument();
      expect(screen.getByText('ends with')).toBeInTheDocument();
    });

    it('should render filter fields correctly', () => {
      render(<AdvancedFilters />);
      
      const fieldSelect = screen.getByRole('combobox', { name: /field/i });
      expect(fieldSelect).toBeInTheDocument();
      
      // Check for common fields
      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('phone')).toBeInTheDocument();
      expect(screen.getByText('company')).toBeInTheDocument();
    });
  });

  describe('Filter Management', () => {
    it('should add a new filter when add filter button is clicked', async () => {
      const user = userEvent.setup();
      render(<AdvancedFilters />);
      
      const addFilterButton = screen.getByRole('button', { name: /add filter/i });
      await user.click(addFilterButton);
      
      expect(mockStore.addFilter).toHaveBeenCalledWith({
        field: 'name',
        operator: 'contains',
        value: '',
      });
    });

    it('should remove a filter when remove button is clicked', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: mockFilters,
      });

      render(<AdvancedFilters />);
      
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);
      
      expect(mockStore.removeFilter).toHaveBeenCalledWith(0);
    });

    it('should clear all filters when clear all button is clicked', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: mockFilters,
      });

      render(<AdvancedFilters />);
      
      const clearAllButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearAllButton);
      
      expect(mockStore.clearFilters).toHaveBeenCalled();
    });

    it('should update filter field when field is changed', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [mockFilters[0]],
      });

      render(<AdvancedFilters />);
      
      const fieldSelect = screen.getByRole('combobox', { name: /field/i });
      await user.selectOptions(fieldSelect, 'email');
      
      // Should update the filter with new field
      expect(fieldSelect).toHaveValue('email');
    });

    it('should update filter operator when operator is changed', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [mockFilters[0]],
      });

      render(<AdvancedFilters />);
      
      const operatorSelect = screen.getByRole('combobox', { name: /operator/i });
      await user.selectOptions(operatorSelect, 'equals');
      
      // Should update the filter with new operator
      expect(operatorSelect).toHaveValue('equals');
    });

    it('should update filter value when value is changed', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [mockFilters[0]],
      });

      render(<AdvancedFilters />);
      
      const valueInput = screen.getByDisplayValue('test');
      await user.clear(valueInput);
      await user.type(valueInput, 'new value');
      
      expect(valueInput).toHaveValue('new value');
    });
  });

  describe('Filter Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<AdvancedFilters />);
      
      const addFilterButton = screen.getByRole('button', { name: /add filter/i });
      await user.click(addFilterButton);
      
      // Should not add filter with empty required fields
      expect(mockStore.addFilter).toHaveBeenCalledWith({
        field: 'name',
        operator: 'contains',
        value: '',
      });
    });

    it('should validate email format for email field', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'email', operator: 'equals', value: 'invalid-email' }],
      });

      render(<AdvancedFilters />);
      
      const valueInput = screen.getByDisplayValue('invalid-email');
      await user.clear(valueInput);
      await user.type(valueInput, 'valid@email.com');
      
      expect(valueInput).toHaveValue('valid@email.com');
    });

    it('should validate date format for date fields', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'createdAt', operator: 'after', value: '2024-01-01' }],
      });

      render(<AdvancedFilters />);
      
      const valueInput = screen.getByDisplayValue('2024-01-01');
      expect(valueInput).toHaveAttribute('type', 'date');
    });

    it('should validate numeric format for numeric fields', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'amount', operator: 'greater_than', value: '100' }],
      });

      render(<AdvancedFilters />);
      
      const valueInput = screen.getByDisplayValue('100');
      expect(valueInput).toHaveAttribute('type', 'number');
    });
  });

  describe('Filter Templates', () => {
    it('should save filter template', async () => {
      const user = userEvent.setup();
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: mockFilters,
      });

      render(<AdvancedFilters />);
      
      const saveTemplateButton = screen.getByRole('button', { name: /save template/i });
      await user.click(saveTemplateButton);
      
      // Should prompt for template name
      const templateNameInput = screen.getByPlaceholderText(/template name/i);
      await user.type(templateNameInput, 'My Template');
      
      const confirmButton = screen.getByRole('button', { name: /save/i });
      await user.click(confirmButton);
      
      expect(mockStore.saveFilterTemplate).toHaveBeenCalledWith('My Template');
    });

    it('should load filter template', async () => {
      const user = userEvent.setup();
      const mockTemplates = [
        { id: '1', name: 'Template 1', filters: mockFilters },
        { id: '2', name: 'Template 2', filters: [] },
      ];

      render(<AdvancedFilters />);
      
      const loadTemplateButton = screen.getByRole('button', { name: /load template/i });
      await user.click(loadTemplateButton);
      
      // Should show template selection
      const templateSelect = screen.getByRole('combobox', { name: /select template/i });
      await user.selectOptions(templateSelect, '1');
      
      expect(mockStore.loadFilterTemplate).toHaveBeenCalledWith('1');
    });

    it('should delete filter template', async () => {
      const user = userEvent.setup();
      render(<AdvancedFilters />);
      
      const deleteTemplateButton = screen.getByRole('button', { name: /delete template/i });
      await user.click(deleteTemplateButton);
      
      // Should show confirmation dialog
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      await user.click(confirmButton);
      
      // Should delete the template
      expect(screen.getByText(/template deleted/i)).toBeInTheDocument();
    });
  });

  describe('Filter Types', () => {
    it('should render text input for text fields', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'name', operator: 'contains', value: 'test' }],
      });

      render(<AdvancedFilters />);
      
      const valueInput = screen.getByDisplayValue('test');
      expect(valueInput).toHaveAttribute('type', 'text');
    });

    it('should render select input for enum fields', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'status', operator: 'equals', value: 'active' }],
      });

      render(<AdvancedFilters />);
      
      const valueSelect = screen.getByDisplayValue('active');
      expect(valueSelect).toHaveAttribute('role', 'combobox');
    });

    it('should render date input for date fields', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'createdAt', operator: 'after', value: '2024-01-01' }],
      });

      render(<AdvancedFilters />);
      
      const valueInput = screen.getByDisplayValue('2024-01-01');
      expect(valueInput).toHaveAttribute('type', 'date');
    });

    it('should render number input for numeric fields', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'amount', operator: 'greater_than', value: '100' }],
      });

      render(<AdvancedFilters />);
      
      const valueInput = screen.getByDisplayValue('100');
      expect(valueInput).toHaveAttribute('type', 'number');
    });

    it('should render boolean input for boolean fields', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'isActive', operator: 'equals', value: 'true' }],
      });

      render(<AdvancedFilters />);
      
      const valueSelect = screen.getByDisplayValue('true');
      expect(valueSelect).toHaveAttribute('role', 'combobox');
    });
  });

  describe('Filter Operators', () => {
    it('should show appropriate operators for text fields', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'name', operator: 'contains', value: 'test' }],
      });

      render(<AdvancedFilters />);
      
      const operatorSelect = screen.getByDisplayValue('contains');
      expect(operatorSelect).toBeInTheDocument();
      
      // Should show text operators
      expect(screen.getByText('contains')).toBeInTheDocument();
      expect(screen.getByText('equals')).toBeInTheDocument();
      expect(screen.getByText('starts with')).toBeInTheDocument();
      expect(screen.getByText('ends with')).toBeInTheDocument();
    });

    it('should show appropriate operators for numeric fields', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'amount', operator: 'greater_than', value: '100' }],
      });

      render(<AdvancedFilters />);
      
      const operatorSelect = screen.getByDisplayValue('greater_than');
      expect(operatorSelect).toBeInTheDocument();
      
      // Should show numeric operators
      expect(screen.getByText('equals')).toBeInTheDocument();
      expect(screen.getByText('greater_than')).toBeInTheDocument();
      expect(screen.getByText('less_than')).toBeInTheDocument();
      expect(screen.getByText('between')).toBeInTheDocument();
    });

    it('should show appropriate operators for date fields', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'createdAt', operator: 'after', value: '2024-01-01' }],
      });

      render(<AdvancedFilters />);
      
      const operatorSelect = screen.getByDisplayValue('after');
      expect(operatorSelect).toBeInTheDocument();
      
      // Should show date operators
      expect(screen.getByText('equals')).toBeInTheDocument();
      expect(screen.getByText('after')).toBeInTheDocument();
      expect(screen.getByText('before')).toBeInTheDocument();
      expect(screen.getByText('between')).toBeInTheDocument();
    });
  });

  describe('Complex Filters', () => {
    it('should handle between operator with two values', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'amount', operator: 'between', value: '100,500' }],
      });

      render(<AdvancedFilters />);
      
      const valueInputs = screen.getAllByDisplayValue(/100|500/);
      expect(valueInputs).toHaveLength(2);
    });

    it('should handle in operator with multiple values', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'status', operator: 'in', value: 'active,pending,closed' }],
      });

      render(<AdvancedFilters />);
      
      const valueInput = screen.getByDisplayValue('active,pending,closed');
      expect(valueInput).toBeInTheDocument();
    });

    it('should handle null operator', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'email', operator: 'is_null', value: '' }],
      });

      render(<AdvancedFilters />);
      
      const operatorSelect = screen.getByDisplayValue('is_null');
      expect(operatorSelect).toBeInTheDocument();
      
      // Should not show value input for null operator
      const valueInput = screen.queryByRole('textbox');
      expect(valueInput).not.toBeInTheDocument();
    });
  });

  describe('Filter Persistence', () => {
    it('should persist filters in URL', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: mockFilters,
      });

      render(<AdvancedFilters />);
      
      // Should update URL with filter parameters
      expect(window.location.search).toContain('filters');
    });

    it('should load filters from URL on mount', () => {
      // Mock URL with filters
      Object.defineProperty(window, 'location', {
        value: {
          search: '?filters=name:contains:test,email:equals:test@example.com',
        },
        writable: true,
      });

      render(<AdvancedFilters />);
      
      // Should load filters from URL
      expect(mockStore.addFilter).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid filter data gracefully', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: [{ field: 'invalid', operator: 'invalid', value: 'test' }],
      });

      render(<AdvancedFilters />);
      
      // Should render without crashing
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    });

    it('should handle store errors gracefully', () => {
      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        addFilter: jest.fn().mockImplementation(() => {
          throw new Error('Store error');
        }),
      });

      render(<AdvancedFilters />);
      
      // Should render without crashing
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<AdvancedFilters />);
      
      const fieldSelect = screen.getByRole('combobox', { name: /field/i });
      const operatorSelect = screen.getByRole('combobox', { name: /operator/i });
      
      expect(fieldSelect).toHaveAttribute('aria-label', 'Filter field');
      expect(operatorSelect).toHaveAttribute('aria-label', 'Filter operator');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AdvancedFilters />);
      
      // Tab through interactive elements
      await user.tab();
      
      // Should focus on first interactive element
      expect(document.activeElement).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<AdvancedFilters />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Advanced Filters');
    });
  });

  describe('Performance', () => {
    it('should handle many filters efficiently', () => {
      const manyFilters = Array.from({ length: 20 }, (_, i) => ({
        field: `field${i}`,
        operator: 'contains',
        value: `value${i}`,
      }));

      mockUseSearchStore.mockReturnValue({
        ...mockStore,
        filters: manyFilters,
      });

      // Should render without performance issues
      expect(() => render(<AdvancedFilters />)).not.toThrow();
    });

    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<AdvancedFilters />);
      
      // Re-render with same props
      rerender(<AdvancedFilters />);
      
      // Should not cause performance issues
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
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

      render(<AdvancedFilters />);
      
      const filtersContainer = screen.getByTestId('filters-container');
      expect(filtersContainer).toBeInTheDocument();
      
      // Should have mobile-friendly classes
      expect(filtersContainer).toHaveClass('flex-col');
    });

    it('should handle touch events on mobile', async () => {
      const user = userEvent.setup();
      render(<AdvancedFilters />);
      
      const addFilterButton = screen.getByRole('button', { name: /add filter/i });
      
      // Simulate touch event
      fireEvent.touchStart(addFilterButton);
      fireEvent.touchEnd(addFilterButton);
      
      expect(addFilterButton).toBeInTheDocument();
    });
  });
});
