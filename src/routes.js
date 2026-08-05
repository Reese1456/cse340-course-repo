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
import { processVolunteerSignup, processVolunteerRemoval } from './controllers/volunteers.js';
import {
  showUserRegistrationForm,
  processUserRegistrationForm,
  showLoginForm,
  processLoginForm,
  processLogout,
  showDashboard,
  showUsersPage,
  requireLogin,
  requireRole,
  userRegistrationValidation,
  userLoginValidation,
} from './controllers/users.js';
import { triggerTestError, handleNotFound } from './controllers/errors.js';

const router = Router();

// Browsing organizations, projects, and categories is open to everyone.
// Anything that creates or changes data is restricted to admins, and the check
// lives here on the server so it cannot be bypassed by typing the URL directly.
router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/new-organization', requireRole('admin'), showNewOrganizationForm);
router.post(
  '/new-organization',
  requireRole('admin'),
  organizationValidation,
  processNewOrganizationForm,
);
router.get('/edit-organization/:id', requireRole('admin'), showEditOrganizationForm);
router.post(
  '/edit-organization/:id',
  requireRole('admin'),
  organizationUpdateValidation,
  processEditOrganizationForm,
);

router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);
router.get('/new-project', requireRole('admin'), showNewProjectForm);
router.post('/new-project', requireRole('admin'), projectValidation, processNewProjectForm);
router.get('/edit-project/:id', requireRole('admin'), showEditProjectForm);
router.post(
  '/edit-project/:id',
  requireRole('admin'),
  projectValidation,
  processEditProjectForm,
);
router.get('/assign-categories/:projectId', requireRole('admin'), showAssignCategoriesForm);
router.post('/assign-categories/:projectId', requireRole('admin'), processAssignCategoriesForm);

// Volunteering for a project is open to any logged-in user (not just admins).
router.post('/project/:id/volunteer', requireLogin, processVolunteerSignup);
router.post('/project/:id/unvolunteer', requireLogin, processVolunteerRemoval);

router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);
router.get('/new-category', requireRole('admin'), showNewCategoryForm);
router.post('/new-category', requireRole('admin'), categoryValidation, processNewCategoryForm);
router.get('/edit-category/:id', requireRole('admin'), showEditCategoryForm);
router.post(
  '/edit-category/:id',
  requireRole('admin'),
  categoryValidation,
  processEditCategoryForm,
);

// User registration, login, and logout
router.get('/register', showUserRegistrationForm);
router.post('/register', userRegistrationValidation, processUserRegistrationForm);
router.get('/login', showLoginForm);
router.post('/login', userLoginValidation, processLoginForm);
router.get('/logout', processLogout);

// Any logged-in user can see their own dashboard, but only an admin can see the
// list of every registered account.
router.get('/dashboard', requireLogin, showDashboard);
router.get('/users', requireRole('admin'), showUsersPage);

// Test route to deliberately trigger a 500 error
router.get('/test-error', triggerTestError);

// Catch-all: any request that reaches here matched no real route (404)
router.use(handleNotFound);

export default router;
