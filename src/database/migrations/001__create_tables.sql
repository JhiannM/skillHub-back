-- ============================================================
-- SkillHub - Schema PostgreSQL
-- ============================================================

-- ─── Enumeraciones ───────────────────────────────────────────
CREATE TYPE role_enum AS ENUM ('ADMIN', 'CUSTOMER', 'PROVIDER');
CREATE TYPE category_enum AS ENUM (
  'TECNOLOGIA', 'HOGAR', 'SALUD', 'EDUCACION',
  'MECANICA', 'CONSTRUCCION', 'FONTANERIA', 'MANUFACTURA',
  -- Categorías adicionales del frontend
  'EVENTOS', 'TRANSPORTE', 'CREATIVIDAD'
);
CREATE TYPE mode_enum AS ENUM ('DOMICILIO', 'LOCAL');
CREATE TYPE state_enum AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'FINISHED');

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE users (
  id         UUID PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       role_enum   NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Providers ───────────────────────────────────────────────
CREATE TABLE providers (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone               VARCHAR(20),
  city                VARCHAR(100),
  bio                 TEXT,
  skills              JSONB,                  -- array of skill tags
  portfolio_url       VARCHAR(500),
  schedule            JSONB,
  -- Estructura exacta que envía el frontend:
  -- {
  --   "Lunes":     { "enabled": true,  "inicio": "09:00", "fin": "18:00" },
  --   "Martes":    { "enabled": true,  "inicio": "09:00", "fin": "18:00" },
  --   "Miercoles": { "enabled": true,  "inicio": "09:00", "fin": "18:00" },
  --   "Jueves":    { "enabled": true,  "inicio": "09:00", "fin": "18:00" },
  --   "Viernes":   { "enabled": true,  "inicio": "09:00", "fin": "15:00" },
  --   "Sabado":    { "enabled": false, "inicio": null,    "fin": null    },
  --   "Domingo":   { "enabled": false, "inicio": null,    "fin": null    }
  -- }
  base_price          NUMERIC(12, 2),
  service_description TEXT,
  main_category       category_enum,
  years_experience    INTEGER DEFAULT 0,
  services_done       INTEGER DEFAULT 0,      -- used for RF-07 relevance score
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Customers ───────────────────────────────────────────────
CREATE TABLE customers (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone      VARCHAR(20),
  city       VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Services ────────────────────────────────────────────────
CREATE TABLE services (
  id          UUID PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES providers(user_id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  category    category_enum NOT NULL,
  mode        mode_enum     NOT NULL,
  base_price  NUMERIC(12, 2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Requests (Solicitudes) ───────────────────────────────────
CREATE TABLE requests (
  id          UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(user_id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(user_id) ON DELETE CASCADE,
  service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  date        TIMESTAMPTZ NOT NULL,
  notes       TEXT,
  state       state_enum NOT NULL DEFAULT 'PENDING',
  final_price NUMERIC(12, 2),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_providers_category ON providers(main_category);
CREATE INDEX idx_providers_city     ON providers(city);
CREATE INDEX idx_services_provider  ON services(provider_id);
CREATE INDEX idx_requests_customer  ON requests(customer_id);
CREATE INDEX idx_requests_provider  ON requests(provider_id);
CREATE INDEX idx_requests_state     ON requests(state);

-- ─── Seed: Admin user (password: Admin1234) ───────────────────
INSERT INTO users (id, name, email, password, role)
VALUES (
  gen_random_uuid(),
  'Administrador SkillHub',
  'admin@skillhub.com',
  '$2a$12$CwTycUXWue0Thq9StjUM0u9UWpj7bmpqn6LSMRCHEGJvOkJ9GK.K6', -- Admin1234
  'ADMIN'
);