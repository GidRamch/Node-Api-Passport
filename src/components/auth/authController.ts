import express, { NextFunction, Request, Response } from 'express';
import { validate } from '../../middleware/validator';
import { logger } from '../../services/logger';
import { forgotPassword, login, register, resetPassword, verifyUser } from './authDAL';
import { getAuthValidationRules } from './authValidator';

const router = express.Router();

const baseRoute = '/auth';


router.post(
  `${baseRoute}/login`,
  getAuthValidationRules('login'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {

    logger.info(`POST /${baseRoute}/login`);

    try {
      const EMAIL = req.body.email;
      const PASSWORD = req.body.password;

      const data = await login(EMAIL, PASSWORD);

      res.status(200).send(data);

    } catch (err) {
      next(err);
    }
  }
);


router.post(
  `${baseRoute}/register`,
  getAuthValidationRules('register'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {

    logger.info(`POST /${baseRoute}/register`);

    try {
      const EMAIL = req.body.email;
      const PASSWORD = req.body.password;

      const data = await register(EMAIL, PASSWORD);

      res.status(200).send(data);

    } catch (err) {
      next(err);
    }
  }
);


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


router.post(
  `${baseRoute}/forgot-password`,
  getAuthValidationRules('forgot-password'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {

    logger.info(`POST /${baseRoute}/forgot-password`);

    try {
      const EMAIL = req.body.email;

      const data = await forgotPassword(EMAIL);

      res.status(200).send(data);

    } catch (err) {
      next(err);
    }
  }
);



router.put(
  `${baseRoute}/reset-password/:token`,
  getAuthValidationRules('reset-password'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {

    logger.info(`PUT /${baseRoute}/reset-password`);

    try {
      const PASSWORD = req.body.password;
      const TOKEN = req.params.token;

      const data = await resetPassword(PASSWORD, TOKEN);

      res.status(200).send(data);

    } catch (err) {
      next(err);
    }
  }
);

export default router;