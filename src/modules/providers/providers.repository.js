import pool from "../../config/database.js";

export async function findProviderByUserId(userId) {
  const result = await pool.query(
    `SELECT p.*, u.name, u.email, u.role
     FROM providers p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = $1`,
    [userId]
  );
  return result.rows[0];
}

export async function updateProviderProfile(userId, { phone, city, bio, skills, portfolioUrl, schedule, basePrice, serviceDescription, mainCategory, yearsExperience, }) {
  const result = await pool.query(
    `UPDATE providers SET
       phone = COALESCE($2, phone),
       city = COALESCE($3, city),
       bio = COALESCE($4, bio),
       skills = COALESCE($5, skills),
       portfolio_url = COALESCE($6, portfolio_url),
       schedule = COALESCE($7, schedule),
       base_price = COALESCE($8, base_price),
       service_description = COALESCE($9, service_description),
       main_category = COALESCE($10, main_category),
       years_experience = COALESCE($11, years_experience),
       updated_at = NOW()
     WHERE user_id = $1
     RETURNING *`,
    [userId, phone, city, bio, skills, portfolioUrl, schedule, basePrice, serviceDescription, mainCategory, yearsExperience]
  );
  return result.rows[0];
}

export async function getProviderProfileCompletion(userId) {
  const result = await pool.query(
    `SELECT
       (CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END +
        CASE WHEN skills IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END +
        CASE WHEN city IS NOT NULL AND city != '' THEN 1 ELSE 0 END +
        CASE WHEN schedule IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN base_price IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN service_description IS NOT NULL AND service_description != '' THEN 1 ELSE 0 END +
        CASE WHEN main_category IS NOT NULL AND main_category != '' THEN 1 ELSE 0 END) * 100 / 8
       AS completion_percentage
     FROM providers WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0]?.completion_percentage ?? 0;
}

export async function searchProviders({ category, city, keyword, minPrice, maxPrice, limit = 20, offset = 0 }) {
  const conditions = ["1=1"];
  const values = [];
  let idx = 1;

  if (category) {
    conditions.push(`p.main_category = $${idx++}`);
    values.push(category);
  }
  if (city) {
    conditions.push(`LOWER(p.city) = LOWER($${idx++})`);
    values.push(city);
  }
  if (keyword) {
    conditions.push(`(LOWER(u.name) LIKE $${idx} OR LOWER(p.bio) LIKE $${idx} OR LOWER(p.service_description) LIKE $${idx})`);
    values.push(`%${keyword.toLowerCase()}%`);
    idx++;
  }
  if (minPrice) {
    conditions.push(`p.base_price >= $${idx++}`);
    values.push(minPrice);
  }
  if (maxPrice) {
    conditions.push(`p.base_price <= $${idx++}`);
    values.push(maxPrice);
  }

  // RF-07: Relevance score = (services_done * 0.6) + (completion% * 0.4)
  const query = `
    SELECT
      p.user_id,
      u.name,
      p.city,
      p.bio,
      p.skills,
      p.main_category,
      p.base_price,
      p.service_description,
      p.years_experience,
      p.services_done,
      (
        (CASE WHEN p.bio IS NOT NULL AND p.bio != '' THEN 1 ELSE 0 END +
         CASE WHEN p.skills IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN p.phone IS NOT NULL AND p.phone != '' THEN 1 ELSE 0 END +
         CASE WHEN p.city IS NOT NULL AND p.city != '' THEN 1 ELSE 0 END +
         CASE WHEN p.schedule IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN p.base_price IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN p.service_description IS NOT NULL AND p.service_description != '' THEN 1 ELSE 0 END +
         CASE WHEN p.main_category IS NOT NULL AND p.main_category != '' THEN 1 ELSE 0 END) * 100 / 8
      ) AS profile_completion,
      (COALESCE(p.services_done, 0) * 0.6 +
       (CASE WHEN p.bio IS NOT NULL AND p.bio != '' THEN 1 ELSE 0 END +
        CASE WHEN p.skills IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN p.phone IS NOT NULL AND p.phone != '' THEN 1 ELSE 0 END +
        CASE WHEN p.city IS NOT NULL AND p.city != '' THEN 1 ELSE 0 END +
        CASE WHEN p.schedule IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN p.base_price IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN p.service_description IS NOT NULL AND p.service_description != '' THEN 1 ELSE 0 END +
        CASE WHEN p.main_category IS NOT NULL AND p.main_category != '' THEN 1 ELSE 0 END) * 100 / 8 * 0.4
      ) AS relevance_score
    FROM providers p
    JOIN users u ON u.id = p.user_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY relevance_score DESC
    LIMIT $${idx++} OFFSET $${idx}
  `;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
}

export async function getPublicProviderProfile(userId) {
  const result = await pool.query(
    `SELECT
       p.user_id,
       u.name,
       p.city,
       p.bio,
       p.skills,
       p.main_category,
       p.base_price,
       p.service_description,
       p.years_experience,
       p.services_done,
       p.schedule,
       p.portfolio_url
     FROM providers p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = $1`,
    [userId]
  );
  return result.rows[0];
}
