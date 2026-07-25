BEGIN;

-- 2. CREATE EXTENSION
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. CREATE TYPE (ENUM)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'EMPLOYEE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_status') THEN
        CREATE TYPE employment_status AS ENUM ('ACTIVE', 'RESIGNED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ALPHA');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payroll_status') THEN
        CREATE TYPE payroll_status AS ENUM ('DRAFT', 'APPROVED', 'PAID');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payroll_component_type') THEN
        CREATE TYPE payroll_component_type AS ENUM ('INCOME', 'DEDUCTION');
    END IF;
END$$;

-- 4. CREATE TABLE

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. payroll_periods
CREATE TABLE IF NOT EXISTS payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name VARCHAR(100) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    working_days INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_payroll_periods_dates CHECK (start_date <= end_date),
    CONSTRAINT chk_payroll_periods_working_days CHECK (working_days >= 0)
);

-- 4. positions
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    basic_salary NUMERIC(15,2) NOT NULL,
    position_allowance NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_positions_department FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_positions_basic_salary CHECK (basic_salary >= 0),
    CONSTRAINT chk_positions_allowance CHECK (position_allowance >= 0)
);

-- 5. employees
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    position_id UUID NOT NULL,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(20),
    phone VARCHAR(50),
    address TEXT,
    join_date DATE NOT NULL,
    resign_date DATE,
    employment_status employment_status NOT NULL DEFAULT 'ACTIVE',
    salary_override NUMERIC(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_employees_position FOREIGN KEY (position_id) REFERENCES positions(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_employees_salary_override CHECK (salary_override >= 0 OR salary_override IS NULL)
);

-- 6. attendance_records
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    payroll_period_id UUID NOT NULL,
    attendance_date DATE NOT NULL,
    status attendance_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_attendance_period FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT unq_attendance_employee_date UNIQUE (employee_id, attendance_date)
);

-- 7. overtime_records
CREATE TABLE IF NOT EXISTS overtime_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    payroll_period_id UUID NOT NULL,
    overtime_date DATE NOT NULL,
    hours NUMERIC(5,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_overtime_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_overtime_period FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_overtime_hours CHECK (hours > 0)
);

-- 8. bonus_records
CREATE TABLE IF NOT EXISTS bonus_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    payroll_period_id UUID NOT NULL,
    bonus_name VARCHAR(100) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_bonus_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_bonus_period FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_bonus_amount CHECK (amount > 0)
);

-- 9. payrolls
CREATE TABLE IF NOT EXISTS payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_period_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    basic_salary NUMERIC(15,2) NOT NULL,
    position_allowance NUMERIC(15,2) NOT NULL,
    gross_salary NUMERIC(15,2) NOT NULL,
    total_deduction NUMERIC(15,2) NOT NULL,
    net_salary NUMERIC(15,2) NOT NULL,
    status payroll_status NOT NULL DEFAULT 'DRAFT',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_payrolls_period FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_payrolls_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT unq_payrolls_employee_period UNIQUE (employee_id, payroll_period_id),
    CONSTRAINT chk_payrolls_basic_salary CHECK (basic_salary >= 0),
    CONSTRAINT chk_payrolls_allowance CHECK (position_allowance >= 0),
    CONSTRAINT chk_payrolls_gross_salary CHECK (gross_salary >= 0),
    CONSTRAINT chk_payrolls_total_deduction CHECK (total_deduction >= 0),
    CONSTRAINT chk_payrolls_net_salary CHECK (net_salary >= 0)
);

-- 10. payroll_details
CREATE TABLE IF NOT EXISTS payroll_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_id UUID NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    component_type payroll_component_type NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_payroll_details_payroll FOREIGN KEY (payroll_id) REFERENCES payrolls(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_payroll_details_amount CHECK (amount >= 0)
);

-- 6. Index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_positions_department_id ON positions(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_position_id ON employees(position_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_payroll_period_id ON attendance_records(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_overtime_records_employee_id ON overtime_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_overtime_records_payroll_period_id ON overtime_records(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_bonus_records_employee_id ON bonus_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_bonus_records_payroll_period_id ON bonus_records(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payrolls_employee_id ON payrolls(employee_id);
CREATE INDEX IF NOT EXISTS idx_payrolls_payroll_period_id ON payrolls(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_details_payroll_id ON payroll_details(payroll_id);

-- 7. Seed Data
-- Users
-- Default password for all seeded accounts: Password123!
INSERT INTO users (id, email, password_hash, role, is_active) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@example.com', '$2b$10$kqEq6Z4IPdK6uU3AKLb.J.3uUnUaz6y.S/0lJQGFD.jh7VYCMVVnG', 'ADMIN', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'john@example.com', '$2b$10$kqEq6Z4IPdK6uU3AKLb.J.3uUnUaz6y.S/0lJQGFD.jh7VYCMVVnG', 'EMPLOYEE', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'jane@example.com', '$2b$10$kqEq6Z4IPdK6uU3AKLb.J.3uUnUaz6y.S/0lJQGFD.jh7VYCMVVnG', 'EMPLOYEE', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bob@example.com', '$2b$10$kqEq6Z4IPdK6uU3AKLb.J.3uUnUaz6y.S/0lJQGFD.jh7VYCMVVnG', 'EMPLOYEE', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'alice@example.com', '$2b$10$kqEq6Z4IPdK6uU3AKLb.J.3uUnUaz6y.S/0lJQGFD.jh7VYCMVVnG', 'EMPLOYEE', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'charlie@example.com', '$2b$10$kqEq6Z4IPdK6uU3AKLb.J.3uUnUaz6y.S/0lJQGFD.jh7VYCMVVnG', 'EMPLOYEE', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'dave@example.com', '$2b$10$kqEq6Z4IPdK6uU3AKLb.J.3uUnUaz6y.S/0lJQGFD.jh7VYCMVVnG', 'EMPLOYEE', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'eve@example.com', '$2b$10$kqEq6Z4IPdK6uU3AKLb.J.3uUnUaz6y.S/0lJQGFD.jh7VYCMVVnG', 'EMPLOYEE', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'frank@example.com', '$2b$10$kqEq6Z4IPdK6uU3AKLb.J.3uUnUaz6y.S/0lJQGFD.jh7VYCMVVnG', 'EMPLOYEE', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'grace@example.com', '$2b$10$kqEq6Z4IPdK6uU3AKLb.J.3uUnUaz6y.S/0lJQGFD.jh7VYCMVVnG', 'EMPLOYEE', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'heidi@example.com', '$2b$10$kqEq6Z4IPdK6uU3AKLb.J.3uUnUaz6y.S/0lJQGFD.jh7VYCMVVnG', 'EMPLOYEE', true)
ON CONFLICT (email) DO NOTHING;

-- Departments
INSERT INTO departments (id, code, name, description) VALUES
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'HR', 'Human Resources', 'HR Department'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'FIN', 'Finance', 'Finance Department'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'IT', 'Information Technology', 'IT Department'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'MKT', 'Marketing', 'Marketing Department')
ON CONFLICT (code) DO NOTHING;

-- Positions
INSERT INTO positions (id, department_id, code, name, basic_salary, position_allowance) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'HR-MGR', 'HR Manager', 15000000.00, 2000000.00),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'HR-STF', 'HR Staff', 7000000.00, 500000.00),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'FIN-STF', 'Finance Staff', 7500000.00, 500000.00),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'FIN-ACC', 'Accountant', 10000000.00, 1000000.00),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'IT-PRG', 'Programmer', 12000000.00, 1000000.00),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'IT-SA', 'System Analyst', 16000000.00, 1500000.00),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'MKT-STF', 'Marketing Staff', 8000000.00, 750000.00)
ON CONFLICT (code) DO NOTHING;

-- Employees
INSERT INTO employees (id, user_id, position_id, employee_code, full_name, join_date, employment_status) VALUES
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'EMP001', 'Admin Person', '2023-01-01', 'ACTIVE'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'EMP002', 'John Doe', '2023-02-01', 'ACTIVE'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'EMP003', 'Jane Doe', '2023-03-01', 'ACTIVE'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'EMP004', 'Bob Smith', '2023-04-01', 'ACTIVE'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'EMP005', 'Alice Jones', '2023-05-01', 'ACTIVE'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'EMP006', 'Charlie Brown', '2023-06-01', 'ACTIVE'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'EMP007', 'Dave Wilson', '2023-07-01', 'ACTIVE'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'EMP008', 'Eve White', '2023-08-01', 'ACTIVE'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'EMP009', 'Frank Green', '2023-09-01', 'ACTIVE'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'EMP010', 'Grace Hall', '2023-10-01', 'ACTIVE')
ON CONFLICT (employee_code) DO NOTHING;

-- Payroll Periods
INSERT INTO payroll_periods (id, period_name, start_date, end_date, working_days) VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Jan 2024', '2024-01-01', '2024-01-31', 22),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Feb 2024', '2024-02-01', '2024-02-29', 21)
ON CONFLICT (period_name) DO NOTHING;

-- Attendance Records
INSERT INTO attendance_records (employee_id, payroll_period_id, attendance_date, status) VALUES
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-01-02', 'PRESENT'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-01-03', 'PRESENT')
ON CONFLICT (employee_id, attendance_date) DO NOTHING;

-- Overtime Records
INSERT INTO overtime_records (employee_id, payroll_period_id, overtime_date, hours, description) VALUES
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-01-02', 2.5, 'Project Deadline')
ON CONFLICT DO NOTHING;

-- Bonus Records
INSERT INTO bonus_records (employee_id, payroll_period_id, bonus_name, amount, description) VALUES
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Performance Bonus', 1000000.00, 'Excellent Work')
ON CONFLICT DO NOTHING;

-- Payrolls
INSERT INTO payrolls (id, payroll_period_id, employee_id, basic_salary, position_allowance, gross_salary, total_deduction, net_salary, status) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 7000000.00, 500000.00, 8500000.00, 500000.00, 8000000.00, 'PAID')
ON CONFLICT (employee_id, payroll_period_id) DO NOTHING;

-- Payroll Details
INSERT INTO payroll_details (payroll_id, component_name, component_type, amount) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Basic Salary', 'INCOME', 7000000.00),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Position Allowance', 'INCOME', 500000.00),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Performance Bonus', 'INCOME', 1000000.00),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BPJS', 'DEDUCTION', 250000.00),
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tax', 'DEDUCTION', 250000.00)
ON CONFLICT DO NOTHING;

COMMIT;

