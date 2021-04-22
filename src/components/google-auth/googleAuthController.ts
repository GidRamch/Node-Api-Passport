import express, { NextFunction, Request, Response } from 'express';
import { authenticate } from 'passport';
import { HTTP_STATUS } from '../../enums/HTTP_STATUS';
import { isAuthenticated } from '../../middleware/auth';
import { AppError } from '../../models/AppError';
import { logger } from '../../services/logger';

const router = express.Router();

const baseRoute = '/auth/google';


/**
 * Login user using passport google strategy
 */
router.get(
  `${baseRoute}/login`,
  (req: Request, res: Response, next: NextFunction) => {

    logger.info(`GET /${baseRoute}/login`);

    const state = {
      redirect: req.query.redirect
    };

    authenticate('google', {
      scope: ['profile', 'email'],
      state: JSON.stringify(state),
    })(req, res, next);
  },
);


/**
 * Google login redirects here to handle login request
 */
router.get(
  `${baseRoute}/redirect`,
  authenticate('google', { failureRedirect: `${baseRoute}/failed` }),
  (req: Request, res: Response) => {
    logger.info(`GET /${baseRoute}/redirect`);

    const state = JSON.parse(req.query.state as string);

    if (state.redirect) {
      res.redirect(state.redirect);
    } else {
      res.send(req.user);
    }
  },
);


/**
 * If google errors out, this route is used to send the user an appropriate message
 */
router.get(
  `${baseRoute}/failed`,
  (req: Request, res: Response, next: NextFunction) => {
    logger.info(`GET /${baseRoute}/failed`);
    throw new AppError('User failed to login with google!', HTTP_STATUS.UNAUTHORIZED.MESSAGE, HTTP_STATUS.UNAUTHORIZED.CODE);
  },
);


/**
 * Used to logout user using passport and destroy corresponding session.
 */
router.get(
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


export default router;