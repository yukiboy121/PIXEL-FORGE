-- PixelForge PostgreSQL schema
-- Run with: psql "$DATABASE_URL" -f src/db/init.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  original_width INTEGER NOT NULL,
  original_height INTEGER NOT NULL,
  format TEXT NOT NULL,
  analysis JSONB,
  adjustments JSONB,
  history JSONB,
  thumbnail_data_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
