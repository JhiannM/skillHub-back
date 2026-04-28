import pool from "../../config/database.js";

export async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT id, name, email, password, role FROM users WHERE email = $1",
    [email]
  );

  return result.rows[0];
}


export async function findExistingUserByEmail(email) {
  const result = await pool.query(
    "SELECT id, name, email FROM users WHERE email = $1",
    [email]
  );

  return result.rows[0];
}

export async function createUser(id, name, email, password, role) {
  const result = await pool.query(
    `INSERT INTO users (id, name, email, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role`,
    [id, name, email, password, role]
  );

  return result.rows[0];
}

export async function roleSpecificInsert(userId, role) {
  if (role === "PROVIDER") {
    await pool.query(
      "INSERT INTO providers (user_id) VALUES ($1)",
      [userId]
    );
  }
else if (role === "CUSTOMER") {
    await pool.query(
      "INSERT INTO customers (user_id) VALUES ($1)", 
      [userId]
    );
  }
}  

export async function findUserById(id) {
  const result = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
}