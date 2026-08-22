// The actual starting point: node server.js (or npm start)
const app = require('./app');
const { port } = require('./config/config');
const pool = require('./config/db');

async function start() {
  try {
    await pool.query('SELECT 1'); // fail fast if the DB isn't reachable
    console.log('✅ Connected to PostgreSQL');

    app.listen(port, () => {
      console.log(`🚀 Dayflow HRMS API running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Could not connect to the database. Check your .env settings.', err.message);
    process.exit(1);
  }
}

start();
