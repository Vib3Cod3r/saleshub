-- Add owner_contact_id field to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS owner_contact_id UUID;
ALTER TABLE companies ADD CONSTRAINT fk_companies_owner_contact FOREIGN KEY (owner_contact_id) REFERENCES contacts(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_companies_owner_contact_id ON companies(owner_contact_id);
