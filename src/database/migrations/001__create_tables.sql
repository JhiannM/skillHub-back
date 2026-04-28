-- Crear tipos ENUM
CREATE TYPE role_enum AS ENUM ('ADMIN', 'PROVIDER', 'CUSTOMER');

-- Crear tabla Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role role_enum NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de proveedores
CREATE TABLE providers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  city VARCHAR(100),
  bio TEXT,
  skills TEXT[],
  portfolio_url TEXT,
  services_done INTEGER DEFAULT 0,
  schedule JSONB
);

-- Crear tabla de clientes
CREATE TABLE customers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  city VARCHAR(100)
);

