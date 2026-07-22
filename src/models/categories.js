import db from './db.js';

/**
 * Retrieves all service project categories, along with how many projects fall
 * under each one.
 *
 * The count comes through the project_category join table. A LEFT JOIN is used
 * so that a brand new category with no projects yet still appears on the page
 * (with a count of zero) instead of disappearing from the list.
 *
 * COUNT() returns a bigint, which the pg driver hands back as a string to avoid
 * precision loss, so it is cast to an int for convenience in the view.
 */
const getAllCategories = async () => {
  const query = `
    SELECT
      c.category_id,
      c.name,
      c.description,
      COUNT(pc.project_id)::int AS project_count
    FROM public.category c
    LEFT JOIN public.project_category pc ON pc.category_id = c.category_id
    GROUP BY c.category_id, c.name, c.description
    ORDER BY c.name;
  `;

  const result = await db.query(query);

  return result.rows;
};

/**
 * Retrieves a single category by its id.
 *
 * The id comes from the URL, so it is passed as a parameterized value ($1) to
 * guard against SQL injection.
 *
 * Returns the category row, or undefined if no category has that id.
 */
const getCategoryDetails = async (categoryId) => {
  const query = `
    SELECT category_id, name, description
    FROM public.category
    WHERE category_id = $1;
  `;

  const result = await db.query(query, [categoryId]);

  return result.rows[0];
};

/**
 * Retrieves all service projects that belong to a given category.
 *
 * Projects are linked to categories through the project_category join table, so
 * the query joins through it. The organization name is pulled in for display,
 * and results are ordered by date.
 */
const getProjectsByCategoryId = async (categoryId) => {
  const query = `
    SELECT
      p.project_id,
      p.title,
      p.location,
      p.project_date,
      o.organization_id,
      o.name AS organization_name
    FROM public.project p
    JOIN public.project_category pc ON pc.project_id = p.project_id
    JOIN public.organization o ON o.organization_id = p.organization_id
    WHERE pc.category_id = $1
    ORDER BY p.project_date;
  `;

  const result = await db.query(query, [categoryId]);

  return result.rows;
};

/**
 * Retrieves all categories that a given project is tagged with.
 *
 * This is the other direction of the many-to-many relationship, used to show
 * category tags on the project details page.
 */
const getCategoriesByProjectId = async (projectId) => {
  const query = `
    SELECT c.category_id, c.name
    FROM public.category c
    JOIN public.project_category pc ON pc.category_id = c.category_id
    WHERE pc.project_id = $1
    ORDER BY c.name;
  `;

  const result = await db.query(query, [projectId]);

  return result.rows;
};

export {
  getAllCategories,
  getCategoryDetails,
  getProjectsByCategoryId,
  getCategoriesByProjectId,
};
