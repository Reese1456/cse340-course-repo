import db from './db.js';

/**
 * Retrieves all partner organizations from the database.
 *
 * Columns are listed explicitly (rather than SELECT *) to avoid pulling back
 * unused data and to guard against accidentally exposing new columns.
 */
const getAllOrganizations = async () => {
  const query = `
    SELECT organization_id, name, description, contact_email, logo_filename
    FROM public.organization;
  `;

  const result = await db.query(query);

  return result.rows;
};

export { getAllOrganizations };
