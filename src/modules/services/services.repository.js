import pool from "../../config/database.js";

export async function createService(id, providerId, { name, description, category, mode, basePrice }) {
  const result = await pool.query(
    `INSERT INTO services (id, provider_id, name, description, category, mode, base_price)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, providerId, name, description, category, mode, basePrice]
  );
  return result.rows[0];
}

export async function findServicesByProvider(providerId) {
  const result = await pool.query(
    `SELECT * FROM services WHERE provider_id = $1 ORDER BY created_at DESC`,
    [providerId]
  );
  return result.rows;
}

export async function findServiceById(id) {
  const result = await pool.query(
    `SELECT s.*, u.name AS provider_name, p.city, p.phone
     FROM services s
     JOIN providers p ON p.user_id = s.provider_id
     JOIN users u ON u.id = s.provider_id
     WHERE s.id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function updateService(id, providerId, { name, description, category, mode, basePrice }) {
  const result = await pool.query(
    `UPDATE services SET
       name = COALESCE($3, name),
       description = COALESCE($4, description),
       category = COALESCE($5, category),
       mode = COALESCE($6, mode),
       base_price = COALESCE($7, base_price),
       updated_at = NOW()
     WHERE id = $1 AND provider_id = $2
     RETURNING *`,
    [id, providerId, name, description, category, mode, basePrice]
  );
  return result.rows[0];
}

export async function deleteService(id, providerId) {
  const result = await pool.query(
    `DELETE FROM services WHERE id = $1 AND provider_id = $2 RETURNING id`,
    [id, providerId]
  );
  return result.rows[0];
}
