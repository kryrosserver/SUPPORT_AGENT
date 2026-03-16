-- AI Control System - Database Tables

-- FAQ Table - Store frequently asked questions and answers
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Response Templates - Pre-written responses for common situations
CREATE TABLE IF NOT EXISTS response_templates (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  trigger_keywords TEXT NOT NULL,
  response TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Filters - Block certain topics or questions
CREATE TABLE IF NOT EXISTS content_filters (
  id SERIAL PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  filter_type VARCHAR(50) DEFAULT 'block' CHECK (filter_type IN ('block', 'warning', 'escalate')),
  response_message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product/Service Information
CREATE TABLE IF NOT EXISTS product_info (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  price VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category) VALUES 
  ('What are your business hours?', 'Our business hours are Monday to Friday, 8:00 AM to 6:00 PM.', 'General'),
  ('How can I contact support?', 'You can reach us at +260 966 423 719 or email kryrosmobile@gmail.com', 'Support'),
  ('What is your return policy?', 'We offer a 30-day return policy for all unused items in original packaging.', 'Products')
ON CONFLICT DO NOTHING;

-- Insert sample response templates
INSERT INTO response_templates (title, trigger_keywords, response, category) VALUES
  ('Greeting', 'hello,hi,hey,good morning', 'Hello! Thank you for contacting KRYROS support. How can I help you today?', 'Greetings'),
  ('Thank You', 'thanks,thank you,appreciate', 'You''re welcome! Is there anything else I can help you with?', 'Common'),
  ('Closing', 'bye,goodbye,see you,thanks bye', 'Thank you for contacting us! Have a great day!', 'Closing')
ON CONFLICT DO NOTHING;

-- Insert sample content filters
INSERT INTO content_filters (keyword, filter_type, response_message) VALUES
  ('refund', 'escalate', 'I''ll connect you with a human agent who can help with your refund request.'),
  ('complaint', 'escalate', 'I understand your concern. Let me connect you with a human agent immediately.'),
  ('legal', 'warning', 'For legal matters, please contact our legal team at legal@kryros.com')
ON CONFLICT DO NOTHING;

-- Insert sample product info
INSERT INTO product_info (title, description, category, price) VALUES
  ('KRYROS Basic Plan', 'Entry-level support package with AI-powered responses', 'Plans', '$29/month'),
  ('KRYROS Pro Plan', 'Advanced support with human takeover and analytics', 'Plans', '$79/month'),
  ('KRYROS Enterprise', 'Full-featured support with dedicated account manager', 'Plans', 'Contact us')
ON CONFLICT DO NOTHING;
