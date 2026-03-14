-- KRYROS WhatsApp AI Support Dashboard - Reset & Create Database

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table for authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table for WhatsApp contacts
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'AI' CHECK (status IN ('AI', 'HUMAN')),
  last_message TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('customer', 'ai', 'agent')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table for app configuration
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_contacts_phone ON contacts(phone);

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
  ('ai_enabled', 'true'),
  ('ai_system_prompt', 'You are the customer support assistant for KRYROS.

Company contact information:
Phone: +260 966 423 719
Email: kryrosmobile@gmail.com

Respond politely and clearly to customer questions.

If the customer asks to speak with a human agent, stop responding and allow a human support agent to take over.'),
  ('human_takeover_keywords', 'human,agent,support,help,talk to human'),
  ('company_name', 'KRYROS'),
  ('support_phone', '+260 966 423 719'),
  ('support_email', 'kryrosmobile@gmail.com');

-- Insert admin user with bcrypt hashed password for @9010Admin
INSERT INTO users (name, email, password, role)
VALUES (
  'Admin',
  'kryrosmobile@gmail.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.w8FwFOSH9P3ggqTH.u',
  'admin'
);
