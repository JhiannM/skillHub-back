import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    const migrationPath = path.join(__dirname, 'src', 'database', 'migrations', '001__create_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Ejecutando migración...');
    await pool.query(sql);
    console.log('¡Migración ejecutada con éxito!');
  } catch (error) {
    console.error('Error al ejecutar la migración:', error);
  } finally {
    // Es importante cerrar el pool para que el script de Node.js termine
    await pool.end();
  }
}

runMigrations();
