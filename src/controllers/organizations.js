import { body, validationResult } from 'express-validator';
import {
  getAllOrganizations,
  getOrganizationDetails,
  getProjectsByOrganizationId,
  createOrganization,
  updateOrganization,
} from '../models/organizations.js';

const organizationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Organization name is required')
    .bail()
    .isLength({ min: 3, max: 150 })
    .withMessage('Organization name must be between 3 and 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Organization description is required')
    .bail()
    .isLength({ max: 500 })
    .withMessage('Organization description cannot exceed 500 characters'),
  body('contactEmail')
    .trim()
    .notEmpty()
    .withMessage('Contact email is required')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

const organizationUpdateValidation = [
  ...organizationValidation,
  body('logoFilename')
    .trim()
    .notEmpty()
    .withMessage('Logo filename is required')
    .bail()
    .isLength({ max: 255 })
    .withMessage('Logo filename cannot exceed 255 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Logo filename contains invalid characters'),
];

/**
 * Controller for the organizations listing page.
 */
const showOrganizationsPage = async (req, res) => {
  const organizations = await getAllOrganizations();
  const title = 'Our Partner Organizations';

  res.render('organizations', { title, organizations });
};

/**
 * Controller for a single organization's detail page.
 *
 * The organization id is a route parameter (/organization/:id), so it is read
 * from req.params. If no organization matches, we forward a 404 to the error
 * handler instead of rendering a page with missing data.
 */
const showOrganizationDetailsPage = async (req, res, next) => {
  const organizationId = req.params.id;
  const organization = await getOrganizationDetails(organizationId);

  if (!organization) {
    const error = new Error('Organization not found');
    error.status = 404;
    return next(error);
  }

  const projects = await getProjectsByOrganizationId(organizationId);

  res.render('organization', {
    title: organization.name,
    organization,
    projects,
  });
};

const showNewOrganizationForm = (req, res) => {
  res.render('new-organization', { title: 'Add New Organization' });
};

const processNewOrganizationForm = async (req, res) => {
  const results = validationResult(req);

  if (!results.isEmpty()) {
    results.array().forEach((error) => req.flash('error', error.msg));
    return res.redirect('/new-organization');
  }

  const { name, description, contactEmail } = req.body;
  const logoFilename = 'placeholder-logo.png';
  const organizationId = await createOrganization(
    name,
    description,
    contactEmail,
    logoFilename,
  );

  req.flash('success', 'Organization added successfully!');
  return res.redirect(`/organization/${organizationId}`);
};

const showEditOrganizationForm = async (req, res, next) => {
  const organization = await getOrganizationDetails(req.params.id);

  if (!organization) {
    const error = new Error('Organization not found');
    error.status = 404;
    return next(error);
  }

  return res.render('edit-organization', {
    title: 'Edit Organization',
    organization,
  });
};

const processEditOrganizationForm = async (req, res) => {
  const results = validationResult(req);

  if (!results.isEmpty()) {
    results.array().forEach((error) => req.flash('error', error.msg));
    return res.redirect(`/edit-organization/${req.params.id}`);
  }

  const { name, description, contactEmail, logoFilename } = req.body;
  await updateOrganization(
    req.params.id,
    name,
    description,
    contactEmail,
    logoFilename,
  );

  req.flash('success', 'Organization updated successfully!');
  return res.redirect(`/organization/${req.params.id}`);
};

export {
  showOrganizationsPage,
  showOrganizationDetailsPage,
  showNewOrganizationForm,
  processNewOrganizationForm,
  showEditOrganizationForm,
  processEditOrganizationForm,
  organizationValidation,
  organizationUpdateValidation,
};
