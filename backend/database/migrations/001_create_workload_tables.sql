create extension if not exists pgcrypto;

create table workload_categories (
  user_id varchar(255) not null,
  category_name varchar(100) not null,

  primary key (user_id, category_name),

  constraint workload_categories_name_not_blank
    check (length(trim(category_name)) > 0)
);

create table workload_records (
  record_id uuid primary key default gen_random_uuid(),

  user_id varchar(255) not null,
  category_name varchar(100) not null,

  task_name varchar(150) not null,
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
    check (task_end_at > task_start_at),

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
    references workload_categories(user_id, category_name)
    on update cascade
    on delete restrict
);

create index idx_workload_records_user_start_at
on workload_records (user_id, task_start_at desc);

create index idx_workload_records_user_category
on workload_records (user_id, category_name);
