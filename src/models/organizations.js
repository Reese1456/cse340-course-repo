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

/**
 * Retrieves a single organization by its id.
 *
 * The id comes from the URL, so it is passed as a parameterized value ($1)
 * rather than being interpolated into the query string. This lets the pg driver
 * safely escape it and protects against SQL injection.
 *
 * Returns the organization row, or undefined if no organization has that id.
 */
const getOrganizationDetails = async (organizationId) => {
  const query = `
    SELECT organization_id, name, description, contact_email, logo_filename
    FROM public.organization
    WHERE organization_id = $1;
  `;

  const result = await db.query(query, [organizationId]);

  return result.rows[0];
};

/**
 * Retrieves all service projects sponsored by a given organization.
 *
 * Ordered by date so the list reads as a chronological schedule.
 */
const getProjectsByOrganizationId = async (organizationId) => {
  const query = `
    SELECT project_id, title, description, location, project_date
    FROM public.project
    WHERE organization_id = $1
    ORDER BY project_date;
  `;

  const result = await db.query(query, [organizationId]);

  return result.rows;
};

export { getAllOrganizations, getOrganizationDetails, getProjectsByOrganizationId };
