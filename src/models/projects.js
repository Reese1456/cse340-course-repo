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

/**
 * Retrieves the next `numberOfProjects` upcoming service projects.
 *
 * "Upcoming" means the project date has not yet passed, so past projects are
 * filtered out. Results are ordered by date and capped with LIMIT so the page
 * shows just the soonest few. The organization name comes through the same JOIN
 * used by getAllProjects.
 *
 * The limit is passed as a parameterized value ($1) rather than interpolated
 * into the query string.
 */
const getUpcomingProjects = async (numberOfProjects) => {
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
    WHERE p.project_date >= CURRENT_DATE
    ORDER BY p.project_date
    LIMIT $1;
  `;

  const result = await db.query(query, [numberOfProjects]);

  return result.rows;
};

/**
 * Retrieves a single project by its id, including its sponsoring
 * organization's id and name for linking back to the organization page.
 *
 * The id comes from the URL, so it is passed as a parameterized value ($1) to
 * guard against SQL injection.
 *
 * Returns the project row, or undefined if no project has that id.
 */
const getProjectDetails = async (id) => {
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
    WHERE p.project_id = $1;
  `;

  const result = await db.query(query, [id]);

  return result.rows[0];
};

export { getAllProjects, getUpcomingProjects, getProjectDetails };
