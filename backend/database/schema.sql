-- ============================================================
-- Dayflow HRMS — PostgreSQL Schema
-- Run with: psql -U your_user -d dayflow_db -f schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- USERS (authentication) ----------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login_id        VARCHAR(30) UNIQUE NOT NULL,       -- e.g. OIJODO20260001
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'employee'
                        CHECK (role IN ('admin', 'hr_officer', 'employee')),
    is_verified     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ---------- EMPLOYEES (profile) ----------
CREATE TABLE IF NOT EXISTS employees (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name           VARCHAR(150) NOT NULL,
    phone               VARCHAR(20),
    address             TEXT,
    company_name        VARCHAR(150),
    department          VARCHAR(100),
    manager_id          UUID REFERENCES employees(id) ON DELETE SET NULL,
    job_position         VARCHAR(100),
    location            VARCHAR(100),
    date_of_joining      DATE,
    date_of_birth        DATE,
    nationality          VARCHAR(80),
    gender               VARCHAR(20),
    marital_status        VARCHAR(30),
    personal_email        VARCHAR(150),
    profile_picture_url   TEXT,
    about                 TEXT,
    skills                TEXT[],
    certifications        TEXT[],
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW()
);

-- ---------- ATTENDANCE ----------
CREATE TABLE IF NOT EXISTS attendance (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    check_in_time   TIMESTAMPTZ,
    check_out_time  TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'absent'
                        CHECK (status IN ('present', 'absent', 'half-day', 'leave')),
    work_hours      NUMERIC(5,2) DEFAULT 0,
    extra_hours     NUMERIC(5,2) DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE (employee_id, date)
);

-- ---------- LEAVE REQUESTS ----------
CREATE TABLE IF NOT EXISTS leave_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type      VARCHAR(20) NOT NULL CHECK (leave_type IN ('paid', 'sick', 'unpaid')),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    remarks         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by     UUID REFERENCES employees(id) ON DELETE SET NULL,
    admin_comment   TEXT,
    attachment_url  TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ---------- SALARY STRUCTURE ----------
CREATE TABLE IF NOT EXISTS salary_structure (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id             UUID UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    monthly_wage            NUMERIC(12,2) NOT NULL DEFAULT 0,
    yearly_wage             NUMERIC(12,2) GENERATED ALWAYS AS (monthly_wage * 12) STORED,
    basic_salary            NUMERIC(12,2) DEFAULT 0,   -- 50% of wage
    hra                     NUMERIC(12,2) DEFAULT 0,   -- 50% of basic
    standard_allowance      NUMERIC(12,2) DEFAULT 0,   -- 16.67% of basic
    performance_bonus       NUMERIC(12,2) DEFAULT 0,   -- 8.33% of basic
    leave_travel_allowance  NUMERIC(12,2) DEFAULT 0,   -- 8.33% of basic
    fixed_allowance         NUMERIC(12,2) DEFAULT 0,   -- remainder
    pf_employee             NUMERIC(12,2) DEFAULT 0,   -- 12% of basic
    pf_employer             NUMERIC(12,2) DEFAULT 0,   -- 12% of basic
    professional_tax        NUMERIC(12,2) DEFAULT 200,
    working_days_per_week   SMALLINT DEFAULT 5,
    break_time_hours        NUMERIC(4,2) DEFAULT 1,
    updated_at              TIMESTAMP DEFAULT NOW()
);

-- ---------- BANK / PRIVATE DETAILS ----------
CREATE TABLE IF NOT EXISTS bank_details (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    account_number  VARCHAR(40),
    bank_name       VARCHAR(100),
    ifsc_code       VARCHAR(20),
    pan_no          VARCHAR(20),
    uan_no          VARCHAR(20),
    emp_code        VARCHAR(30)
);

-- ---------- Helpful indexes ----------
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_employee_status ON leave_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_id);
