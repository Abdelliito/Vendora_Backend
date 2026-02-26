import jwt from 'jsonwebtoken';

/**
 * generateToken — signs a JWT for the given user id and role
 * @param {string} id   - MongoDB user _id
 * @param {string} role - 'Admin' | 'Vendor' | 'Customer'
 * @returns {string} signed JWT
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

export default generateToken;
