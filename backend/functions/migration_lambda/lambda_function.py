import os
import json
import psycopg

SCHEMA_SQL = """
create extension if not exists pgcrypto;

create table if not exists workload_categories (
  user_id varchar(255) not null,
  category_name varchar(100) not null,

  primary key (user_id, category_name),

  constraint workload_categories_name_not_blank
    check (length(trim(category_name)) > 0)
);

create table if not exists workload_records (
  record_id uuid primary key default gen_random_uuid(),

  user_id varchar(255) not null,
  category_name varchar (100) not null,

  task_name varchar(100) not null,
  task_start_at timestamptz not null,
  task_end_at timestamptz not null,

  mental_demand_score integer not null,
  physical_demand_score integer not null,
  temporal_demand_score integer not null,
  performance_score integer not null,
  effort_score integer not null,
  frustration_score integer not null,

  raw_tlx_score numeric(5,2) not null,

  constraint workload_records_task_name_not_blank
    check (length(trim(task_name)) > 0),
  
  constraint workload_records_time_valid
    check (task_start_at < task_end_at),

  constraint workload_records_mental_score_range
    check (mental_demand_score between 0 and 100),

  constraint workload_records_physical_score_range
    check (physical_demand_score between 0 and 100),

  constraint workload_records_temporal_score_range
    check (temporal_demand_score between 0 and 100),

  constraint workload_records_performance_score_range
    check (performance_score between 0 and 100),

  constraint workload_records_effort_score_range
    check (effort_score between 0 and 100),

  constraint workload_records_frustration_score_range
    check (frustration_score between 0 and 100),

  constraint workload_records_raw_tlx_score_range
    check (raw_tlx_score between 0 and 100),

  constraint workload_records_category_fk
    foreign key (user_id, category_name)
    references workload_categories (user_id, category_name)
    on update cascade
    on delete restrict
);

create index if not exists workload_records_user_start_time_at
on workload_records (user_id, task_start_at desc);

create index if not exists idx_workload_records_user_category
on workload_records (user_id, category_name);

create table if not exists dass21_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,

    assessment_start_at TIMESTAMPTZ NOT NULL,
    assessment_end_at TIMESTAMPTZ NOT NULL,

    depression_score INTEGER NOT NULL,
    anxiety_score INTEGER NOT NULL,
    stress_score INTEGER NOT NULL,

    constraint dass21_assessments_valid_period
        CHECK (assessment_start_at < assessment_end_at),

    constraint dass21_assessments_depression_score_range
        CHECK (depression_score BETWEEN 0 AND 42),

    constraint dass21_assessments_anxiety_score_range
        CHECK (anxiety_score BETWEEN 0 AND 42),

    constraint dass21_assessments_stress_score_range
        CHECK (stress_score BETWEEN 0 AND 42)
);

create table if not exists dass21_responses (
    assessment_id UUID NOT NULL
        REFERENCES dass21_assessments (assessment_id)
        ON DELETE CASCADE,

    question_number INTEGER NOT NULL,
    response_score INTEGER NOT NULL,

    PRIMARY KEY (assessment_id, question_number),

    constraint dass21_responses_question_number_range
        CHECK (question_number BETWEEN 1 AND 21),

    constraint dass21_responses_score_range
        CHECK (response_score BETWEEN 0 AND 3)
);

create index if not exists idx_dass21_assessments_user_end_at
    on dass21_assessments (user_id, assessment_end_at desc);

create table if not exists user_notification_settings (
    user_id varchar(255) primary key,
    email varchar(320) not null,
    wellbeing_reminder_enabled boolean not null default false,
    last_wellbeing_reminder_sent_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
"""
def lambda_handler(event, context):
    database_url = (
        f"postgresql://{os.environ['DB_USER']}:{os.environ['DB_PASSWORD']}"
        f"@{os.environ['DB_HOST']}:{os.environ['DB_PORT']}"
        f"/{os.environ['DB_NAME']}?sslmode=require"
    )
  
    with psycopg.connect(database_url) as conn:
      with conn.cursor() as cur:
        cur.execute(SCHEMA_SQL)
        conn.commit()

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"message": "Database migration completed successfully."}),
    }
