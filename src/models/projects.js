import db from './db.js';

/**
 * Retrieves all service projects along with the name of the organization
 * that sponsors each one.
 *
 * The project table only stores organization_id, so a JOIN is needed to pull the
 * sponsor's name from the organization table. INNER JOIN is correct here because
 * every project is required to have a sponsor.
 *
 * Results are ordered by date so the page reads as a chronological schedule.
 */
const getAllProjects = async () => {
  const query = `
    SELECT
      p.project_id,
      p.title,
      p.description,
      p.location,
      p.project_date,
      o.organization_id,
      o.name AS organization_name
    FROM public.project p
    JOIN public.organization o ON o.organization_id = p.organization_id
    ORDER BY p.project_date;
  `;

  const result = await db.query(query);

  return result.rows;
};

export { getAllProjects };
