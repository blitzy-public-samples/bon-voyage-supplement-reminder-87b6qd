// Import the database connection instance
const { sequelize } = require('../connection');

// Import the User model for database operations
const { User, createUser, getUserById, updateUser, deleteUser } = require('../models/user');

// Import Sequelize operators for complex queries
const { Op } = require('sequelize');

// Import validation and sanitization functions
const { validatePhoneNumber, validateTimezone, sanitizeUserInput, ValidationError } = require('../utils/validation');

/**
 * Retrieves a user by their phone number
 * @param {string} phoneNumber - The phone number of the user to retrieve
 * @returns {Promise<User|null>} User object if found, null otherwise
 * @throws {ValidationError} If the phone number is invalid
 */
async function getUserByPhoneNumber(phoneNumber) {
  try {
    validatePhoneNumber(phoneNumber);
  } catch (error) {
    throw new ValidationError(error.message);
  }

  const sanitizedPhoneNumber = sanitizeUserInput(phoneNumber);

  const user = await User.findOne({
    where: { phoneNumber: sanitizedPhoneNumber },
  });

  return user;
}

/**
 * Retrieves a list of users with pagination
 * @param {number} page - The page number to retrieve
 * @param {number} pageSize - The number of users per page
 * @returns {Promise<object>} Object containing users array and pagination info
 */
async function listUsers(page, pageSize) {
  const offset = (page - 1) * pageSize;

  const { count, rows } = await User.findAndCountAll({
    limit: pageSize,
    offset: offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    users: rows,
    totalCount: count,
    totalPages: Math.ceil(count / pageSize),
    currentPage: page,
    pageSize: pageSize,
  };
}

/**
 * Searches for users based on a search term
 * @param {string} searchTerm - The term to search for in phone numbers
 * @param {number} page - The page number to retrieve
 * @param {number} pageSize - The number of users per page
 * @returns {Promise<object>} Object containing matching users array and pagination info
 */
async function searchUsers(searchTerm, page, pageSize) {
  const sanitizedSearchTerm = sanitizeUserInput(searchTerm);
  const offset = (page - 1) * pageSize;

  const whereClause = {
    phoneNumber: {
      [Op.like]: `%${sanitizedSearchTerm}%`,
    },
  };

  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
    limit: pageSize,
    offset: offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    users: rows,
    totalCount: count,
    totalPages: Math.ceil(count / pageSize),
    currentPage: page,
    pageSize: pageSize,
  };
}

module.exports = {
  createUser,
  getUserById,
  getUserByPhoneNumber,
  updateUser,
  deleteUser,
  listUsers,
  searchUsers,
};

// Requirements addressed:
// - Data Storage and Management (2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management)
//   This module provides functions for CRUD operations on user data, supporting efficient management of user information.
// - Security (8. SECURITY CONSIDERATIONS)
//   Input validation and sanitization are performed to prevent injection attacks and ensure data integrity.
// - Scalability (2. TECHNICAL REQUIREMENTS/2.7 Scalability)
//   Pagination is implemented in listUsers and searchUsers functions to support efficient querying of large datasets.