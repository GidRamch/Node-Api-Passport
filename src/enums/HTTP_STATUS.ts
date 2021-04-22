export const HTTP_STATUS = {
  OK: {
    CODE: 200,
    MESSAGE: { message: 'OK' },
  },
  CREATED: {
    CODE: 201,
    MESSAGE: { message: 'Created' },
  },
  BAD_REQUEST: {
    CODE: 400,
    MESSAGE: { message: 'Bad Request' },
  },
  UNAUTHORIZED: {
    CODE: 401,
    MESSAGE: { message: 'Unauthorized' },
  },
  FORBIDDEN: {
    CODE: 403,
    MESSAGE: { message: 'Forbidden' },
  },
  NOT_FOUND: {
    CODE: 404,
    MESSAGE: { message: 'Not Found' },
  },
  CONFLICT: {
    CODE: 409,
    MESSAGE: { message: 'Conflict' },
  },
  INTERNAL_SERVER_ERROR: {
    CODE: 500,
    MESSAGE: { message: 'Internal Server Error' },
  },
};
