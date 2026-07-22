import {
  getAllOrganizations,
  getOrganizationDetails,
  getProjectsByOrganizationId,
} from '../models/organizations.js';

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

export { showOrganizationsPage, showOrganizationDetailsPage };
