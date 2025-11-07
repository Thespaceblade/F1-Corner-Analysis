-- Minimal schema for Neon Postgres to back the F1 Corner Analysis API

CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  year INT NOT NULL,
  round_slug TEXT NOT NULL,
  session_code TEXT NOT NULL,
  event_name TEXT,
  country TEXT,
  official_name TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (year, round_slug, session_code)
);

CREATE TABLE IF NOT EXISTS drivers (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  team TEXT,
  number INT
);

CREATE TABLE IF NOT EXISTS laps (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  driver_code TEXT NOT NULL REFERENCES drivers(code) ON DELETE RESTRICT,
  lap_number INT,
  stint INT,
  compound TEXT,
  tyre_life INT,
  lap_time_seconds DOUBLE PRECISION,
  sector1_seconds DOUBLE PRECISION,
  sector2_seconds DOUBLE PRECISION,
  sector3_seconds DOUBLE PRECISION,
  track_status TEXT,
  flags TEXT[],
  is_valid BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_laps_session ON laps(session_id);
CREATE INDEX IF NOT EXISTS idx_laps_session_driver ON laps(session_id, driver_code);


