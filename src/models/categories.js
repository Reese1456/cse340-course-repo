import db, { withTransaction } from './db.js';

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

/**
 * Creates a category. The Week 4 form only asks for a name, so a useful default
 * description is generated to satisfy the existing database schema.
 */
const createCategory = async (name) => {
  const description = `Service projects in the ${name} category.`;
  const query = `
    INSERT INTO public.category (name, description)
    VALUES ($1, $2)
    RETURNING category_id;
  `;

  const result = await db.query(query, [name, description]);

  if (result.rows.length === 0) {
    throw new Error('Failed to create category');
  }

  return result.rows[0].category_id;
};

/**
 * Updates the editable category name while preserving its description.
 */
const updateCategory = async (categoryId, name) => {
  const query = `
    UPDATE public.category
    SET description = CASE
          WHEN description = 'Service projects in the ' || name || ' category.'
            THEN 'Service projects in the ' || $1 || ' category.'
          ELSE description
        END,
        name = $1
    WHERE category_id = $2
    RETURNING category_id;
  `;

  const result = await db.query(query, [name, categoryId]);

  if (result.rows.length === 0) {
    const error = new Error('Category not found');
    error.status = 404;
    throw error;
  }

  return result.rows[0].category_id;
};

const assignCategoryToProject = async (categoryId, projectId, queryable = db) => {
  const query = `
    INSERT INTO public.project_category (category_id, project_id)
    VALUES ($1, $2);
  `;

  await queryable.query(query, [categoryId, projectId]);
};

/**
 * Replaces all category assignments for a project with the requested set.
 */
const updateCategoryAssignments = async (projectId, categoryIds) => {
  const normalizedProjectId = Number(projectId);
  const uniqueCategoryIds = [...new Set(categoryIds.map(Number))];

  if (
    !Number.isInteger(normalizedProjectId)
    || normalizedProjectId < 1
    || uniqueCategoryIds.some((id) => !Number.isInteger(id) || id < 1)
  ) {
    const error = new Error('Invalid project or category id');
    error.status = 400;
    throw error;
  }

  await withTransaction(async (client) => {
    const projectResult = await client.query(
      'SELECT project_id FROM public.project WHERE project_id = $1;',
      [normalizedProjectId],
    );

    if (projectResult.rows.length === 0) {
      const error = new Error('Project not found');
      error.status = 404;
      throw error;
    }

    if (uniqueCategoryIds.length > 0) {
      const categoryResult = await client.query(
        `
          SELECT category_id
          FROM public.category
          WHERE category_id = ANY($1::int[]);
        `,
        [uniqueCategoryIds],
      );

      if (categoryResult.rows.length !== uniqueCategoryIds.length) {
        const error = new Error('One or more categories were not found');
        error.status = 400;
        throw error;
      }
    }

    await client.query(
      'DELETE FROM public.project_category WHERE project_id = $1;',
      [normalizedProjectId],
    );

    for (const categoryId of uniqueCategoryIds) {
      await assignCategoryToProject(categoryId, normalizedProjectId, client);
    }
  });
};

export {
  getAllCategories,
  getCategoryDetails,
  getProjectsByCategoryId,
  getCategoriesByProjectId,
  createCategory,
  updateCategory,
  updateCategoryAssignments,
};
