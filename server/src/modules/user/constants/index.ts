// User module constants

export const SALT_ROUNDS = 10;

// Controller route paths
export const USER_CONTROLLER_PATH = 'users';
export const USER_SEARCH_PATH = 'search';
export const USER_LOGIN_PATH = 'login';

// Error messages
export const USER_INVALID_CREDENTIALS_MESSAGE = 'Invalid username or password';
export const USER_FIELD_EXISTS_MESSAGE = (field: string) =>
  `${field} already exists`;
export const USER_NOT_FOUND_MESSAGE = (id: string) =>
  `User with ID ${id} not found`;
export const USER_NOT_FOUND_TO_DELETE_MESSAGE = (id: string) =>
  `User with ID ${id} not found to delete`;
