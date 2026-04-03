alter table public.drivers
  add column if not exists full_name text,
  add column if not exists headshot_path text;

create table if not exists public.teams (
  id text primary key,
  color text,
  logo_path text
);

create table if not exists public.season_teams (
  id bigserial primary key,
  year integer not null,
  team_id text not null references public.teams(id) on delete restrict,
  name text not null,
  short_name text not null,
  aliases text[] not null default '{}',
  unique (year, team_id)
);

create table if not exists public.season_driver_assignments (
  id bigserial primary key,
  year integer not null,
  team_id text not null references public.teams(id) on delete restrict,
  driver_code text not null references public.drivers(code) on delete restrict,
  number integer,
  start_round integer not null default 1,
  end_round integer,
  check (end_round is null or end_round >= start_round),
  unique (year, driver_code, start_round),
  unique (year, team_id, driver_code, start_round)
);

alter table public.teams enable row level security;
alter table public.season_teams enable row level security;
alter table public.season_driver_assignments enable row level security;

grant select on table public.teams to anon, authenticated;
grant select on table public.season_teams to anon, authenticated;
grant select on table public.season_driver_assignments to anon, authenticated;

drop policy if exists "public read teams" on public.teams;
create policy "public read teams" on public.teams
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read season_teams" on public.season_teams;
create policy "public read season_teams" on public.season_teams
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read season_driver_assignments" on public.season_driver_assignments;
create policy "public read season_driver_assignments" on public.season_driver_assignments
  for select
  to anon, authenticated
  using (true);

create index if not exists idx_season_teams_year_team
  on public.season_teams(year, team_id);

create index if not exists idx_season_driver_assignments_year_team_round
  on public.season_driver_assignments(year, team_id, start_round, end_round);

create index if not exists idx_season_driver_assignments_year_driver_round
  on public.season_driver_assignments(year, driver_code, start_round, end_round);
