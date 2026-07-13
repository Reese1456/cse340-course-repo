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

export { getAllCategories };
