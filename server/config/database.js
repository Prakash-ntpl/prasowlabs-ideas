import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '148.113.4.193',
  user: process.env.DB_USER || 'prasowla_roots',
  password: process.env.DB_PASSWORD || 'bMsgK-8?3DxV({W)',
  database: process.env.DB_NAME || 'prasowla_idea_capture',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

export default pool;