-- Insert admin user with bcrypt hashed password for @9010Admin
-- Hash generated with bcrypt cost factor 10
INSERT INTO users (name, email, password, role)
VALUES (
  'Admin',
  'kryrosmobile@gmail.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.w8FwFOSH9P3ggqTH.u',
  'admin'
) ON CONFLICT (email) DO NOTHING;
