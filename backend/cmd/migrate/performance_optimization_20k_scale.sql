-- Performance Optimization Migration for 20K Scale
-- This migration adds critical indexes for optimal performance with 20,000 contacts and 20,000 companies

-- ============================================================================
-- CONTACTS TABLE OPTIMIZATIONS
-- ============================================================================

-- Primary lookup indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts(owner_id);

-- Name-based search indexes (composite for better performance)
CREATE INDEX IF NOT EXISTS idx_contacts_name_search ON contacts(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_contacts_last_name_first_name ON contacts(last_name, first_name);

-- Chronological indexes for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON contacts(updated_at DESC);

-- Communication preference indexes for marketing queries
CREATE INDEX IF NOT EXISTS idx_contacts_email_opt_in ON contacts(email_opt_in) WHERE email_opt_in = true;
CREATE INDEX IF NOT EXISTS idx_contacts_sms_opt_in ON contacts(sms_opt_in) WHERE sms_opt_in = true;
CREATE INDEX IF NOT EXISTS idx_contacts_call_opt_in ON contacts(call_opt_in) WHERE call_opt_in = true;

-- Source tracking index
CREATE INDEX IF NOT EXISTS idx_contacts_original_source ON contacts(original_source);

-- ============================================================================
-- COMPANIES TABLE OPTIMIZATIONS
-- ============================================================================

-- Primary lookup indexes for companies
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_assigned_to ON companies(assigned_to);
CREATE INDEX IF NOT EXISTS idx_companies_industry_id ON companies(industry_id);
CREATE INDEX IF NOT EXISTS idx_companies_size_id ON companies(size_id);

-- Name-based search indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_name_lower ON companies(LOWER(name));

-- Chronological indexes
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_updated_at ON companies(updated_at DESC);

-- Business intelligence indexes
CREATE INDEX IF NOT EXISTS idx_companies_employee_count ON companies(employee_count);
CREATE INDEX IF NOT EXISTS idx_companies_annual_revenue ON companies(annual_revenue);
CREATE INDEX IF NOT EXISTS idx_companies_founded_year ON companies(founded_year);

-- Lead management indexes
CREATE INDEX IF NOT EXISTS idx_companies_lead_score ON companies(lead_score);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_priority ON companies(priority);

-- Follow-up and activity indexes
CREATE INDEX IF NOT EXISTS idx_companies_last_contact_date ON companies(last_contact_date);
CREATE INDEX IF NOT EXISTS idx_companies_next_follow_up_date ON companies(next_follow_up_date);

-- Industry and sector indexes
CREATE INDEX IF NOT EXISTS idx_companies_industry_sector ON companies(industry_sector);

-- ============================================================================
-- POLYMORPHIC CONTACT INFO TABLES OPTIMIZATIONS
-- ============================================================================

-- Email addresses optimization
CREATE INDEX IF NOT EXISTS idx_email_addresses_entity_composite ON email_addresses(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_email_addresses_email ON email_addresses(email);
CREATE INDEX IF NOT EXISTS idx_email_addresses_type ON email_addresses(type_id);

-- Phone numbers optimization
CREATE INDEX IF NOT EXISTS idx_phone_numbers_entity_composite ON phone_numbers(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_number ON phone_numbers(number);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_type ON phone_numbers(type_id);

-- Addresses optimization
CREATE INDEX IF NOT EXISTS idx_addresses_entity_composite ON addresses(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_addresses_type ON addresses(type_id);
CREATE INDEX IF NOT EXISTS idx_addresses_city ON addresses(city);
CREATE INDEX IF NOT EXISTS idx_addresses_state ON addresses(state);
CREATE INDEX IF NOT EXISTS idx_addresses_country ON addresses(country);

-- Social media optimization
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_entity_composite ON social_media_accounts(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_type ON social_media_accounts(type_id);
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_platform ON social_media_accounts(platform);

-- ============================================================================
-- CUSTOM FIELDS OPTIMIZATIONS (FOR SCALABILITY)
-- ============================================================================

-- Custom field values optimization for flexible schema
CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity_composite ON custom_field_values(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_field_id ON custom_field_values(field_id);

-- Custom field definitions optimization
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_tenant_entity ON custom_field_definitions(tenant_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_active ON custom_field_definitions(is_active) WHERE is_active = true;

-- ============================================================================
-- ACTIVITY AND AUDIT OPTIMIZATIONS
-- ============================================================================

-- Activity logs optimization
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_composite ON activity_logs(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================

-- Contact queries by company and tenant
CREATE INDEX IF NOT EXISTS idx_contacts_company_tenant ON contacts(company_id, tenant_id);

-- Company queries by tenant and assigned user
CREATE INDEX IF NOT EXISTS idx_companies_tenant_assigned ON companies(tenant_id, assigned_to);

-- Company queries by tenant and industry
CREATE INDEX IF NOT EXISTS idx_companies_tenant_industry ON companies(tenant_id, industry_id);

-- Contact queries by tenant and owner
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_owner ON contacts(tenant_id, owner_id);

-- ============================================================================
-- PARTIAL INDEXES FOR ACTIVE RECORDS
-- ============================================================================

-- Only index active contacts (not deleted)
CREATE INDEX IF NOT EXISTS idx_contacts_active ON contacts(tenant_id, company_id) WHERE deleted_at IS NULL;

-- Only index active companies (not deleted)
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(tenant_id, assigned_to) WHERE deleted_at IS NULL;

-- ============================================================================
-- TEXT SEARCH OPTIMIZATIONS
-- ============================================================================

-- Enable full-text search on company names
CREATE INDEX IF NOT EXISTS idx_companies_name_gin ON companies USING gin(to_tsvector('english', name));

-- Enable full-text search on contact names
CREATE INDEX IF NOT EXISTS idx_contacts_name_gin ON contacts USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- ============================================================================
-- STATISTICS AND ANALYTICS
-- ============================================================================

-- Update table statistics for query planner optimization
ANALYZE contacts;
ANALYZE companies;
ANALYZE email_addresses;
ANALYZE phone_numbers;
ANALYZE addresses;
ANALYZE social_media_accounts;
ANALYZE custom_field_values;
ANALYZE activity_logs;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_contacts_company_id IS 'Optimized for company-contact relationship queries';
COMMENT ON INDEX idx_contacts_tenant_id IS 'Critical for multi-tenant data isolation';
COMMENT ON INDEX idx_contacts_name_search IS 'Optimized for name-based searches';
COMMENT ON INDEX idx_companies_name IS 'Optimized for company name searches';
COMMENT ON INDEX idx_companies_tenant_id IS 'Critical for multi-tenant data isolation';
COMMENT ON INDEX idx_email_addresses_entity_composite IS 'Optimized for polymorphic email queries';
COMMENT ON INDEX idx_phone_numbers_entity_composite IS 'Optimized for polymorphic phone queries';
COMMENT ON INDEX idx_custom_field_values_entity_composite IS 'Optimized for flexible schema queries';
