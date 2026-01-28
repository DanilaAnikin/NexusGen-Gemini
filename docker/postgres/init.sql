-- NexusGen AI Platform - PostgreSQL Initialization Script
-- This script runs automatically when the PostgreSQL container is first created

-- Enable required extensions
-- uuid-ossp: Generate UUIDs for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgcrypto: Cryptographic functions for password hashing and encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- pg_trgm: Trigram matching for fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- vector: pgvector extension for AI embeddings and vector similarity search
CREATE EXTENSION IF NOT EXISTS "vector";

-- Verify extensions are installed
DO $$
DECLARE
    ext_name TEXT;
    required_extensions TEXT[] := ARRAY['uuid-ossp', 'pgcrypto', 'pg_trgm', 'vector'];
BEGIN
    FOREACH ext_name IN ARRAY required_extensions
    LOOP
        IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = ext_name) THEN
            RAISE EXCEPTION 'Required extension % is not installed', ext_name;
        ELSE
            RAISE NOTICE 'Extension % is installed and ready', ext_name;
        END IF;
    END LOOP;
END $$;

-- Grant necessary permissions to the default user
GRANT ALL PRIVILEGES ON DATABASE nexusgen TO nexusgen;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'NexusGen PostgreSQL initialization completed successfully';
END $$;
