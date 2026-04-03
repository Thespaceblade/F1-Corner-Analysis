const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error('❌ Missing DATABASE_URL (or SUPABASE_DB_URL).');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const [{ now }] = (await pool.query('select now()')).rows;
    console.log(`✅ Connected to Postgres at ${now}`);

    const tables = [
      'calendar_rounds',
      'sessions',
      'drivers',
      'session_drivers',
      'laps',
      'corners',
      'qualifying_boundaries',
      'race_results',
      'qualifying_results',
    ];

    for (const table of tables) {
      const [{ regclass }] = (await pool.query(
        'select to_regclass($1) as regclass',
        [`public.${table}`]
      )).rows;

      if (!regclass) {
        console.error(`❌ Missing table: ${table} (run scripts/sql/schema.sql first)`);
        process.exit(1);
      }

      console.log(`✅ Found table: ${table}`);
    }

    const counts = {
      calendar_rounds: 'select count(*)::int as count from calendar_rounds',
      sessions: 'select count(*)::int as count from sessions',
      drivers: 'select count(*)::int as count from drivers',
      session_drivers: 'select count(*)::int as count from session_drivers',
      laps: 'select count(*)::int as count from laps',
      corners: 'select count(*)::int as count from corners',
      qualifying_boundaries: 'select count(*)::int as count from qualifying_boundaries',
      race_results: 'select count(*)::int as count from race_results',
      qualifying_results: 'select count(*)::int as count from qualifying_results',
    };

    for (const [name, query] of Object.entries(counts)) {
      const [{ count }] = (await pool.query(query)).rows;
      console.log(`ℹ️ ${name}: ${count}`);
    }

    const [{ sample }] = (await pool.query(
      `
        select json_build_object(
          'year', year,
          'round', round_slug,
          'session', session_code,
          'status', status,
          'totalLapCount', total_lap_count,
          'validLapCount', valid_lap_count,
          'outlierLapCount', outlier_lap_count
        ) as sample
        from sessions
        order by year desc, round_number desc nulls last, round_slug desc, session_code desc
        limit 1
      `
    )).rows;

    if (!sample) {
      console.warn('⚠️ Database is empty. Import with: npm run import:sessions');
    } else {
      console.log(`✅ Sample session row: ${JSON.stringify(sample)}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('❌ Database verification failed:', error.message);
  process.exit(1);
});
