const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:OJuX5PD1T2uQCooC@db.xxqfqprwincmfwxmsjkf.supabase.co:5432/postgres',
});

async function testConnection() {
  try {
    await client.connect();
    console.log("✅ Connection successful!");
    const res = await client.query('SELECT NOW()');
    console.log("Server time:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

testConnection();
