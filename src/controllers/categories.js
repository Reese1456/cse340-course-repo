import {
  getAllCategories,
  getCategoryDetails,
  getProjectsByCategoryId,
} from '../models/categories.js';

/**
 * Controller for the service project categories page.
 */
const showCategoriesPage = async (req, res) => {
  const categories = await getAllCategories();
  const title = 'Service Project Categories';

  res.render('categories', { title, categories });
};

/**
 * Controller for a single category's detail page.
 *
 * The category id is a route parameter (/category/:id), read from req.params.
 * If no category matches, forward a 404 to the error handler.
 */
const showCategoryDetailsPage = async (req, res, next) => {
  const categoryId = req.params.id;
  const category = await getCategoryDetails(categoryId);

  if (!category) {
    const error = new Error('Category not found');
    error.status = 404;
    return next(error);
  }

  const projects = await getProjectsByCategoryId(categoryId);

  res.render('category', {
    title: category.name,
    category,
    projects,
  });
};

export { showCategoriesPage, showCategoryDetailsPage };
