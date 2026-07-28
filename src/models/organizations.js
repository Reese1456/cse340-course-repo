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

/**
 * Creates an organization and returns its generated id.
 */
const createOrganization = async (name, description, contactEmail, logoFilename) => {
  const query = `
    INSERT INTO public.organization (name, description, contact_email, logo_filename)
    VALUES ($1, $2, $3, $4)
    RETURNING organization_id;
  `;

  const result = await db.query(query, [name, description, contactEmail, logoFilename]);

  if (result.rows.length === 0) {
    throw new Error('Failed to create organization');
  }

  return result.rows[0].organization_id;
};

/**
 * Updates an organization and returns its id.
 */
const updateOrganization = async (
  organizationId,
  name,
  description,
  contactEmail,
  logoFilename,
) => {
  const query = `
    UPDATE public.organization
    SET name = $1,
        description = $2,
        contact_email = $3,
        logo_filename = $4
    WHERE organization_id = $5
    RETURNING organization_id;
  `;

  const result = await db.query(query, [
    name,
    description,
    contactEmail,
    logoFilename,
    organizationId,
  ]);

  if (result.rows.length === 0) {
    const error = new Error('Organization not found');
    error.status = 404;
    throw error;
  }

  return result.rows[0].organization_id;
};

export {
  getAllOrganizations,
  getOrganizationDetails,
  getProjectsByOrganizationId,
  createOrganization,
  updateOrganization,
};
