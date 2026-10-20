-- ==============================================================================
-- Flyway / Liquibase Compatible Migration: Reconcile database check constraints
-- ==============================================================================

ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check;
ALTER TABLE complaints ADD CONSTRAINT complaints_status_check 
    CHECK (status IN ('PENDING', 'ACCEPTED', 'APPROVED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'));

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('STUDENT', 'ADMIN_WIFI', 'ADMIN_MAINTENANCE', 'ADMIN_MESS', 'ADMIN_ACADEMIC', 'SUPER_ADMIN'));

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_admin_role_check;
ALTER TABLE categories ADD CONSTRAINT categories_admin_role_check 
    CHECK (admin_role IN ('STUDENT', 'ADMIN_WIFI', 'ADMIN_MAINTENANCE', 'ADMIN_MESS', 'ADMIN_ACADEMIC', 'SUPER_ADMIN'));
