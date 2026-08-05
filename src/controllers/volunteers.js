import { addVolunteer, removeVolunteer } from '../models/volunteers.js';
import { getProjectDetails } from '../models/projects.js';

/**
 * Handles a volunteer signup for a project.
 *
 * The route is protected by requireLogin, so req.session.user is guaranteed
 * to exist here.
 */
const processVolunteerSignup = async (req, res, next) => {
  const projectId = req.params.id;
  const project = await getProjectDetails(projectId);

  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    return next(error);
  }

  await addVolunteer(req.session.user.user_id, projectId);
  req.flash('success', 'You have signed up to volunteer for this project!');

  return res.redirect(`/project/${projectId}`);
};

/**
 * Handles removing a volunteer signup.
 *
 * Used from both the project details page and the dashboard, so a hidden
 * redirectTo field on the form says which page to return to.
 */
const processVolunteerRemoval = async (req, res) => {
  const projectId = req.params.id;

  await removeVolunteer(req.session.user.user_id, projectId);
  req.flash('success', 'You are no longer volunteering for this project.');

  // A request with no form body leaves req.body undefined in Express 5, so read
  // the field defensively rather than letting it throw.
  const redirectTo = req.body?.redirectTo === 'dashboard'
    ? '/dashboard'
    : `/project/${projectId}`;
  return res.redirect(redirectTo);
};

export { processVolunteerSignup, processVolunteerRemoval };
