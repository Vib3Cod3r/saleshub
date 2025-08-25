import { z } from 'zod';
import { SearchQuery, FilterCriteria, FilterOperator } from '@/types/search';

// User Validation Schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  middleName: z.string().max(50, 'Middle name must be less than 50 characters').optional(),
  jobTitle: z.string().max(100, 'Job title must be less than 100 characters').optional(),
  department: z.string().max(100, 'Department must be less than 100 characters').optional(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
  mobile: z.string().max(20, 'Mobile must be less than 20 characters').optional(),
  roleId: z.string().min(1, 'Role ID is required')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').optional(),
  middleName: z.string().max(50, 'Middle name must be less than 50 characters').optional(),
  jobTitle: z.string().max(100, 'Job title must be less than 100 characters').optional(),
  department: z.string().max(100, 'Department must be less than 100 characters').optional(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
  mobile: z.string().max(20, 'Mobile must be less than 20 characters').optional(),
  timezone: z.string().max(50, 'Timezone must be less than 50 characters').optional(),
  locale: z.string().max(10, 'Locale must be less than 10 characters').optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(100, 'New password must be less than 100 characters')
});

// Contact Validation Schemas
export const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  middleName: z.string().max(50, 'Middle name must be less than 50 characters').optional(),
  preferredName: z.string().max(50, 'Preferred name must be less than 50 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
  mobile: z.string().max(20, 'Mobile must be less than 20 characters').optional(),
  workPhone: z.string().max(20, 'Work phone must be less than 20 characters').optional(),
  fax: z.string().max(20, 'Fax must be less than 20 characters').optional(),
  website: z.string().url('Invalid website URL').optional(),
  jobTitle: z.string().max(100, 'Job title must be less than 100 characters').optional(),
  department: z.string().max(100, 'Department must be less than 100 characters').optional(),
  isDecisionMaker: z.boolean().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  birthday: z.string().datetime().optional(),
  spouseName: z.string().max(100, 'Spouse name must be less than 100 characters').optional(),
  childrenNames: z.string().max(500, 'Children names must be less than 500 characters').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  address2: z.string().max(200, 'Address 2 must be less than 200 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  state: z.string().max(100, 'State must be less than 100 characters').optional(),
  zipCode: z.string().max(20, 'Zip code must be less than 20 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  timezone: z.string().max(50, 'Timezone must be less than 50 characters').optional(),
  language: z.string().max(10, 'Language must be less than 10 characters').optional(),
  leadSource: z.string().max(100, 'Lead source must be less than 100 characters').optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
  companyId: z.string().min(1, 'Company ID is required').optional()
});

export const updateContactSchema = createContactSchema.partial();

// Company Validation Schemas
export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200, 'Company name must be less than 200 characters'),
  legalName: z.string().max(200, 'Legal name must be less than 200 characters').optional(),
  dba: z.string().max(200, 'DBA must be less than 200 characters').optional(),
  website: z.string().url('Invalid website URL').optional(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
  fax: z.string().max(20, 'Fax must be less than 20 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  address2: z.string().max(200, 'Address 2 must be less than 200 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  state: z.string().max(100, 'State must be less than 100 characters').optional(),
  zipCode: z.string().max(20, 'Zip code must be less than 20 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  timezone: z.string().max(50, 'Timezone must be less than 50 characters').optional(),
  industry: z.string().max(100, 'Industry must be less than 100 characters').optional(),
  sector: z.string().max(100, 'Sector must be less than 100 characters').optional(),
  size: z.string().max(50, 'Size must be less than 50 characters').optional(),
  revenue: z.number().positive('Revenue must be positive').optional(),
  employeeCount: z.number().int().positive('Employee count must be a positive integer').optional(),
  foundedYear: z.number().int().min(1800, 'Founded year must be after 1800').max(new Date().getFullYear(), 'Founded year cannot be in the future').optional(),
  tickerSymbol: z.string().max(20, 'Ticker symbol must be less than 20 characters').optional(),
  isPublic: z.boolean().optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
  parentCompanyId: z.string().min(1, 'Parent company ID is required').optional()
});

export const updateCompanySchema = createCompanySchema.partial();

// Lead Validation Schemas
export const createLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
  company: z.string().max(200, 'Company must be less than 200 characters').optional(),
  jobTitle: z.string().max(100, 'Job title must be less than 100 characters').optional(),
  website: z.string().url('Invalid website URL').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  state: z.string().max(100, 'State must be less than 100 characters').optional(),
  zipCode: z.string().max(20, 'Zip code must be less than 20 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  source: z.string().min(1, 'Source is required').max(100, 'Source must be less than 100 characters'),
  sourceDetails: z.string().max(200, 'Source details must be less than 200 characters').optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional()
});

export const updateLeadSchema = createLeadSchema.partial();

// Deal Validation Schemas
export const createDealSchema = z.object({
  title: z.string().min(1, 'Deal title is required').max(200, 'Deal title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  value: z.number().positive('Deal value must be positive'),
  currency: z.string().max(3, 'Currency must be 3 characters').default('USD'),
  probability: z.number().min(0, 'Probability must be between 0 and 100').max(100, 'Probability must be between 0 and 100').default(0),
  stage: z.string().max(50, 'Stage must be less than 50 characters').default('PROSPECTING'),
  expectedCloseDate: z.string().datetime().optional(),
  closeReason: z.string().max(200, 'Close reason must be less than 200 characters').optional(),
  lossReason: z.string().max(200, 'Loss reason must be less than 200 characters').optional(),
  competitors: z.array(z.string().max(100, 'Competitor name must be less than 100 characters')).optional(),
  risks: z.string().max(1000, 'Risks must be less than 1000 characters').optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
  companyId: z.string().min(1, 'Company ID is required'),
  primaryContactId: z.string().min(1, 'Primary contact ID is required').optional()
});

export const updateDealSchema = createDealSchema.partial();

// Task Validation Schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  type: z.string().min(1, 'Task type is required').max(50, 'Task type must be less than 50 characters'),
  priority: z.string().max(20, 'Priority must be less than 20 characters').default('MEDIUM'),
  status: z.string().max(20, 'Status must be less than 20 characters').default('PENDING'),
  dueDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  estimatedDuration: z.number().int().positive('Estimated duration must be a positive integer').optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
  assigneeId: z.string().min(1, 'Assignee ID is required').optional(),
  contactId: z.string().min(1, 'Contact ID is required').optional(),
  dealId: z.string().min(1, 'Deal ID is required').optional(),
  companyId: z.string().min(1, 'Company ID is required').optional()
});

export const updateTaskSchema = createTaskSchema.partial();

// Pagination Validation Schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  sortBy: z.string().max(50, 'Sort by must be less than 50 characters').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Search Validation Schema
export const searchSchema = z.object({
  search: z.string().max(200, 'Search term must be less than 200 characters').optional()
});

// Combined Filter Schemas
export const contactFiltersSchema = paginationSchema.merge(searchSchema).extend({
  companyId: z.string().min(1, 'Company ID is required').optional(),
  ownerId: z.string().min(1, 'Owner ID is required').optional(),
  leadStatus: z.string().max(50, 'Lead status must be less than 50 characters').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
  isActive: z.coerce.boolean().optional()
});

export const companyFiltersSchema = paginationSchema.merge(searchSchema).extend({
  industry: z.string().max(100, 'Industry must be less than 100 characters').optional(),
  size: z.string().max(50, 'Size must be less than 50 characters').optional(),
  ownerId: z.string().min(1, 'Owner ID is required').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
  isActive: z.coerce.boolean().optional()
});

export const leadFiltersSchema = paginationSchema.merge(searchSchema).extend({
  source: z.string().max(100, 'Source must be less than 100 characters').optional(),
  status: z.string().max(50, 'Status must be less than 50 characters').optional(),
  assignedToId: z.string().min(1, 'Assigned to ID is required').optional(),
  isConverted: z.coerce.boolean().optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional()
});

export const dealFiltersSchema = paginationSchema.merge(searchSchema).extend({
  stage: z.string().max(50, 'Stage must be less than 50 characters').optional(),
  ownerId: z.string().min(1, 'Owner ID is required').optional(),
  companyId: z.string().min(1, 'Company ID is required').optional(),
  minValue: z.coerce.number().positive('Minimum value must be positive').optional(),
  maxValue: z.coerce.number().positive('Maximum value must be positive').optional(),
  isActive: z.coerce.boolean().optional()
});

export const taskFiltersSchema = paginationSchema.merge(searchSchema).extend({
  type: z.string().max(50, 'Type must be less than 50 characters').optional(),
  priority: z.string().max(20, 'Priority must be less than 20 characters').optional(),
  status: z.string().max(20, 'Status must be less than 20 characters').optional(),
  assigneeId: z.string().min(1, 'Assignee ID is required').optional(),
  creatorId: z.string().min(1, 'Creator ID is required').optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional()
});

/**
 * Validate search query
 */
export function validateSearchQuery(query: SearchQuery): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate text length
  if (query.text && query.text.length > 500) {
    errors.push('Search text must be less than 500 characters');
  }

  // Validate entities
  if (query.entities) {
    const validEntities = ['Contact', 'Company', 'Deal', 'Lead', 'Task'];
    const invalidEntities = query.entities.filter(entity => !validEntities.includes(entity));
    
    if (invalidEntities.length > 0) {
      errors.push(`Invalid entities: ${invalidEntities.join(', ')}. Valid entities are: ${validEntities.join(', ')}`);
    }
  }

  // Validate filters
  if (query.filters) {
    query.filters.forEach((filter, index) => {
      const filterErrors = validateFilter(filter);
      filterErrors.forEach(error => {
        errors.push(`Filter ${index + 1}: ${error}`);
      });
    });
  }

  // Validate sort order
  if (query.sortOrder && !['asc', 'desc'].includes(query.sortOrder)) {
    errors.push('Sort order must be either "asc" or "desc"');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate filter criteria
 */
export function validateFilter(filter: FilterCriteria): string[] {
  const errors: string[] = [];

  // Validate field
  if (!filter.field || typeof filter.field !== 'string') {
    errors.push('Field is required and must be a string');
  }

  // Validate operator
  const validOperators: FilterOperator[] = [
    'equals', 'contains', 'startsWith', 'endsWith', 'in', 'notIn',
    'gt', 'gte', 'lt', 'lte', 'between', 'isNull', 'isNotNull'
  ];
  
  if (!validOperators.includes(filter.operator)) {
    errors.push(`Invalid operator. Valid operators are: ${validOperators.join(', ')}`);
  }

  // Validate value based on operator
  if (filter.operator !== 'isNull' && filter.operator !== 'isNotNull') {
    if (filter.value === undefined || filter.value === null) {
      errors.push('Value is required for this operator');
    }
  }

  // Validate specific operator requirements
  switch (filter.operator) {
    case 'between':
      if (!Array.isArray(filter.value) || filter.value.length !== 2) {
        errors.push('Between operator requires an array with exactly 2 values');
      }
      break;
    
    case 'in':
    case 'notIn':
      if (!Array.isArray(filter.value)) {
        errors.push(`${filter.operator} operator requires an array of values`);
      }
      break;
    
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
      if (typeof filter.value !== 'number' && !(filter.value instanceof Date)) {
        errors.push(`${filter.operator} operator requires a number or date value`);
      }
      break;
  }

  // Validate logical operator
  if (filter.logicalOperator && !['AND', 'OR'].includes(filter.logicalOperator)) {
    errors.push('Logical operator must be either "AND" or "OR"');
  }

  return errors;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: number, limit: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (page < 1) {
    errors.push('Page must be greater than 0');
  }

  if (limit < 1 || limit > 100) {
    errors.push('Limit must be between 1 and 100');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: Date, endDate: Date): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    errors.push('Start date must be a valid date');
  }

  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    errors.push('End date must be a valid date');
  }

  if (startDate && endDate && startDate > endDate) {
    errors.push('Start date must be before end date');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate value range
 */
export function validateValueRange(min: number, max: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof min !== 'number' || isNaN(min)) {
    errors.push('Minimum value must be a valid number');
  }

  if (typeof max !== 'number' || isNaN(max)) {
    errors.push('Maximum value must be a valid number');
  }

  if (min > max) {
    errors.push('Minimum value must be less than maximum value');
  }

  if (min < 0) {
    errors.push('Minimum value must be non-negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required and must be a string');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email must be in a valid format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate phone number format
 */
export function validatePhone(phone: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!phone || typeof phone !== 'string') {
    errors.push('Phone number is required and must be a string');
  } else {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Phone number must be in a valid format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate required fields
 */
export function validateRequiredFields(data: any, requiredFields: string[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  requiredFields.forEach(field => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`${field} is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate string length
 */
export function validateStringLength(value: string, fieldName: string, minLength: number, maxLength: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`);
  } else {
    if (value.length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters long`);
    }
    if (value.length > maxLength) {
      errors.push(`${fieldName} must be no more than ${maxLength} characters long`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate enum values
 */
export function validateEnum(value: any, fieldName: string, validValues: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!validValues.includes(value)) {
    errors.push(`${fieldName} must be one of: ${validValues.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: SearchQuery): SearchQuery {
  const sanitized = { ...query };

  // Sanitize text
  if (sanitized.text) {
    sanitized.text = sanitized.text.trim().slice(0, 500);
  }

  // Sanitize entities
  if (sanitized.entities) {
    const validEntities = ['contacts', 'companies', 'deals', 'leads', 'tasks'];
    sanitized.entities = sanitized.entities.filter(entity => validEntities.includes(entity));
  }

  // Sanitize filters
  if (sanitized.filters) {
    sanitized.filters = sanitized.filters.filter(filter => {
      const errors = validateFilter(filter);
      return errors.length === 0;
    });
  }

  // Sanitize sort order
  if (sanitized.sortOrder && !['asc', 'desc'].includes(sanitized.sortOrder)) {
    sanitized.sortOrder = 'desc';
  }

  return sanitized;
}

/**
 * Validate and sanitize search input
 */
export function validateAndSanitizeSearchInput(input: any): { isValid: boolean; errors: string[]; sanitized: SearchQuery } {
  const validation = validateSearchQuery(input);
  
  if (validation.isValid) {
    const sanitized = sanitizeSearchQuery(input);
    return {
      isValid: true,
      errors: [],
      sanitized
    };
  }

  return {
    isValid: false,
    errors: validation.errors,
    sanitized: input
  };
}
