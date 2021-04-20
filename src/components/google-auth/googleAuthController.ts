import express, { NextFunction, Request, Response } from 'express';
import { authenticate } from 'passport';
import { isAuthenticated } from '../../middleware/auth';
import { AppError } from '../../models/AppError';
import { logger } from '../../services/logger';

const router = express.Router();

const baseRoute = '/auth/google';


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


router.get(
  `${baseRoute}/redirect`,
  authenticate('google', { failureRedirect: `${baseRoute}/failed` }),
  async (req: Request, res: Response) => {
    logger.info(`GET /${baseRoute}/redirect`);

    const state = JSON.parse(req.query.state as string);

    if (state.redirect) {
      res.redirect(state.redirect);
    } else {
      res.send(req.user);
    }
  },
);


router.get(
  `${baseRoute}/failed`,
  (req: Request, res: Response, next: NextFunction) => {
    logger.info(`GET /${baseRoute}/failed`);
    throw new AppError('User failed to login with google!', 'Login Failed!', 401);
  },
);


router.get(
  `${baseRoute}/test-auth`,
  isAuthenticated,
  (req: Request, res: Response) => {
    res.send();
  },
);


router.get(
  `${baseRoute}/logout`,
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
);


export default router;