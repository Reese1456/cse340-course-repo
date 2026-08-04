import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { createUser, authenticateUser, getAllUsers } from '../models/users.js';

// How many times bcrypt runs its hashing algorithm. Higher is more secure but
// slower; 10 is the usual balance for a web application.
const SALT_ROUNDS = 10;

const userRegistrationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const userLoginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Middleware that blocks access to a route unless a user is logged in.
 *
 * Hiding a link in the UI is not security: anyone can type the URL directly.
 * This runs on the server before the route handler, so the check cannot be
 * bypassed from the browser.
 */
const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.flash('error', 'You must be logged in to access that page.');
    return res.redirect('/login');
  }

  return next();
};

/**
 * Builds middleware that blocks access unless the logged-in user has a role.
 *
 * This is a middleware *factory* rather than middleware itself. Express calls
 * middleware with (req, res, next) and gives us no way to pass in the required
 * role, so requireRole('admin') is called at route-definition time and returns
 * a middleware function that has the role captured in its closure.
 *
 * @param {string} role - The role name required (for example 'admin').
 * @returns {Function} Express middleware function.
 */
const requireRole = (role) => (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.flash('error', 'You must be logged in to access that page.');
    return res.redirect('/login');
  }

  if (req.session.user.role_name !== role) {
    req.flash('error', 'You do not have permission to access that page.');
    return res.redirect('/dashboard');
  }

  return next();
};

const showUserRegistrationForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

/**
 * Handles a registration submission.
 *
 * The password is hashed before it reaches the database, so the plain text
 * value never leaves this function.
 */
const processUserRegistrationForm = async (req, res) => {
  const results = validationResult(req);

  if (!results.isEmpty()) {
    results.array().forEach((error) => req.flash('error', error.msg));
    return res.redirect('/register');
  }

  const { name, email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    await createUser(name, email, passwordHash);

    req.flash('success', 'Registration successful! Please log in.');
    return res.redirect('/login');
  } catch (error) {
    // 23505 is the Postgres unique_violation code, raised here by the UNIQUE
    // constraint on users.email. Report it as a normal form problem rather than
    // letting it become a 500.
    if (error.code === '23505') {
      req.flash('error', 'An account with that email already exists.');
    } else {
      console.error('Error registering user:', error);
      req.flash('error', 'An error occurred during registration. Please try again.');
    }

    return res.redirect('/register');
  }
};

const showLoginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

/**
 * Handles a login submission.
 *
 * On success the user object is stored on the session, which is how the server
 * remembers who is logged in across later requests.
 */
const processLoginForm = async (req, res) => {
  const results = validationResult(req);

  if (!results.isEmpty()) {
    results.array().forEach((error) => req.flash('error', error.msg));
    return res.redirect('/login');
  }

  const { email, password } = req.body;

  try {
    const user = await authenticateUser(email, password);

    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    req.session.user = user;
    req.flash('success', 'Login successful!');

    if (res.locals.NODE_ENV === 'development') {
      console.log('User logged in:', user);
    }

    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Error during login:', error);
    req.flash('error', 'An error occurred during login. Please try again.');
    return res.redirect('/login');
  }
};

/**
 * Logs the user out by removing them from the session.
 *
 * The flash messages live on the same session, so the user is deleted rather
 * than the whole session being destroyed. Destroying it would throw away the
 * confirmation message before the next page could display it.
 */
const processLogout = (req, res) => {
  if (req.session.user) {
    delete req.session.user;
  }

  req.flash('success', 'Logout successful!');
  res.redirect('/login');
};

const showDashboard = (req, res) => {
  const user = req.session.user;

  res.render('dashboard', {
    title: 'Dashboard',
    name: user.name,
    email: user.email,
  });
};

/**
 * Controller for the admin-only page listing every registered user.
 */
const showUsersPage = async (req, res) => {
  const users = await getAllUsers();

  res.render('users', { title: 'Registered Users', users });
};

export {
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
};
