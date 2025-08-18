-- Fix polymorphic foreign key constraints for contact info tables
-- This migration removes conflicting foreign key constraints that prevent
-- polymorphic relationships from working properly

-- Email Addresses
ALTER TABLE email_addresses DROP CONSTRAINT IF EXISTS fk_companies_email_addresses;
ALTER TABLE email_addresses DROP CONSTRAINT IF EXISTS fk_leads_email_addresses;
ALTER TABLE email_addresses DROP CONSTRAINT IF EXISTS fk_users_email_addresses;

-- Phone Numbers
ALTER TABLE phone_numbers DROP CONSTRAINT IF EXISTS fk_companies_phone_numbers;
ALTER TABLE phone_numbers DROP CONSTRAINT IF EXISTS fk_leads_phone_numbers;
ALTER TABLE phone_numbers DROP CONSTRAINT IF EXISTS fk_users_phone_numbers;

-- Addresses
ALTER TABLE addresses DROP CONSTRAINT IF EXISTS fk_companies_addresses;
ALTER TABLE addresses DROP CONSTRAINT IF EXISTS fk_leads_addresses;
ALTER TABLE addresses DROP CONSTRAINT IF EXISTS fk_users_addresses;

-- Social Media Accounts
ALTER TABLE social_media_accounts DROP CONSTRAINT IF EXISTS fk_companies_social_media_accounts;
ALTER TABLE social_media_accounts DROP CONSTRAINT IF EXISTS fk_leads_social_media_accounts;
ALTER TABLE social_media_accounts DROP CONSTRAINT IF EXISTS fk_users_social_media_accounts;

-- Add comments to document the polymorphic relationships
COMMENT ON TABLE email_addresses IS 'Polymorphic table for email addresses. EntityID references different tables based on EntityType.';
COMMENT ON TABLE phone_numbers IS 'Polymorphic table for phone numbers. EntityID references different tables based on EntityType.';
COMMENT ON TABLE addresses IS 'Polymorphic table for addresses. EntityID references different tables based on EntityType.';
COMMENT ON TABLE social_media_accounts IS 'Polymorphic table for social media accounts. EntityID references different tables based on EntityType.';
