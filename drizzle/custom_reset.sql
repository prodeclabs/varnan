-- Drop tables in the correct order to respect foreign key constraints
DROP TABLE IF EXISTS user_project_contexts;
DROP TABLE IF EXISTS project_contexts;
DROP TABLE IF EXISTS users; 