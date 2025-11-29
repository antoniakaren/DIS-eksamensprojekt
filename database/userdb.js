// MySQL2 med Promise API gør det muligt at bruge async/await
import mysql from "mysql2/promise";

// Vi opretter en connection pool
// Pool = mange genbrugelige forbindelser (hurtigere end ny forbindelse hver gang)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
      rejectUnauthorized: false
    }
  });

// Export pool som default → let at importere
export default pool;
