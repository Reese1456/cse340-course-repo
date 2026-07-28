import { body, validationResult } from 'express-validator';
import {
  getUpcomingProjects,
  getProjectDetails,
  createProject,
  updateProject,
} from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';
import { getAllOrganizations } from '../models/organizations.js';

// How many upcoming projects to show on the projects listing page.
const NUMBER_OF_UPCOMING_PROJECTS = 5;

const projectValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .bail()
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .bail()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .bail()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .bail()
    .isISO8601({ strict: true })
    .withMessage('Date must be a valid date'),
  body('organizationId')
    .notEmpty()
    .withMessage('Organization is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Organization must be valid'),
];

/**
 * Controller for the service projects listing page.
 * Shows only the next few upcoming projects rather than every project.
 */
const showProjectsPage = async (req, res) => {
  const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
  const title = 'Upcoming Service Projects';

  res.render('projects', { title, projects });
};

/**
 * Controller for a single project's detail page.
 *
 * The project id is a route parameter (/project/:id), read from req.params.
 * If no project matches, forward a 404 to the error handler.
 */
const showProjectDetailsPage = async (req, res, next) => {
  const projectId = req.params.id;
  const project = await getProjectDetails(projectId);

  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    return next(error);
  }

  const categories = await getCategoriesByProjectId(projectId);

  res.render('project', { title: project.title, project, categories });
};

const showNewProjectForm = async (req, res) => {
  const organizations = await getAllOrganizations();

  res.render('new-project', {
    title: 'Add New Service Project',
    organizations,
  });
};

const processNewProjectForm = async (req, res) => {
  const results = validationResult(req);

  if (!results.isEmpty()) {
    results.array().forEach((error) => req.flash('error', error.msg));
    return res.redirect('/new-project');
  }

  const { title, description, location, date, organizationId } = req.body;
  const projectId = await createProject(
    title,
    description,
    location,
    date,
    organizationId,
  );

  req.flash('success', 'New service project created successfully!');
  return res.redirect(`/project/${projectId}`);
};

const showEditProjectForm = async (req, res, next) => {
  const project = await getProjectDetails(req.params.id);

  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    return next(error);
  }

  const organizations = await getAllOrganizations();

  return res.render('edit-project', {
    title: 'Edit Service Project',
    project,
    organizations,
  });
};

const processEditProjectForm = async (req, res) => {
  const results = validationResult(req);

  if (!results.isEmpty()) {
    results.array().forEach((error) => req.flash('error', error.msg));
    return res.redirect(`/edit-project/${req.params.id}`);
  }

  const { title, description, location, date, organizationId } = req.body;
  await updateProject(
    req.params.id,
    title,
    description,
    location,
    date,
    organizationId,
  );

  req.flash('success', 'Service project updated successfully!');
  return res.redirect(`/project/${req.params.id}`);
};

export {
  showProjectsPage,
  showProjectDetailsPage,
  showNewProjectForm,
  processNewProjectForm,
  showEditProjectForm,
  processEditProjectForm,
  projectValidation,
};
