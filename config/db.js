const { Pool } = require('pg');
require('dotenv').config();

// Database Info
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});


// Connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});
pool.on('error', (err) => {
  console.error('Unexpected PG error', err);
  process.exit(-1);
});

module.exports = pool;
