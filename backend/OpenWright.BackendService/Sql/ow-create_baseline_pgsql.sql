-- OpenWright create SQL baseline schema
-- version: 1

-- users

CREATE TABLE ow_user (
    ow_usr_user_id uuid PRIMARY KEY,
    ow_usr_version int NOT NULL,
    ow_usr_email_address text NOT NULL,
    ow_usr_first_name text,
    ow_usr_last_name text
);

-- organizations

CREATE TABLE ow_organization (
    ow_org_organization_id uuid PRIMARY KEY,
    ow_org_version int NOT NULL,
    ow_org_name text NOT NULL,
    ow_org_url_slug text NOT NULL,
    ow_org_is_active boolean NOT NULL,
    ow_org_created_by_user_id uuid NOT NULL REFERENCES ow_user DEFERRABLE INITIALLY DEFERRED,
    ow_org_create_date timestamptz
);

CREATE UNIQUE INDEX ow_organization_url_slug_idx ON ow_organization (ow_org_url_slug);

-- projects

CREATE TABLE ow_project (
    ow_pro_project_id uuid PRIMARY KEY,
    ow_pro_version int NOT NULL,
    ow_pro_tenant_id uuid NOT NULL REFERENCES ow_organization DEFERRABLE INITIALLY DEFERRED,
    ow_pro_name text NOT NULL,
    ow_pro_description text
);

-- suites

CREATE TABLE ow_spec_file (
    ow_spf_spec_file_id uuid PRIMARY KEY,
    ow_spf_version int NOT NULL,
    ow_spf_tenant_id uuid NOT NULL REFERENCES ow_organization DEFERRABLE INITIALLY DEFERRED,
    ow_spf_project_id uuid NOT NULL REFERENCES ow_project ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ow_spf_name text NOT NULL,
    ow_spf_path text NOT NULL
);

CREATE UNIQUE INDEX ow_spec_file_path_project_idx ON ow_spec_file (ow_spf_path, ow_spf_project_id);

CREATE TABLE ow_suite (
    ow_sui_suite_id uuid PRIMARY KEY,
    ow_sui_version int NOT NULL,
    ow_sui_tenant_id uuid NOT NULL REFERENCES ow_organization DEFERRABLE INITIALLY DEFERRED,
    ow_sui_project_id uuid NOT NULL REFERENCES ow_project ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ow_sui_parent_suite_id uuid REFERENCES ow_suite ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ow_sui_title text
);

CREATE UNIQUE INDEX ow_suite_title_project_idx ON ow_suite (ow_sui_title, ow_sui_project_id) 
WHERE ow_sui_parent_suite_id IS NULL AND ow_sui_title IS NOT NULL;

CREATE UNIQUE INDEX ow_suite_title_parent_idx ON ow_suite (ow_sui_title, ow_sui_parent_suite_id) 
WHERE ow_sui_parent_suite_id IS NOT NULL AND ow_sui_title IS NOT NULL;

CREATE TABLE ow_case (
    ow_cas_case_id uuid PRIMARY KEY,
    ow_cas_version int NOT NULL,
    ow_cas_suite_id uuid NOT NULL REFERENCES ow_suite DEFERRABLE INITIALLY DEFERRED,
    ow_cas_title text NOT NULL,
    ow_cas_spec_file_id uuid REFERENCES ow_spec_file DEFERRABLE INITIALLY DEFERRED,
    ow_cas_file_location jsonb,
    ow_cas_tags text[] NOT NULL,
    ow_cas_annotations jsonb NOT NULL
);

CREATE UNIQUE INDEX ow_case_title_suite_idx ON ow_case (ow_cas_title, ow_cas_suite_id);

-- runs

CREATE TABLE ow_run (
    ow_run_run_id uuid PRIMARY KEY,
    ow_run_version int NOT NULL,
    ow_run_tenant_id uuid NOT NULL REFERENCES ow_organization DEFERRABLE INITIALLY DEFERRED,
    ow_run_project_id uuid NOT NULL REFERENCES ow_project ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ow_run_start_date timestamptz NOT NULL,
    ow_run_duration interval,
    ow_run_description text,
    ow_run_pull_request_number int,
    ow_run_commit_info jsonb,
    ow_run_actor jsonb
);

CREATE TYPE ow_test_status AS ENUM (
    'Passed',
    'Failed',
    'Skipped',
    'TimedOut',
    'Interrupted'
);

CREATE TABLE ow_run_case (
    ow_rca_run_case_id uuid PRIMARY KEY,
    ow_rca_version int NOT NULL,
    ow_rca_run_id uuid NOT NULL REFERENCES ow_run ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ow_rca_case_id uuid NOT NULL REFERENCES ow_case ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ow_rca_spec_file_id uuid REFERENCES ow_spec_file DEFERRABLE INITIALLY DEFERRED,
    ow_rca_run_group text,
    ow_rca_file_location jsonb,
    ow_rca_annotations jsonb NOT NULL,
    ow_rca_timeout interval,
    ow_rca_retries int,
    ow_rca_expected_status ow_test_status
);

CREATE UNIQUE INDEX ow_run_case_case_run_idx ON ow_run_case (ow_rca_case_id, ow_rca_run_id);

CREATE TABLE ow_case_execution (
    ow_cex_case_execution_id uuid PRIMARY KEY,
    ow_cex_version int NOT NULL,
    ow_cex_run_case_id uuid NOT NULL REFERENCES ow_run_case ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ow_cex_start_date timestamptz NOT NULL,
    ow_cex_duration interval,
    ow_cex_retry int,
    ow_cex_status ow_test_status,
    ow_cex_stdout text[] NOT NULL,
    ow_cex_stderr text[] NOT NULL,
    ow_cex_errors jsonb NOT NULL
);

CREATE UNIQUE INDEX ow_case_execution_run_case_retry_idx ON ow_case_execution (ow_cex_run_case_id, ow_cex_retry);

-- user roles

CREATE TYPE ow_user_role AS ENUM (
    'Administrator',
    'User'
);

CREATE TABLE ow_user_role_grant (
    ow_urg_user_role_grant_id uuid PRIMARY KEY,
    ow_urg_version int NOT NULL,
    ow_urg_user_id uuid NOT NULL REFERENCES ow_user ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ow_urg_organization_id uuid NOT NULL REFERENCES ow_organization ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    ow_urg_role ow_user_role NOT NULL
);
