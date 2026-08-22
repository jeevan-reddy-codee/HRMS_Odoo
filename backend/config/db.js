// Sets up and exports a single shared PostgreSQL connection pool.
// Every model/controller imports this instead of opening its own connection.
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'dayflow_db',
  max: 10,                       // max simultaneous connections
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => console.log('🗄️  PostgreSQL pool: new client connected'));
pool.on('error', (err) => console.error('🔥 Unexpected PostgreSQL error:', err));

module.exports = pool;
