import { UserRole, DealStage, TaskType, Priority, TaskStatus, NoteType, MessageType, Direction, MessageStatus } from '@prisma/client';

// Base types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: UserRole;
  metadata?: Record<string, any>;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

// Company types
export interface Company extends BaseEntity {
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdById: string;
  createdBy: User;
  contacts: Contact[];
}

export interface CreateCompanyRequest {
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCompanyRequest {
  name?: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Contact types
export interface Contact extends BaseEntity {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  metadata?: Record<string, any>;
  companyId?: string;
  company?: Company;
  assignedToId?: string;
  assignedTo?: User;
  createdById: string;
  createdBy: User;
  deals: Deal[];
  tasks: Task[];
  calls: Call[];
  notes: Note[];
  messages: Message[];
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  companyId?: string;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  companyId?: string;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

// Deal types
export interface Deal extends BaseEntity {
  title: string;
  description?: string;
  value?: number;
  currency: string;
  stage: DealStage;
  probability?: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  metadata?: Record<string, any>;
  contactId: string;
  contact: Contact;
  assignedToId?: string;
  assignedTo?: User;
  createdById: string;
  createdBy: User;
  tasks: Task[];
  calls: Call[];
  notes: Note[];
  messages: Message[];
}

export interface CreateDealRequest {
  title: string;
  description?: string;
  value?: number;
  currency?: string;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: Date;
  contactId: string;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateDealRequest {
  title?: string;
  description?: string;
  value?: number;
  currency?: string;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

// Task types
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  type: TaskType;
  priority: Priority;
  status: TaskStatus;
  dueDate?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
  contactId?: string;
  contact?: Contact;
  dealId?: string;
  deal?: Deal;
  assignedToId?: string;
  assignedTo?: User;
  createdById: string;
  createdBy: User;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  type?: TaskType;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date;
  contactId?: string;
  dealId?: string;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  type?: TaskType;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date;
  completedAt?: Date;
  contactId?: string;
  dealId?: string;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

// Call types
export interface Call extends BaseEntity {
  subject?: string;
  description?: string;
  duration?: number;
  outcome?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
  contactId?: string;
  contact?: Contact;
  dealId?: string;
  deal?: Deal;
  assignedToId?: string;
  assignedTo?: User;
  createdById: string;
  createdBy: User;
}

export interface CreateCallRequest {
  subject?: string;
  description?: string;
  duration?: number;
  outcome?: string;
  scheduledAt?: Date;
  contactId?: string;
  dealId?: string;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCallRequest {
  subject?: string;
  description?: string;
  duration?: number;
  outcome?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  contactId?: string;
  dealId?: string;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

// Note types
export interface Note extends BaseEntity {
  title?: string;
  content: string;
  type: NoteType;
  metadata?: Record<string, any>;
  contactId?: string;
  contact?: Contact;
  dealId?: string;
  deal?: Deal;
  assignedToId?: string;
  assignedTo?: User;
  createdById: string;
  createdBy: User;
}

export interface CreateNoteRequest {
  title?: string;
  content: string;
  type?: NoteType;
  contactId?: string;
  dealId?: string;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  type?: NoteType;
  contactId?: string;
  dealId?: string;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

// Message types
export interface Message extends BaseEntity {
  subject?: string;
  content: string;
  type: MessageType;
  direction: Direction;
  status: MessageStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  metadata?: Record<string, any>;
  contactId?: string;
  contact?: Contact;
  dealId?: string;
  deal?: Deal;
  assignedToId?: string;
  assignedTo?: User;
  createdById: string;
  createdBy: User;
}

export interface CreateMessageRequest {
  subject?: string;
  content: string;
  type?: MessageType;
  direction?: Direction;
  status?: MessageStatus;
  scheduledAt?: Date;
  contactId?: string;
  dealId?: string;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateMessageRequest {
  subject?: string;
  content?: string;
  type?: MessageType;
  direction?: Direction;
  status?: MessageStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  contactId?: string;
  dealId?: string;
  assignedToId?: string;
  metadata?: Record<string, any>;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: UserRole;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Filter types
export interface ContactFilters extends PaginationParams {
  leadStatus?: string;
  leadSource?: string;
  assignedTo?: string;
  companyId?: string;
}

export interface DealFilters extends PaginationParams {
  stage?: DealStage;
  assignedTo?: string;
  contactId?: string;
}

export interface TaskFilters extends PaginationParams {
  status?: TaskStatus;
  priority?: Priority;
  type?: TaskType;
  assignedTo?: string;
  contactId?: string;
  dealId?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
} 