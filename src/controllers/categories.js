import { body, validationResult } from 'express-validator';
import {
  getAllCategories,
  getCategoryDetails,
  getProjectsByCategoryId,
  getCategoriesByProjectId,
  createCategory,
  updateCategory,
  updateCategoryAssignments,
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';

const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('Category name must be between 3 and 100 characters'),
];

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

const showNewCategoryForm = (req, res) => {
  res.render('new-category', { title: 'Add New Category' });
};

const processNewCategoryForm = async (req, res) => {
  const results = validationResult(req);

  if (!results.isEmpty()) {
    results.array().forEach((error) => req.flash('error', error.msg));
    return res.redirect('/new-category');
  }

  try {
    const categoryId = await createCategory(req.body.name);
    req.flash('success', 'Category added successfully!');
    return res.redirect(`/category/${categoryId}`);
  } catch (error) {
    if (error.code === '23505') {
      req.flash('error', 'A category with that name already exists.');
      return res.redirect('/new-category');
    }

    throw error;
  }
};

const showEditCategoryForm = async (req, res, next) => {
  const category = await getCategoryDetails(req.params.id);

  if (!category) {
    const error = new Error('Category not found');
    error.status = 404;
    return next(error);
  }

  return res.render('edit-category', {
    title: 'Edit Category',
    category,
  });
};

const processEditCategoryForm = async (req, res) => {
  const results = validationResult(req);

  if (!results.isEmpty()) {
    results.array().forEach((error) => req.flash('error', error.msg));
    return res.redirect(`/edit-category/${req.params.id}`);
  }

  try {
    await updateCategory(req.params.id, req.body.name);
    req.flash('success', 'Category updated successfully!');
    return res.redirect(`/category/${req.params.id}`);
  } catch (error) {
    if (error.code === '23505') {
      req.flash('error', 'A category with that name already exists.');
      return res.redirect(`/edit-category/${req.params.id}`);
    }

    throw error;
  }
};

const showAssignCategoriesForm = async (req, res, next) => {
  const projectId = req.params.projectId;
  const project = await getProjectDetails(projectId);

  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    return next(error);
  }

  const categories = await getAllCategories();
  const assignedCategories = await getCategoriesByProjectId(projectId);

  return res.render('assign-categories', {
    title: 'Assign Categories to Project',
    project,
    categories,
    assignedCategories,
  });
};

const processAssignCategoriesForm = async (req, res) => {
  const projectId = req.params.projectId;
  const selectedCategoryIds = req.body.categoryIds || [];
  const categoryIds = Array.isArray(selectedCategoryIds)
    ? selectedCategoryIds
    : [selectedCategoryIds];

  await updateCategoryAssignments(projectId, categoryIds);
  req.flash('success', 'Categories updated successfully!');
  return res.redirect(`/project/${projectId}`);
};

export {
  showCategoriesPage,
  showCategoryDetailsPage,
  showNewCategoryForm,
  processNewCategoryForm,
  showEditCategoryForm,
  processEditCategoryForm,
  showAssignCategoriesForm,
  processAssignCategoriesForm,
  categoryValidation,
};
