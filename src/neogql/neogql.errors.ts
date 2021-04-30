import { createError } from 'apollo-errors';

const AuthorizationError = createError('AuthorizationError', {
  message: 'You are not authorized.',
});

const LoginError = createError('LoginError', {
  message: "Something went wrong when you're trying to log in",
});

export { AuthorizationError, LoginError };
