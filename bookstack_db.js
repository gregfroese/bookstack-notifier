const mysql = require('mysql2/promise');

// Create a connection pool with the connection parameters
const pool = mysql.createPool({
  host: '192.168.5.3',
  user: 'bookstack_notifier',
  password: 'mtz9nyr4nze!uyr@YBE',
  database: 'bookstack_notifier'
});


async function query(sql, args) {
  if( sql ) {
    const connection = await pool.getConnection();
    console.log("Opened connection for %s", sql);
    try {
      const [rows] = await connection.execute(sql, args);
      return rows;
    } catch(error) {
      console.error("Error executing query: %s - $s", sql, error);
    } finally {
      connection.release();
      console.log("Releasing connection for %s", sql);
    }
  } else {
    console.error("No SQL defined");
  }
}

// Function to close the connection pool
function close() {
  pool.end((err) => {
    if (err) {
      console.error('Error closing pool:', err.message);
    } else {
      console.log('Connection pool closed');
    }
  });
}

module.exports = { query, close };
