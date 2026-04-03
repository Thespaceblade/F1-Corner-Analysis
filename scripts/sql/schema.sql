-- Full Postgres schema for the Supabase-backed F1 Corner Analysis backend.

create table if not exists calendar_rounds (
  id bigserial primary key,
  year integer not null,
  round_number integer not null,
  round_slug text not null,
  name text,
  location text,
  date_label text,
  official_name text,
  unique (year, round_number),
  unique (year, round_slug)
);

create table if not exists sessions (
  id bigserial primary key,
  year integer not null,
  round_number integer,
  round_slug text not null,
  session_code text not null,
  event_name text,
  country text,
  official_name text,
  generated_at timestamptz default now(),
  status text,
  total_lap_count integer,
  valid_lap_count integer,
  outlier_lap_count integer,
  unique (year, round_slug, session_code)
);

create table if not exists drivers (
  id bigserial primary key,
  code text not null unique,
  team text,
  number integer
);

create table if not exists session_drivers (
  id bigserial primary key,
  session_id bigint not null references sessions(id) on delete cascade,
  driver_code text not null references drivers(code) on delete restrict,
  team text,
  number integer,
  default_compound text,
  unique (session_id, driver_code)
);

create table if not exists laps (
  id bigserial primary key,
  session_id bigint not null references sessions(id) on delete cascade,
  driver_code text not null references drivers(code) on delete restrict,
  lap_order integer not null default 0,
  lap_number integer,
  stint integer,
  compound text,
  tyre_life integer,
  lap_time_seconds double precision,
  session_time_seconds double precision,
  sector1_seconds double precision,
  sector2_seconds double precision,
  sector3_seconds double precision,
  is_personal_best boolean not null default false,
  track_status text,
  has_data boolean not null default true,
  flags text[],
  is_valid boolean
);

create table if not exists corners (
  id bigserial primary key,
  session_id bigint not null references sessions(id) on delete cascade,
  driver_code text not null references drivers(code) on delete restrict,
  corner_order integer not null default 0,
  detected_corner_index integer,
  lap_number integer,
  entry_speed double precision,
  apex_speed double precision,
  exit_speed double precision,
  corner_time double precision,
  braking_distance double precision,
  acceleration_distance double precision,
  entry_distance double precision,
  apex_distance double precision,
  exit_distance double precision,
  min_speed double precision,
  corner_number integer,
  corner_type text
);

create table if not exists qualifying_boundaries (
  session_id bigint primary key references sessions(id) on delete cascade,
  q1_start double precision,
  q1_end double precision,
  q2_start double precision,
  q2_end double precision,
  q3_start double precision,
  q3_end double precision
);

create table if not exists race_results (
  id bigserial primary key,
  session_id bigint not null references sessions(id) on delete cascade,
  driver_code text not null references drivers(code) on delete restrict,
  position integer,
  driver_number integer,
  team_name text,
  grid_position integer,
  status text,
  points double precision,
  classified_position text,
  time_seconds double precision,
  laps_completed integer,
  unique (session_id, driver_code)
);

create table if not exists qualifying_results (
  id bigserial primary key,
  session_id bigint not null references sessions(id) on delete cascade,
  driver_code text not null references drivers(code) on delete restrict,
  position integer,
  driver_number integer,
  team_name text,
  q1_time_seconds double precision,
  q2_time_seconds double precision,
  q3_time_seconds double precision,
  unique (session_id, driver_code)
);

alter table sessions add column if not exists round_number integer;
alter table sessions add column if not exists status text;
alter table sessions add column if not exists total_lap_count integer;
alter table sessions add column if not exists valid_lap_count integer;
alter table sessions add column if not exists outlier_lap_count integer;

alter table laps add column if not exists lap_order integer not null default 0;
alter table laps add column if not exists session_time_seconds double precision;
alter table laps add column if not exists is_personal_best boolean not null default false;
alter table laps add column if not exists has_data boolean not null default true;

alter table public.calendar_rounds enable row level security;
alter table public.sessions enable row level security;
alter table public.drivers enable row level security;
alter table public.session_drivers enable row level security;
alter table public.laps enable row level security;
alter table public.corners enable row level security;
alter table public.qualifying_boundaries enable row level security;
alter table public.race_results enable row level security;
alter table public.qualifying_results enable row level security;

grant usage on schema public to anon, authenticated;

grant select on table public.calendar_rounds to anon, authenticated;
grant select on table public.sessions to anon, authenticated;
grant select on table public.drivers to anon, authenticated;
grant select on table public.session_drivers to anon, authenticated;
grant select on table public.laps to anon, authenticated;
grant select on table public.corners to anon, authenticated;
grant select on table public.qualifying_boundaries to anon, authenticated;
grant select on table public.race_results to anon, authenticated;
grant select on table public.qualifying_results to anon, authenticated;

drop policy if exists "public read calendar_rounds" on public.calendar_rounds;
create policy "public read calendar_rounds" on public.calendar_rounds
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read sessions" on public.sessions;
create policy "public read sessions" on public.sessions
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read drivers" on public.drivers;
create policy "public read drivers" on public.drivers
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read session_drivers" on public.session_drivers;
create policy "public read session_drivers" on public.session_drivers
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read laps" on public.laps;
create policy "public read laps" on public.laps
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read corners" on public.corners;
create policy "public read corners" on public.corners
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read qualifying_boundaries" on public.qualifying_boundaries;
create policy "public read qualifying_boundaries" on public.qualifying_boundaries
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read race_results" on public.race_results;
create policy "public read race_results" on public.race_results
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read qualifying_results" on public.qualifying_results;
create policy "public read qualifying_results" on public.qualifying_results
  for select
  to anon, authenticated
  using (true);

create index if not exists idx_calendar_rounds_year_round_number
  on calendar_rounds(year, round_number);

create index if not exists idx_sessions_year_round_number
  on sessions(year, round_number, round_slug, session_code);

create index if not exists idx_session_drivers_session_driver
  on session_drivers(session_id, driver_code);

create index if not exists idx_laps_session_driver_order
  on laps(session_id, driver_code, lap_order);

create index if not exists idx_corners_session_driver_order
  on corners(session_id, driver_code, corner_order);

create index if not exists idx_corners_session_corner_number
  on corners(session_id, corner_number);

create index if not exists idx_race_results_session_position
  on race_results(session_id, position);

create index if not exists idx_qualifying_results_session_position
  on qualifying_results(session_id, position);
