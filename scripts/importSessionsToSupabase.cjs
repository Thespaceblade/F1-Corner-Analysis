const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const ROOT = process.cwd();
const SESSIONS_ROOT = path.join(ROOT, 'public', 'data', 'sessions');

function log(...args) {
  console.log('[import]', ...args);
}

async function loadJson(filePath) {
  const raw = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function* walkSessions(rootDir) {
  const years = await fs.promises.readdir(rootDir, { withFileTypes: true });
  for (const yearDir of years) {
    if (!yearDir.isDirectory()) continue;
    const year = yearDir.name;
    const yearPath = path.join(rootDir, year);
    const rounds = await fs.promises.readdir(yearPath, { withFileTypes: true });
    for (const roundDir of rounds) {
      if (!roundDir.isDirectory()) continue;
      const round = roundDir.name;
      const roundPath = path.join(yearPath, round);
      const sessions = await fs.promises.readdir(roundPath, { withFileTypes: true });
      for (const sessionDir of sessions) {
        if (!sessionDir.isDirectory()) continue;
        const sessionCode = sessionDir.name;
        const sessionJsonPath = path.join(roundPath, sessionCode, 'session.json');
        const exists = fs.existsSync(sessionJsonPath);
        if (!exists) continue;
        yield {
          year: Number(year),
          round,
          sessionCode,
          filePath: sessionJsonPath,
        };
      }
    }
  }
}

async function importSession(pool, sessionInfo) {
  const { year, round, sessionCode, filePath } = sessionInfo;
  log(`Importing ${year}/${round}/${sessionCode} from ${path.relative(ROOT, filePath)}`);

  const json = await loadJson(filePath);
  const meta = json.meta || {};
  const drivers = json.drivers || {};
  const laps = Array.isArray(json.laps) ? json.laps : [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert session row
    const sessionRes = await client.query(
      `
      INSERT INTO sessions (year, round_slug, session_code, event_name, country, official_name, generated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (year, round_slug, session_code)
      DO UPDATE SET
        event_name = EXCLUDED.event_name,
        country = EXCLUDED.country,
        official_name = EXCLUDED.official_name,
        generated_at = EXCLUDED.generated_at
      RETURNING id
      `,
      [
        year,
        round,
        sessionCode.toUpperCase(),
        meta.event?.name ?? null,
        meta.event?.country ?? null,
        meta.event?.officialName ?? null,
        meta.generatedAt ?? null,
      ]
    );
    const sessionId = sessionRes.rows[0].id;

    // Upsert drivers
    const driverEntries = Object.entries(drivers);
    for (const [, d] of driverEntries) {
      const code = d.code || null;
      if (!code) continue;
      await client.query(
        `
        INSERT INTO drivers (code, team, number)
        VALUES ($1, $2, $3)
        ON CONFLICT (code)
        DO UPDATE SET
          team = EXCLUDED.team,
          number = EXCLUDED.number
        `,
        [
          code,
          d.team ?? null,
          typeof d.number === 'number' ? d.number : null,
        ]
      );
    }

    // Clear existing laps for this session
    await client.query('DELETE FROM laps WHERE session_id = $1', [sessionId]);

    if (laps.length) {
      const chunkSize = 500;
      for (let i = 0; i < laps.length; i += chunkSize) {
        const chunk = laps.slice(i, i + chunkSize);
        const values = [];
        const params = [];
        let paramIndex = 1;

        for (const lap of chunk) {
          const sectorTimes = Array.isArray(lap.sectorTimesSeconds) ? lap.sectorTimesSeconds : [];
          const s1 = sectorTimes[0] ?? null;
          const s2 = sectorTimes[1] ?? null;
          const s3 = sectorTimes[2] ?? null;

          values.push(
            `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
          );

          params.push(
            sessionId,
            lap.driver || null,
            typeof lap.lapNumber === 'number' ? lap.lapNumber : null,
            typeof lap.stint === 'number' ? lap.stint : null,
            lap.compound ?? null,
            typeof lap.tyreLife === 'number' ? lap.tyreLife : null,
            typeof lap.lapTimeSeconds === 'number' ? lap.lapTimeSeconds : null,
            s1,
            s2,
            s3,
            lap.trackStatus ?? null,
            Array.isArray(lap.flags) ? lap.flags : null,
            typeof lap.isValid === 'boolean' ? lap.isValid : null
          );
        }

        const sql = `
          INSERT INTO laps (
            session_id,
            driver_code,
            lap_number,
            stint,
            compound,
            tyre_life,
            lap_time_seconds,
            sector1_seconds,
            sector2_seconds,
            sector3_seconds,
            track_status,
            flags,
            is_valid
          ) VALUES ${values.join(', ')}
        `;

        await client.query(sql, params);
      }
    }

    await client.query('COMMIT');
    log(`Imported ${laps.length} laps for ${year}/${round}/${sessionCode}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[import] Error importing session', year, round, sessionCode, err.message);
    throw err;
  } finally {
    client.release();
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Please set it in your environment.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    log('Starting import using', connectionString.replace(/:\/\/[^:]+:[^@]+@/, '://****:****@'));
    const exists = fs.existsSync(SESSIONS_ROOT);
    if (!exists) {
      console.error('[import] public/data/sessions directory not found at', SESSIONS_ROOT);
      process.exit(1);
    }

    let count = 0;
    for await (const info of walkSessions(SESSIONS_ROOT)) {
      await importSession(pool, info);
      count += 1;
    }

    log(`Done. Imported ${count} sessions.`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[import] Fatal error', err);
  process.exit(1);
});

