// Core API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  mobile?: string;
  avatar?: string;
  timezone?: string;
  locale?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  roleId: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  mobile?: string;
  roleId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

// Contact Types
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  email?: string;
  emailVerified: boolean;
  phone?: string;
  mobile?: string;
  workPhone?: string;
  fax?: string;
  website?: string;
  jobTitle?: string;
  department?: string;
  isDecisionMaker: boolean;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  birthday?: Date;
  spouseName?: string;
  childrenNames?: string;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  language?: string;
  leadSource?: string;
  leadStatus: string;
  leadScore?: number;
  notes?: string;
  tags: string[];
  lastContactDate?: Date;
  lastActivityDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId?: string;
  ownerId?: string;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  workPhone?: string;
  fax?: string;
  website?: string;
  jobTitle?: string;
  department?: string;
  isDecisionMaker?: boolean;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  birthday?: string;
  spouseName?: string;
  childrenNames?: string;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  timezone?: string;
  language?: string;
  leadSource?: string;
  notes?: string;
  tags?: string[];
  companyId?: string;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {
  // Additional fields that can be updated
  leadStatus?: string;
  leadScore?: number;
  lastContactDate?: string;
  lastActivityDate?: string;
  isActive?: boolean;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  legalName?: string;
  dba?: string;
  website?: string;
  phone?: string;
  fax?: string;
  email?: string;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  industry?: string;
  sector?: string;
  size?: string;
  revenue?: number;
  employeeCount?: number;
  foundedYear?: number;
  tickerSymbol?: string;
  isPublic: boolean;
  isActive: boolean;
  prospectAssignment?: string;
  prospectReengagement?: string;
  notes?: string;
  tags: string[];
  lastActivityDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  parentCompanyId?: string;
  ownerId: string;
}

export interface CreateCompanyRequest {
  name: string;
  legalName?: string;
  dba?: string;
  website?: string;
  phone?: string;
  fax?: string;
  email?: string;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  timezone?: string;
  industry?: string;
  sector?: string;
  size?: string;
  revenue?: number;
  employeeCount?: number;
  foundedYear?: number;
  tickerSymbol?: string;
  isPublic?: boolean;
  notes?: string;
  tags?: string[];
  parentCompanyId?: string;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {
  // Additional fields that can be updated
  isActive?: boolean;
  lastActivityDate?: string;
}

// Lead Types
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  source: string;
  sourceDetails?: string;
  leadScore: number;
  status: string;
  assignedToId?: string;
  notes?: string;
  tags: string[];
  isConverted: boolean;
  convertedToContactId?: string;
  convertedToCompanyId?: string;
  convertedAt?: Date;
  lastActivityDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  source: string;
  sourceDetails?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {
  // Additional fields that can be updated
  leadScore?: number;
  status?: string;
  assignedToId?: string;
  isConverted?: boolean;
  convertedToContactId?: string;
  convertedToCompanyId?: string;
  convertedAt?: string;
  lastActivityDate?: string;
}

// Deal Types
export interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  probability: number;
  stage: string;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  closeReason?: string;
  lossReason?: string;
  competitors: string[];
  risks?: string;
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  primaryContactId?: string;
  ownerId: string;
}

export interface CreateDealRequest {
  title: string;
  description?: string;
  value: number;
  currency?: string;
  probability?: number;
  stage?: string;
  expectedCloseDate?: string;
  closeReason?: string;
  lossReason?: string;
  competitors?: string[];
  risks?: string;
  notes?: string;
  tags?: string[];
  companyId: string;
  primaryContactId?: string;
}

export interface UpdateDealRequest extends Partial<CreateDealRequest> {
  // Additional fields that can be updated
  isActive?: boolean;
  actualCloseDate?: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  notes?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  workflowId?: string;
  assigneeId?: string;
  creatorId: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  type: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  startDate?: string;
  estimatedDuration?: number;
  notes?: string;
  assigneeId?: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  // Additional fields that can be updated
  completedAt?: string;
  actualDuration?: number;
}

// JWT Types
export interface JWTPayload {
  userId: string;
  email: string;
  roleId: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Filter Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContactFilters extends PaginationParams {
  search?: string;
  companyId?: string;
  ownerId?: string;
  leadStatus?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface CompanyFilters extends PaginationParams {
  search?: string;
  industry?: string;
  size?: string;
  ownerId?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface LeadFilters extends PaginationParams {
  search?: string;
  source?: string;
  status?: string;
  assignedToId?: string;
  isConverted?: boolean;
  tags?: string[];
}

export interface DealFilters extends PaginationParams {
  search?: string;
  stage?: string;
  ownerId?: string;
  companyId?: string;
  minValue?: number;
  maxValue?: number;
  isActive?: boolean;
}

export interface TaskFilters extends PaginationParams {
  search?: string;
  type?: string;
  priority?: string;
  status?: string;
  assigneeId?: string;
  creatorId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}
