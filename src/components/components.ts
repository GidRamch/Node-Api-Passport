import authController from './auth/authController';
import googleAuthController from './google-auth/googleAuthController';
/**
 * Array of all components, to ensure app.ts remains clean
 */
export const components = [
  authController,
  googleAuthController,
];