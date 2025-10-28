const client = require('../db');

// UC1.1: Sign-Up — create account and return user ID
exports.signUp = async ({ username, password, firstName, lastName, address }) => {
  try {
    const result = await client.query(
      `INSERT INTO users (username, password, first_name, last_name, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username`,
      [username, password, firstName, lastName, address]
    );
    return { status: 201, data: result.rows[0] };
  } catch (err) {
    return { status: 500, data: { error: err.message } };
  }
};

// UC1.2: Sign-In — verify credentials and return user ID
exports.signIn = async ({ username, password }) => {
  try {
    const result = await client.query(
      `SELECT user_id FROM users WHERE username = $1 AND password = $2`,
      [username, password]
    );
    if (result.rows.length === 0) {
      return { status: 401, data: { error: 'Invalid credentials' } };
    }
    return { status: 200, data: result.rows[0] };
  } catch (err) {
    return { status: 500, data: { error: err.message } };
  }
};

// UC1.3: Forgot Password — update password
exports.forgotPassword = async ({ username, newPassword }) => {
  try {
    const result = await client.query(
      `UPDATE users SET password = $1 WHERE username = $2 RETURNING user_id`,
      [newPassword, username]
    );
    if (result.rows.length === 0) {
      return { status: 404, data: { error: 'User not found' } };
    }
    return { status: 200, data: { message: 'Password updated', userId: result.rows[0].user_id } };
  } catch (err) {
    return { status: 500, data: { error: err.message } };
  }
};

// UC10: Session Validation — stub
exports.validateSession = async (token) => {

  return { status: 200, data: { valid: true } };
};
