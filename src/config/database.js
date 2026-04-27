import {Pool} from 'pg';
import dotenv from 'dotenv';

//Centralización de la configuración de la base de datos utilizando las variables de entorno

// Cargue de las variables del archivo .env
dotenv.config();

//Configuración de la BD
const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
})

//Test de conexión
async function testConnection(){
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

