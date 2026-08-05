import db from './db.js';

/**
 * Signs a user up to volunteer for a project.
 *
 * ON CONFLICT DO NOTHING makes this safe to call even if the user is already
 * signed up (for example, a double form submission), rather than failing on
 * the composite primary key.
 */
const addVolunteer = async (userId, projectId) => {
  const query = `
    INSERT INTO public.project_volunteer (user_id, project_id)
    VALUES ($1, $2)
    ON CONFLICT (project_id, user_id) DO NOTHING;
  `;

  await db.query(query, [userId, projectId]);
};

/**
 * Removes a user's volunteer signup for a project.
 */
const removeVolunteer = async (userId, projectId) => {
  const query = `
    DELETE FROM public.project_volunteer
    WHERE user_id = $1 AND project_id = $2;
  `;

  await db.query(query, [userId, projectId]);
};

/**
 * Checks whether a user is currently signed up to volunteer for a project.
 */
const isVolunteering = async (userId, projectId) => {
  const query = `
    SELECT 1
    FROM public.project_volunteer
    WHERE user_id = $1 AND project_id = $2;
  `;

  const result = await db.query(query, [userId, projectId]);

  return result.rows.length > 0;
};

/**
 * Retrieves every project a user has signed up to volunteer for, including
 * the sponsoring organization's name for display on the dashboard.
 */
const getVolunteeredProjectsByUserId = async (userId) => {
  const query = `
    SELECT
      p.project_id,
      p.title,
      p.location,
      p.project_date,
      o.organization_id,
      o.name AS organization_name
    FROM public.project_volunteer pv
    JOIN public.project p ON p.project_id = pv.project_id
    JOIN public.organization o ON o.organization_id = p.organization_id
    WHERE pv.user_id = $1
    ORDER BY p.project_date;
  `;

  const result = await db.query(query, [userId]);

  return result.rows;
};

export {
  addVolunteer,
  removeVolunteer,
  isVolunteering,
  getVolunteeredProjectsByUserId,
};
