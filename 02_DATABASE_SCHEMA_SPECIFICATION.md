# 02_DATABASE_SCHEMA_SPECIFICATION

## Sistem Informasi Penggajian Berbasis Web

Dokumen ini merupakan spesifikasi teknis database yang menjadi acuan
langsung sebelum pembuatan ERD, SQL PostgreSQL, Seed Data, API Design,
dan implementasi.

> Dokumen ini melengkapi **01_DATABASE_BLUEPRINT** dan **tidak
> mengubah** business rule maupun keputusan desain yang telah dinyatakan
> final.

------------------------------------------------------------------------

# 1. Foreign Key Specification

  ----------------------------------------------------------------------------------------------
  Child Table          Column              Parent Table      Reference   ON UPDATE   ON DELETE
  -------------------- ------------------- ----------------- ----------- ----------- -----------
  positions            department_id       departments       id          CASCADE     RESTRICT

  employees            user_id             users             id          CASCADE     RESTRICT

  employees            position_id         positions         id          CASCADE     RESTRICT

  attendance_records   employee_id         employees         id          CASCADE     RESTRICT

  attendance_records   payroll_period_id   payroll_periods   id          CASCADE     RESTRICT

  overtime_records     employee_id         employees         id          CASCADE     RESTRICT

  overtime_records     payroll_period_id   payroll_periods   id          CASCADE     RESTRICT

  bonus_records        employee_id         employees         id          CASCADE     RESTRICT

  bonus_records        payroll_period_id   payroll_periods   id          CASCADE     RESTRICT

  payrolls             employee_id         employees         id          CASCADE     RESTRICT

  payrolls             payroll_period_id   payroll_periods   id          CASCADE     RESTRICT

  payroll_details      payroll_id          payrolls          id          CASCADE     CASCADE
  ----------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 2. Constraint Specification

## users

-   PK(id)
-   UNIQUE(email)
-   NOT NULL(password_hash)
-   DEFAULT(is_active = TRUE)

## departments

-   PK(id)
-   UNIQUE(code)
-   UNIQUE(name)

## positions

-   PK(id)
-   FK(department_id)
-   UNIQUE(code)
-   CHECK(basic_salary \>= 0)
-   CHECK(position_allowance \>= 0)

## employees

-   PK(id)
-   FK(user_id)
-   FK(position_id)
-   UNIQUE(employee_code)
-   UNIQUE(user_id)
-   CHECK(salary_override \>= 0)

## attendance_records

-   PK(id)
-   FK(employee_id)
-   FK(payroll_period_id)
-   UNIQUE(employee_id, attendance_date)

## overtime_records

-   PK(id)
-   FK(employee_id)
-   FK(payroll_period_id)
-   CHECK(hours \> 0)

## bonus_records

-   PK(id)
-   FK(employee_id)
-   FK(payroll_period_id)
-   CHECK(amount \> 0)

## payroll_periods

-   PK(id)
-   UNIQUE(period_name)
-   CHECK(start_date \<= end_date)
-   CHECK(working_days \>= 0)

## payrolls

-   PK(id)
-   FK(employee_id)
-   FK(payroll_period_id)
-   UNIQUE(employee_id, payroll_period_id)
-   CHECK(basic_salary \>= 0)
-   CHECK(position_allowance \>= 0)
-   CHECK(gross_salary \>= 0)
-   CHECK(total_deduction \>= 0)
-   CHECK(net_salary \>= 0)

## payroll_details

-   PK(id)
-   FK(payroll_id)
-   CHECK(amount \>= 0)

------------------------------------------------------------------------

# 3. Index Specification

  Table                Index
  -------------------- -------------------
  users                email
  departments          code
  positions            department_id
  employees            employee_code
  employees            user_id
  employees            position_id
  attendance_records   employee_id
  attendance_records   payroll_period_id
  overtime_records     employee_id
  overtime_records     payroll_period_id
  bonus_records        employee_id
  bonus_records        payroll_period_id
  payrolls             employee_id
  payrolls             payroll_period_id
  payroll_details      payroll_id

------------------------------------------------------------------------

# 4. Enum Specification

## user_role

-   ADMIN
-   EMPLOYEE

## employment_status

-   ACTIVE
-   RESIGNED

## attendance_status

-   PRESENT
-   ALPHA

## payroll_status

-   DRAFT
-   APPROVED
-   PAID

## payroll_component_type

-   INCOME
-   DEDUCTION

------------------------------------------------------------------------

# 5. Naming Convention

## Table

-   snake_case
-   plural

## Column

-   snake_case

## Primary Key

-   id

## Foreign Key

-   \*\_id

## Timestamp

-   created_at
-   updated_at

## Boolean

-   is\_\*
-   has\_\*

------------------------------------------------------------------------

# 6. Database Integrity Rules

-   Seluruh Foreign Key menggunakan ON UPDATE CASCADE.
-   Data master menggunakan ON DELETE RESTRICT.
-   payroll_details menggunakan ON DELETE CASCADE terhadap payrolls.
-   Seluruh tabel memiliki created_at.
-   Tabel yang dapat diubah memiliki updated_at.
-   Nilai nominal tidak boleh bernilai negatif.

------------------------------------------------------------------------

# Status Dokumen

Status: FINAL

Tahap berikutnya: 1. ERD Final 2. SQL CREATE TABLE PostgreSQL 3. Seed
Data 4. API Design 5. Implementasi
