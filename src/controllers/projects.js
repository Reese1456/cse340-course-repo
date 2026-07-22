import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';

// How many upcoming projects to show on the projects listing page.
const NUMBER_OF_UPCOMING_PROJECTS = 5;

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

  res.render('project', { title: project.title, project });
};

export { showProjectsPage, showProjectDetailsPage };
