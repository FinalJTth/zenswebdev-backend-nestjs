import { createError } from 'apollo-errors';

const AuthorizationError = createError('AuthorizationError', {
  message: 'You are not authorized.',
});

export { AuthorizationError };
