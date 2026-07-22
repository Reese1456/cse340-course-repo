/**
 * Controllers for error handling.
 */

/**
 * Deliberately triggers a 500 error, used to test the global error handler.
 */
const triggerTestError = (req, res, next) => {
  const error = new Error('Intentional test error');
  error.status = 500;
  next(error);
};

/**
 * Catch-all handler for any request that matched no real route (404).
 */
const handleNotFound = (req, res, next) => {
  const error = new Error('Page not found');
  error.status = 404;
  next(error);
};

/**
 * Global error handler. The four-parameter signature is what marks this as
 * Express error-handling middleware.
 */
const handleErrors = (err, req, res, next) => {
  const status = err.status || 500;
  console.error(`Error ${status}: ${err.message}`);

  const title = status === 404 ? 'Page Not Found' : 'Server Error';
  const view = status === 404 ? 'errors/404' : 'errors/500';

  res.status(status).render(view, { title });
};

export { triggerTestError, handleNotFound, handleErrors };
