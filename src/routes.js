import { Router } from 'express';
import { showHomePage } from './controllers/index.js';
import {
  showOrganizationsPage,
  showOrganizationDetailsPage,
  showNewOrganizationForm,
  processNewOrganizationForm,
  showEditOrganizationForm,
  processEditOrganizationForm,
  organizationValidation,
  organizationUpdateValidation,
} from './controllers/organizations.js';
import {
  showProjectsPage,
  showProjectDetailsPage,
  showNewProjectForm,
  processNewProjectForm,
  showEditProjectForm,
  processEditProjectForm,
  projectValidation,
} from './controllers/projects.js';
import {
  showCategoriesPage,
  showCategoryDetailsPage,
  showNewCategoryForm,
  processNewCategoryForm,
  showEditCategoryForm,
  processEditCategoryForm,
  showAssignCategoriesForm,
  processAssignCategoriesForm,
  categoryValidation,
} from './controllers/categories.js';
import { triggerTestError, handleNotFound } from './controllers/errors.js';

const router = Router();

router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/new-organization', showNewOrganizationForm);
router.post(
  '/new-organization',
  organizationValidation,
  processNewOrganizationForm,
);
router.get('/edit-organization/:id', showEditOrganizationForm);
router.post(
  '/edit-organization/:id',
  organizationUpdateValidation,
  processEditOrganizationForm,
);

router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);
router.get('/new-project', showNewProjectForm);
router.post('/new-project', projectValidation, processNewProjectForm);
router.get('/edit-project/:id', showEditProjectForm);
router.post('/edit-project/:id', projectValidation, processEditProjectForm);
router.get('/assign-categories/:projectId', showAssignCategoriesForm);
router.post('/assign-categories/:projectId', processAssignCategoriesForm);

router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);
router.get('/new-category', showNewCategoryForm);
router.post('/new-category', categoryValidation, processNewCategoryForm);
router.get('/edit-category/:id', showEditCategoryForm);
router.post(
  '/edit-category/:id',
  categoryValidation,
  processEditCategoryForm,
);

// Test route to deliberately trigger a 500 error
router.get('/test-error', triggerTestError);

// Catch-all: any request that reaches here matched no real route (404)
router.use(handleNotFound);

export default router;
