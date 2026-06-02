import { Pool } from "pg";
import dotenv from "dotenv";

// Centralizacion de la configuracion de la base de datos utilizando variables de entorno.
dotenv.config();

const useSsl = process.env.DB_SSL === "true" || process.env.NODE_ENV === "production";

const pool = new Pool(process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || "5432", 10),
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Conexion a PostgreSQL exitosa");
    client.release();
  } catch (error) {
    console.error("Error al conectar con PostgreSQL:", error.message);
  }
}

testConnection();

export default pool;
