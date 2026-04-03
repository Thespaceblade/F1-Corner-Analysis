const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, 'public', 'data');
const SESSIONS_ROOT = path.join(DATA_ROOT, 'sessions');
const ENV_FILES = ['.env.local', '.env'];

function log(...args) {
  console.log('[import]', ...args);
}

async function loadJson(filePath) {
  const raw = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function stripWrappingQuotes(value) {
  const trimmed = String(value || '').trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseEnvValue(filePath, key) {
  if (!fs.existsSync(filePath)) return null;

  const text = fs.readFileSync(filePath, 'utf8');
  const line = text
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${key}=`));

  if (!line) return null;
  return stripWrappingQuotes(line.slice(key.length + 1));
}

function getConnectionString() {
  const envValue = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (envValue) {
    return stripWrappingQuotes(envValue);
  }

  for (const fileName of ENV_FILES) {
    const filePath = path.join(ROOT, fileName);
    const value = parseEnvValue(filePath, 'DATABASE_URL') || parseEnvValue(filePath, 'SUPABASE_DB_URL');
    if (value) {
      return value;
    }
  }

  return null;
}

function parseCsvList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function createFilterSet(values, transform = (value) => value) {
  if (!values.length) return null;
  return new Set(values.map(transform));
}

function parseCliArgs(argv) {
  const years = [];
  const rounds = [];
  const sessions = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--year' && next) {
      years.push(...parseCsvList(next).map(Number).filter((value) => Number.isFinite(value) && value > 0));
      index += 1;
      continue;
    }

    if (arg === '--round' && next) {
      rounds.push(...parseCsvList(next));
      index += 1;
      continue;
    }

    if (arg === '--session' && next) {
      sessions.push(...parseCsvList(next));
      index += 1;
      continue;
    }
  }

  return {
    years: createFilterSet(years, Number),
    rounds: createFilterSet(rounds, (value) => String(value).trim().toLowerCase()),
    sessions: createFilterSet(sessions, (value) => String(value).trim().toUpperCase()),
  };
}

function matchesFilters({ year, round, sessionCode }, filters) {
  if (filters.years && !filters.years.has(year)) return false;
  if (filters.rounds && !filters.rounds.has(round.toLowerCase())) return false;
  if (filters.sessions && !filters.sessions.has(sessionCode.toUpperCase())) return false;
  return true;
}

async function* walkSessions(rootDir, filters) {
  const years = await fs.promises.readdir(rootDir, { withFileTypes: true });
  for (const yearDir of years) {
    if (!yearDir.isDirectory()) continue;

    const year = Number(yearDir.name);
    if (filters.years && !filters.years.has(year)) continue;

    const yearPath = path.join(rootDir, yearDir.name);
    const rounds = await fs.promises.readdir(yearPath, { withFileTypes: true });
    for (const roundDir of rounds) {
      if (!roundDir.isDirectory()) continue;

      const round = roundDir.name;
      if (filters.rounds && !filters.rounds.has(round.toLowerCase())) continue;

      const roundPath = path.join(yearPath, round);
      const sessions = await fs.promises.readdir(roundPath, { withFileTypes: true });
      for (const sessionDir of sessions) {
        if (!sessionDir.isDirectory()) continue;

        const sessionCode = sessionDir.name.toUpperCase();
        if (filters.sessions && !filters.sessions.has(sessionCode)) continue;

        const sessionJsonPath = path.join(roundPath, sessionDir.name, 'session.json');
        if (!fs.existsSync(sessionJsonPath)) continue;

        yield {
          year,
          round,
          sessionCode,
          filePath: sessionJsonPath,
        };
      }
    }
  }
}

function chunk(array, size) {
  const items = [];
  for (let index = 0; index < array.length; index += size) {
    items.push(array.slice(index, index + size));
  }
  return items;
}

async function insertMany(client, { sqlStart, rows, suffix = '', chunkSize = 250 }) {
  if (!rows.length) return;

  for (const batch of chunk(rows, chunkSize)) {
    const values = [];
    const params = [];

    for (const row of batch) {
      const startIndex = params.length;
      const placeholders = row.map((_, index) => `$${startIndex + index + 1}`);
      params.push(...row);
      values.push(`(${placeholders.join(', ')})`);
    }

    await client.query(`${sqlStart} VALUES ${values.join(', ')} ${suffix}`, params);
  }
}

async function loadCalendarEntries(filters) {
  const entries = [];
  const files = await fs.promises.readdir(DATA_ROOT, { withFileTypes: true });

  for (const entry of files) {
    if (!entry.isFile()) continue;
    const match = entry.name.match(/^calendar(\d{4})\.json$/);
    if (!match) continue;

    const year = Number(match[1]);
    if (filters.years && !filters.years.has(year)) continue;

    const calendarPath = path.join(DATA_ROOT, entry.name);
    const calendar = await loadJson(calendarPath);
    const rounds = Array.isArray(calendar?.rounds) ? calendar.rounds : [];

    for (const round of rounds) {
      if (!round?.id || typeof round.round !== 'number') continue;
      if (filters.rounds && !filters.rounds.has(String(round.id).toLowerCase())) continue;

      entries.push({
        year,
        roundNumber: round.round,
        roundSlug: round.id,
        name: round.name ?? null,
        location: round.location ?? null,
        dateLabel: round.date ?? null,
        officialName: round.officialName ?? null,
        country: round.country ?? null,
      });
    }
  }

  return entries.sort((a, b) => a.year - b.year || a.roundNumber - b.roundNumber);
}

async function importCalendars(pool, filters) {
  const calendarEntries = await loadCalendarEntries(filters);
  if (!calendarEntries.length) {
    log('No matching calendar rows found; continuing without calendar import.');
    return new Map();
  }

  const calendarMap = new Map();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const rows = calendarEntries.map((entry) => {
      calendarMap.set(`${entry.year}:${entry.roundSlug}`, entry);
      return [
        entry.year,
        entry.roundNumber,
        entry.roundSlug,
        entry.name,
        entry.location,
        entry.dateLabel,
        entry.officialName,
      ];
    });

    await insertMany(client, {
      sqlStart: `
        INSERT INTO calendar_rounds (
          year,
          round_number,
          round_slug,
          name,
          location,
          date_label,
          official_name
        )
      `,
      rows,
      suffix: `
        ON CONFLICT (year, round_slug)
        DO UPDATE SET
          round_number = EXCLUDED.round_number,
          name = EXCLUDED.name,
          location = EXCLUDED.location,
          date_label = EXCLUDED.date_label,
          official_name = EXCLUDED.official_name
      `,
    });

    await client.query('COMMIT');
    log(`Imported ${calendarEntries.length} calendar rows.`);
    return calendarMap;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function importSeasonMetadata() {
  log('Skipping standalone season metadata seed. Local metadata remains the source of truth for teams and driver identity.');
}

function getDriverMetaMap(json) {
  const metadata = new Map();
  const drivers = json?.drivers ?? {};

  for (const [code, driver] of Object.entries(drivers)) {
    const driverCode = String(driver?.code || code || '').toUpperCase().trim();
    if (!driverCode) continue;
    metadata.set(driverCode, {
      code: driverCode,
      team: driver?.team ?? null,
      number: typeof driver?.number === 'number' ? driver.number : null,
      defaultCompound: driver?.defaultCompound ?? null,
    });
  }

  const fallbackSources = [
    ...(Array.isArray(json?.laps) ? json.laps.map((lap) => ({ code: lap?.driver })) : []),
    ...(Array.isArray(json?.raceResults)
      ? json.raceResults.map((result) => ({
          code: result?.driverCode,
          team: result?.teamName ?? null,
          number: typeof result?.driverNumber === 'number' ? result.driverNumber : null,
        }))
      : []),
    ...(Array.isArray(json?.qualifyingResults)
      ? json.qualifyingResults.map((result) => ({
          code: result?.driverCode,
          team: result?.teamName ?? null,
          number: typeof result?.driverNumber === 'number' ? result.driverNumber : null,
        }))
      : []),
    ...Object.keys(json?.corners ?? {}).map((code) => ({ code })),
  ];

  for (const source of fallbackSources) {
    const code = String(source?.code || '').toUpperCase().trim();
    if (!code) continue;
    if (!metadata.has(code)) {
      metadata.set(code, {
        code,
        team: source?.team ?? null,
        number: source?.number ?? null,
        defaultCompound: null,
      });
    }
  }

  return metadata;
}

async function importSession(pool, calendarMap, sessionInfo) {
  const { year, round, sessionCode, filePath } = sessionInfo;
  log(`Importing ${year}/${round}/${sessionCode} from ${path.relative(ROOT, filePath)}`);

  const json = await loadJson(filePath);
  const meta = json?.meta ?? {};
  const eventMeta = meta?.event ?? {};
  const laps = Array.isArray(json?.laps) ? json.laps : [];
  const corners = json?.corners ?? {};
  const raceResults = Array.isArray(json?.raceResults) ? json.raceResults : [];
  const qualifyingResults = Array.isArray(json?.qualifyingResults) ? json.qualifyingResults : [];
  const qualifyingBoundaries = json?.qualifyingBoundaries ?? null;
  const calendarEntry = calendarMap.get(`${year}:${round}`);
  const driverMetaMap = getDriverMetaMap(json);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const sessionRes = await client.query(
      `
        INSERT INTO sessions (
          year,
          round_number,
          round_slug,
          session_code,
          event_name,
          country,
          official_name,
          generated_at,
          status,
          total_lap_count,
          valid_lap_count,
          outlier_lap_count
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (year, round_slug, session_code)
        DO UPDATE SET
          round_number = EXCLUDED.round_number,
          event_name = EXCLUDED.event_name,
          country = EXCLUDED.country,
          official_name = EXCLUDED.official_name,
          generated_at = EXCLUDED.generated_at,
          status = EXCLUDED.status,
          total_lap_count = EXCLUDED.total_lap_count,
          valid_lap_count = EXCLUDED.valid_lap_count,
          outlier_lap_count = EXCLUDED.outlier_lap_count
        RETURNING id
      `,
      [
        year,
        calendarEntry?.roundNumber ?? null,
        round,
        sessionCode.toUpperCase(),
        eventMeta?.name ?? calendarEntry?.name ?? null,
        eventMeta?.country ?? calendarEntry?.country ?? null,
        eventMeta?.officialName ?? calendarEntry?.officialName ?? null,
        meta?.generatedAt ?? null,
        meta?.status ?? null,
        typeof meta?.totalLapCount === 'number' ? meta.totalLapCount : null,
        typeof meta?.validLapCount === 'number' ? meta.validLapCount : null,
        typeof meta?.outlierLapCount === 'number' ? meta.outlierLapCount : null,
      ],
    );
    const sessionId = sessionRes.rows[0].id;

    const driverRows = Array.from(driverMetaMap.values()).map((driver) => [
      driver.code,
      driver.team,
      driver.number,
    ]);
    await insertMany(client, {
      sqlStart: `
        INSERT INTO drivers (
          code,
          team,
          number
        )
      `,
      rows: driverRows,
      suffix: `
        ON CONFLICT (code)
        DO UPDATE SET
          team = COALESCE(EXCLUDED.team, drivers.team),
          number = COALESCE(EXCLUDED.number, drivers.number)
      `,
    });

    await client.query('DELETE FROM qualifying_results WHERE session_id = $1', [sessionId]);
    await client.query('DELETE FROM race_results WHERE session_id = $1', [sessionId]);
    await client.query('DELETE FROM qualifying_boundaries WHERE session_id = $1', [sessionId]);
    await client.query('DELETE FROM corners WHERE session_id = $1', [sessionId]);
    await client.query('DELETE FROM laps WHERE session_id = $1', [sessionId]);
    await client.query('DELETE FROM session_drivers WHERE session_id = $1', [sessionId]);

    const sessionDriverRows = Array.from(driverMetaMap.values()).map((driver) => [
      sessionId,
      driver.code,
      driver.team,
      driver.number,
      driver.defaultCompound,
    ]);
    await insertMany(client, {
      sqlStart: `
        INSERT INTO session_drivers (
          session_id,
          driver_code,
          team,
          number,
          default_compound
        )
      `,
      rows: sessionDriverRows,
      suffix: `
        ON CONFLICT (session_id, driver_code)
        DO UPDATE SET
          team = EXCLUDED.team,
          number = EXCLUDED.number,
          default_compound = EXCLUDED.default_compound
      `,
    });

    const lapRows = laps
      .map((lap, index) => {
        const sectorTimes = Array.isArray(lap?.sectorTimesSeconds) ? lap.sectorTimesSeconds : [];
        return [
          sessionId,
          String(lap?.driver || '').toUpperCase() || null,
          index,
          typeof lap?.lapNumber === 'number' ? lap.lapNumber : null,
          typeof lap?.stint === 'number' ? lap.stint : null,
          lap?.compound ?? null,
          typeof lap?.tyreLife === 'number' ? lap.tyreLife : null,
          typeof lap?.lapTimeSeconds === 'number' ? lap.lapTimeSeconds : null,
          typeof lap?.sessionTimeSeconds === 'number' ? lap.sessionTimeSeconds : null,
          typeof sectorTimes[0] === 'number' ? sectorTimes[0] : null,
          typeof sectorTimes[1] === 'number' ? sectorTimes[1] : null,
          typeof sectorTimes[2] === 'number' ? sectorTimes[2] : null,
          typeof lap?.isPersonalBest === 'boolean' ? lap.isPersonalBest : false,
          lap?.trackStatus ?? null,
          typeof lap?.hasData === 'boolean' ? lap.hasData : true,
          Array.isArray(lap?.flags) ? lap.flags : null,
          typeof lap?.isValid === 'boolean' ? lap.isValid : null,
        ];
      })
      .filter((row) => row[1]);

    await insertMany(client, {
      sqlStart: `
        INSERT INTO laps (
          session_id,
          driver_code,
          lap_order,
          lap_number,
          stint,
          compound,
          tyre_life,
          lap_time_seconds,
          session_time_seconds,
          sector1_seconds,
          sector2_seconds,
          sector3_seconds,
          is_personal_best,
          track_status,
          has_data,
          flags,
          is_valid
        )
      `,
      rows: lapRows,
    });

    const cornerRows = [];
    for (const [driverCodeRaw, driverCorners] of Object.entries(corners)) {
      const driverCode = String(driverCodeRaw || '').toUpperCase().trim();
      if (!driverCode || !Array.isArray(driverCorners)) continue;

      driverCorners.forEach((corner, index) => {
        cornerRows.push([
          sessionId,
          driverCode,
          index,
          typeof corner?.detectedCornerIndex === 'number' ? corner.detectedCornerIndex : null,
          typeof corner?.lapNumber === 'number' ? corner.lapNumber : null,
          typeof corner?.entrySpeed === 'number' ? corner.entrySpeed : null,
          typeof corner?.apexSpeed === 'number' ? corner.apexSpeed : null,
          typeof corner?.exitSpeed === 'number' ? corner.exitSpeed : null,
          typeof corner?.cornerTime === 'number' ? corner.cornerTime : null,
          typeof corner?.brakingDistance === 'number' ? corner.brakingDistance : null,
          typeof corner?.accelerationDistance === 'number' ? corner.accelerationDistance : null,
          typeof corner?.entryDistance === 'number' ? corner.entryDistance : null,
          typeof corner?.apexDistance === 'number' ? corner.apexDistance : null,
          typeof corner?.exitDistance === 'number' ? corner.exitDistance : null,
          typeof corner?.minSpeed === 'number' ? corner.minSpeed : null,
          typeof corner?.cornerNumber === 'number' ? corner.cornerNumber : null,
          corner?.cornerType ?? null,
        ]);
      });
    }

    await insertMany(client, {
      sqlStart: `
        INSERT INTO corners (
          session_id,
          driver_code,
          corner_order,
          detected_corner_index,
          lap_number,
          entry_speed,
          apex_speed,
          exit_speed,
          corner_time,
          braking_distance,
          acceleration_distance,
          entry_distance,
          apex_distance,
          exit_distance,
          min_speed,
          corner_number,
          corner_type
        )
      `,
      rows: cornerRows,
    });

    if (qualifyingBoundaries) {
      await client.query(
        `
          INSERT INTO qualifying_boundaries (
            session_id,
            q1_start,
            q1_end,
            q2_start,
            q2_end,
            q3_start,
            q3_end
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (session_id)
          DO UPDATE SET
            q1_start = EXCLUDED.q1_start,
            q1_end = EXCLUDED.q1_end,
            q2_start = EXCLUDED.q2_start,
            q2_end = EXCLUDED.q2_end,
            q3_start = EXCLUDED.q3_start,
            q3_end = EXCLUDED.q3_end
        `,
        [
          sessionId,
          typeof qualifyingBoundaries?.q1Start === 'number' ? qualifyingBoundaries.q1Start : null,
          typeof qualifyingBoundaries?.q1End === 'number' ? qualifyingBoundaries.q1End : null,
          typeof qualifyingBoundaries?.q2Start === 'number' ? qualifyingBoundaries.q2Start : null,
          typeof qualifyingBoundaries?.q2End === 'number' ? qualifyingBoundaries.q2End : null,
          typeof qualifyingBoundaries?.q3Start === 'number' ? qualifyingBoundaries.q3Start : null,
          typeof qualifyingBoundaries?.q3End === 'number' ? qualifyingBoundaries.q3End : null,
        ],
      );
    }

    const raceResultRows = raceResults
      .map((result) => [
        sessionId,
        String(result?.driverCode || '').toUpperCase() || null,
        typeof result?.position === 'number' ? result.position : null,
        typeof result?.driverNumber === 'number' ? result.driverNumber : null,
        result?.teamName ?? null,
        typeof result?.gridPosition === 'number' ? result.gridPosition : null,
        result?.status ?? null,
        typeof result?.points === 'number' ? result.points : null,
        result?.classifiedPosition ?? null,
        typeof result?.time === 'number' ? result.time : null,
        typeof result?.lapsCompleted === 'number' ? result.lapsCompleted : null,
      ])
      .filter((row) => row[1]);

    await insertMany(client, {
      sqlStart: `
        INSERT INTO race_results (
          session_id,
          driver_code,
          position,
          driver_number,
          team_name,
          grid_position,
          status,
          points,
          classified_position,
          time_seconds,
          laps_completed
        )
      `,
      rows: raceResultRows,
      suffix: `
        ON CONFLICT (session_id, driver_code)
        DO UPDATE SET
          position = EXCLUDED.position,
          driver_number = EXCLUDED.driver_number,
          team_name = EXCLUDED.team_name,
          grid_position = EXCLUDED.grid_position,
          status = EXCLUDED.status,
          points = EXCLUDED.points,
          classified_position = EXCLUDED.classified_position,
          time_seconds = EXCLUDED.time_seconds,
          laps_completed = EXCLUDED.laps_completed
      `,
    });

    const qualifyingResultRows = qualifyingResults
      .map((result) => [
        sessionId,
        String(result?.driverCode || '').toUpperCase() || null,
        typeof result?.position === 'number' ? result.position : null,
        typeof result?.driverNumber === 'number' ? result.driverNumber : null,
        result?.teamName ?? null,
        typeof result?.q1Time === 'number' ? result.q1Time : null,
        typeof result?.q2Time === 'number' ? result.q2Time : null,
        typeof result?.q3Time === 'number' ? result.q3Time : null,
      ])
      .filter((row) => row[1]);

    await insertMany(client, {
      sqlStart: `
        INSERT INTO qualifying_results (
          session_id,
          driver_code,
          position,
          driver_number,
          team_name,
          q1_time_seconds,
          q2_time_seconds,
          q3_time_seconds
        )
      `,
      rows: qualifyingResultRows,
      suffix: `
        ON CONFLICT (session_id, driver_code)
        DO UPDATE SET
          position = EXCLUDED.position,
          driver_number = EXCLUDED.driver_number,
          team_name = EXCLUDED.team_name,
          q1_time_seconds = EXCLUDED.q1_time_seconds,
          q2_time_seconds = EXCLUDED.q2_time_seconds,
          q3_time_seconds = EXCLUDED.q3_time_seconds
      `,
    });

    await client.query('COMMIT');
    log(
      `Imported ${laps.length} laps, ${cornerRows.length} corners, ${raceResults.length} race results, ${qualifyingResults.length} qualifying results for ${year}/${round}/${sessionCode}`,
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[import] Error importing session', year, round, sessionCode, error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const filters = parseCliArgs(process.argv.slice(2));
  const connectionString = getConnectionString();

  if (!connectionString) {
    console.error('DATABASE_URL (or SUPABASE_DB_URL) is not set and no usable value was found in .env.local/.env.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    log('Starting import using', connectionString.replace(/:\/\/[^:]+:[^@]+@/, '://****:****@'));
    if (filters.years || filters.rounds || filters.sessions) {
      log('Filters', {
        years: filters.years ? Array.from(filters.years.values()) : 'all',
        rounds: filters.rounds ? Array.from(filters.rounds.values()) : 'all',
        sessions: filters.sessions ? Array.from(filters.sessions.values()) : 'all',
      });
    }

    if (!fs.existsSync(SESSIONS_ROOT)) {
      console.error('[import] public/data/sessions directory not found at', SESSIONS_ROOT);
      process.exit(1);
    }

    await importSeasonMetadata(pool);
    const calendarMap = await importCalendars(pool, filters);

    let count = 0;
    for await (const info of walkSessions(SESSIONS_ROOT, filters)) {
      if (!matchesFilters(info, filters)) continue;
      await importSession(pool, calendarMap, info);
      count += 1;
    }

    log(`Done. Imported ${count} sessions.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[import] Fatal error', error);
  process.exit(1);
});
