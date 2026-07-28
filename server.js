import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './src/models/db.js';
import router from './src/routes.js';
import { handleErrors } from './src/controllers/errors.js';
import flash from './src/middleware/flash.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'production';
const port = process.env.PORT || 3000;
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET environment variable is required');
}

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Allow Express to receive form submissions and JSON request bodies.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Store short-lived, user-specific data such as flash messages.
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
  },
}));

app.use(flash);
app.use(express.static(path.join(__dirname, 'public')));

// Log every request during development
app.use((req, res, next) => {
  if (nodeEnv === 'development') {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

// Make NODE_ENV available to all views
app.use((req, res, next) => {
  res.locals.NODE_ENV = nodeEnv;
  next();
});

// All application routes
app.use(router);

// Global error handler (must come after the routes)
app.use(handleErrors);

app.listen(port, async () => {
  try {
    await testConnection();
    console.log(`Server is running at http://127.0.0.1:${port}`);
    console.log(`Environment: ${nodeEnv}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});
