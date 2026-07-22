import { getAllCategories } from '../models/categories.js';

/**
 * Controller for the service project categories page.
 */
const showCategoriesPage = async (req, res) => {
  const categories = await getAllCategories();
  const title = 'Service Project Categories';

  res.render('categories', { title, categories });
};

export { showCategoriesPage };
