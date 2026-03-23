-- Multi-Tenant Migration Script
-- Add user_id to tables for data isolation

-- 1. Add user_id to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 2. Add user_id to conversations table  
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 3. Add user_id to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 4. Modify settings table to be per-user (drop unique constraint on key alone)
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_key_key;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE settings ADD UNIQUE(user_id, key);

-- 5. Create companies table for company data (super admin controls)
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'My Company',
  description TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  website VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create products table linked to company
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Add user_id to AI control tables (faqs, response_templates, content_filters, product_info)
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE response_templates ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE content_filters ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE product_info ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- 8. Create whatsapp_status table for per-user WhatsApp connection status
CREATE TABLE IF NOT EXISTS whatsapp_status (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  connected BOOLEAN DEFAULT false,
  phone VARCHAR(50),
  error TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_faqs_user_id ON faqs(user_id);
CREATE INDEX IF NOT EXISTS idx_response_templates_user_id ON response_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_content_filters_user_id ON content_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_product_info_user_id ON product_info(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_status_user_id ON whatsapp_status(user_id);

-- 10. Insert default company if not exists
INSERT INTO companies (name, description, phone, email, is_active)
VALUES ('KRYROS', 'WhatsApp AI Customer Support System', '+260 966 423 719', 'kryrosmobile@gmail.com', true)
ON CONFLICT DO NOTHING;

-- 11. Migrate existing data: assign existing data to the first super_admin user
-- This assumes there's already a super_admin user
UPDATE contacts SET user_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) WHERE user_id IS NULL;
UPDATE conversations SET user_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) WHERE user_id IS NULL;
UPDATE messages SET user_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) WHERE user_id IS NULL;
UPDATE settings SET user_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) WHERE user_id IS NULL;
UPDATE faqs SET user_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) WHERE user_id IS NULL;
UPDATE response_templates SET user_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) WHERE user_id IS NULL;
UPDATE content_filters SET user_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) WHERE user_id IS NULL;
UPDATE product_info SET user_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) WHERE user_id IS NULL;

-- 12. Update AI control tables sample data with user_id for backward compatibility
UPDATE faqs SET user_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) 
WHERE user_id IS NULL AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'super_admin' LIMIT 1) = false;
UPDATE response_templates SET user_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) 
WHERE user_id IS NULL AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'super_admin' LIMIT 1) = false;
UPDATE content_filters SET user_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) 
WHERE user_id IS NULL AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'super_admin' LIMIT 1) = false;
UPDATE product_info SET user_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1) 
WHERE user_id IS NULL AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'super_admin' LIMIT 1) = false;