import express, { NextFunction, Request, Response } from 'express';
import { authenticate } from 'passport';
import { isAuthenticated } from '../../middleware/auth';
import { validate } from '../../middleware/validator';
import { AppError } from '../../models/AppError';
import { logger } from '../../services/logger';
import { changePassword, forgotPassword, register, resetPassword, verifyUser } from './authDAL';
import { getAuthValidationRules } from './authValidator';

const router = express.Router();

const baseRoute = '/auth';


/**
 * Login using passport local strategy
 */
router.post(
  `${baseRoute}/login`,
  getAuthValidationRules('login'),
  validate,
  authenticate('local', {
    successRedirect: `${baseRoute}/success`,
    failureRedirect: `${baseRoute}/failed`,
  }),
);


/**
 * Route used if login failed. Sends 200 to user.
 */
router.get(
  `${baseRoute}/success`,
  isAuthenticated,
  (req: Request, res: Response) => {
    logger.info(`GET ${baseRoute}/success`);

    delete (req.user as any).PASSWORD;

    res.send(req.user);
  },
);


/**
 * Route used if login failed. Sends 401 to user.
 */
router.get(
  `${baseRoute}/failed`,
  (req: Request, res: Response) => {
    logger.info(`GET ${baseRoute}/failed`);
    throw new AppError('User failed to login with local strategy!', 'Login Failed!', 401);
  },
);


/**
 * Use passport to log user out and destroy session
 */
router.post(
  `${baseRoute}/logout`,
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.logout();
      await new Promise((resolve, reject) => {
        req.session.destroy(err => { if (err) { reject(); } else { resolve(true); } });
      });
      res.send();
    } catch (err) { next(err); }
  },
);


/**
 * Create user and sends verification token to email.
 */
router.post(
  `${baseRoute}/register`,
  getAuthValidationRules('register'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {

    logger.info(`POST /${baseRoute}/register`);

    try {
      const EMAIL = req.body.email;
      const PASSWORD = req.body.password;
      const APP_ID = req.body.appId;

      const data = await register(EMAIL, PASSWORD, APP_ID);

      res.status(200).send(data);

    } catch (err) {
      next(err);
    }
  }
);


/**
 * Accepts token contained in register email and uses it to mark
 * correspondinguser as verified.
 */
router.put(
  `${baseRoute}/verify-user/:token`,
  getAuthValidationRules('verify-user'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {

    logger.info(`PUT /${baseRoute}/verify-user`);

    try {
      const TOKEN = req.params.token;

      const data = await verifyUser(TOKEN);

      res.status(200).send(data);

    } catch (err) {
      next(err);
    }
  }
);


/**
 * Send email link containing token to use to reset password.
 */
router.post(
  `${baseRoute}/forgot-password`,
  getAuthValidationRules('forgot-password'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {

    logger.info(`POST /${baseRoute}/forgot-password`);

    try {
      const EMAIL = req.body.email;
      const APP_ID = req.body.appId;

      const data = await forgotPassword(EMAIL, APP_ID);

      res.status(200).send(data);

    } catch (err) {
      next(err);
    }
  }
);


/**
 * Accept token from forget-password email link and use it along with
 * passed in email and password to change user's password
 */
router.put(
  `${baseRoute}/reset-password/:token`,
  getAuthValidationRules('reset-password'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {

    logger.info(`PUT /${baseRoute}/reset-password`);

    try {
      const PASSWORD = req.body.password;
      const EMAIL = req.body.email;
      const TOKEN = req.params.token;

      const data = await resetPassword(PASSWORD, TOKEN, EMAIL);

      res.status(200).send(data);

    } catch (err) {
      next(err);
    }
  }
);


/**
 * Allows logged-in user to change their password
 */
router.post(
  `${baseRoute}/change-password`,
  isAuthenticated,
  getAuthValidationRules('change-password'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {

    logger.info(`PUT /${baseRoute}/reset-password`);

    try {
      const PASSWORD = req.body.password;
      const NEW_PASSWORD = req.body.new_password;

      console.log(req.user);

      const data = await changePassword(req.user, PASSWORD, NEW_PASSWORD);

      res.status(200).send(data);

    } catch (err) {
      next(err);
    }
  }
);

export default router;