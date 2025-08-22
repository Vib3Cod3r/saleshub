export type EntityViewType = 'table' | 'card' | 'list'

export type FieldType = 'text' | 'email' | 'phone' | 'date' | 'number' | 'boolean' | 'picklist' | 'relationship'

export interface EntityField {
  id: string
  name: string
  displayName: string
  type: FieldType
  required: boolean
  sortable: boolean
  filterable: boolean
  searchable: boolean
  relationshipEntity?: string
  picklistOptions?: string[]
  defaultValue?: any
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
}

export interface EntitySpecification {
  id: string
  name: string
  displayName: string
  description?: string
  fields: EntityField[]
  defaultFields: string[]
  defaultSortField: string
  defaultSortDirection: 'asc' | 'desc'
  defaultPageSize: number
  maxPageSize: number
  supportsBulkActions: boolean
  supportsExport: boolean
  supportsImport: boolean
}

export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterConfig {
  id: string
  field: string
  operator: FilterOperator
  value: any
  displayValue?: string
}

export type FilterOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains' 
  | 'starts_with' 
  | 'ends_with'
  | 'greater_than' 
  | 'less_than' 
  | 'greater_than_or_equal' 
  | 'less_than_or_equal'
  | 'between' 
  | 'in' 
  | 'not_in' 
  | 'is_null' 
  | 'is_not_null'

export interface QueryConfig {
  search?: string
  filters: FilterConfig[]
  sort: SortConfig
  page: number
  pageSize: number
  fields: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

export interface EntityRecord {
  id: string
  [key: string]: any
}

export interface ColumnConfig {
  id: string
  field: string
  displayName: string
  width?: string
  sortable: boolean
  filterable: boolean
  visible: boolean
  order: number
}

export interface TableState {
  columns: ColumnConfig[]
  sort: SortConfig
  filters: FilterConfig[]
  search: string
  page: number
  pageSize: number
  selectedRows: string[]
}
