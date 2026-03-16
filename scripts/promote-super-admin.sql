-- Migration script to set up super_admin role
-- Run this to promote your existing admin to super_admin

-- First, check the current users
SELECT id, name, email, role FROM users;

-- To promote an existing user to super_admin, run:
-- UPDATE users SET role = 'super_admin' WHERE email = 'your-admin-email@example.com';

-- To create a new super_admin user manually, run:
-- INSERT INTO users (name, email, password, role) 
-- VALUES ('Your Name', 'your-email@example.com', 'hashed-password', 'super_admin');

-- The password needs to be hashed with bcrypt. 
-- Use a tool like bcrypt.hashSync('your-password', 10) in Node.js to generate the hash
