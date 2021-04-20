import express, { NextFunction, Request, Response } from 'express';
import { authenticate } from 'passport';
import { isAuthenticated } from '../../middleware/auth';
import { validate } from '../../middleware/validator';
import { AppError } from '../../models/AppError';
import { logger } from '../../services/logger';

const router = express.Router();

const baseRoute = '/auth/google';


router.get(
  `${baseRoute}/login`,
  (req, res, next) => {

    const state = {
      redirect: req.query.redirect
    };

    authenticate('google', {
      scope: ['profile', 'email'],
      state: JSON.stringify(state),
    })(req, res, next);
  },
);


router.get(`${baseRoute}/redirect`, authenticate('google', { failureRedirect: `${baseRoute}/failed` }), async (req, res) => {
  logger.info(`[SESSION_ID: ${req.sessionID}] `);

  const state = JSON.parse(req.query.state as string);

  if (state.redirect) {
    res.redirect(state.redirect);
  } else {
    res.send(req.user);
  }
  delete (req.session as any).redirect;
});


router.get(
  `${baseRoute}/failed`,
  (req: Request, res: Response, next: NextFunction) => {

    logger.info(`GET /${baseRoute}/failed`);

    throw new AppError('User failed to login with google!', 'Login Failed!', 401);
  },
);


router.get(`${baseRoute}/test-auth`, isAuthenticated, async (req, res) => {
  logger.info(`[SESSION_ID: ${req.sessionID}] `);
  logger.info('**************************');
  res.send();
});


router.get(`${baseRoute}/logout`, isAuthenticated, async (req, res, next) => {
  try {
    req.logOut();
    await new Promise((resolve, reject) => {
      req.session.destroy((err: Error) => {
        if (err) { reject(err); }
        resolve(null);
      });
    });
    res.send();
  } catch (err) { next(err); }
});


export default router;