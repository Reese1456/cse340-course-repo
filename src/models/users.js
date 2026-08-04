import bcrypt from 'bcrypt';
import db from './db.js';

/**
 * Creates a new user and returns its generated id.
 *
 * Every self-registered account gets the 'user' role. The role is looked up by
 * name in a subquery rather than being hardcoded to an id, because the SERIAL
 * values depend on insert order and could differ between databases.
 */
const createUser = async (name, email, passwordHash) => {
  const defaultRole = 'user';
  const query = `
    INSERT INTO users (name, email, password_hash, role_id)
    VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4))
    RETURNING user_id;
  `;

  const result = await db.query(query, [name, email, passwordHash, defaultRole]);

  if (result.rows.length === 0) {
    throw new Error('Failed to create user');
  }

  return result.rows[0].user_id;
};

/**
 * Looks up a single user by email address.
 *
 * The roles table is joined so the caller gets the role_name directly. Storing
 * the name (rather than the id) on the session lets the authorization
 * middleware compare against a readable value like 'admin'.
 *
 * Returns null if no user has that email.
 */
const findUserByEmail = async (email) => {
  const query = `
    SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.email = $1;
  `;

  const result = await db.query(query, [email]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

/**
 * Checks a plain text password against a stored bcrypt hash.
 *
 * The hash cannot be reversed, so bcrypt re-hashes the submitted password using
 * the salt embedded in the stored hash and compares the results.
 */
const verifyPassword = async (password, passwordHash) => bcrypt.compare(password, passwordHash);

/**
 * Verifies a user's credentials.
 *
 * Returns the user (without the password hash) when the email exists and the
 * password matches, otherwise null. The same null is returned for an unknown
 * email and a wrong password so the response does not reveal which accounts
 * exist.
 */
const authenticateUser = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  // The hash is never needed past this point, and this object goes on the
  // session, so drop it before returning.
  delete user.password_hash;

  return user;
};

/**
 * Retrieves every registered user along with their role name.
 */
const getAllUsers = async () => {
  const query = `
    SELECT u.user_id, u.name, u.email, r.role_name
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    ORDER BY u.name;
  `;

  const result = await db.query(query);

  return result.rows;
};

export { createUser, authenticateUser, getAllUsers };
