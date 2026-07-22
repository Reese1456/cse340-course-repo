import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './src/models/db.js';
import router from './src/routes.js';
import { handleErrors } from './src/controllers/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'production';
const port = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

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
