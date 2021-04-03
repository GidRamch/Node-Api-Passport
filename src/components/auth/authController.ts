import express, { NextFunction, Request, Response } from 'express';
import { validate } from '../../middleware/validator';
import { logger } from '../../services/logger';
import { login } from './authDAL';
import { getAuthValidationRules } from './authValidator';

const router = express.Router();

const baseRoute = '/auth';


router.post(
  `${baseRoute}/login`,
  getAuthValidationRules('login'),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {

    logger.info(`POST /${baseRoute}/create`);

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


export default router;