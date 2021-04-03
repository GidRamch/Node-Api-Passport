import { AppError } from '../../models/AppError';
import { compareHash } from '../../services/hasher';
import { callProcedure } from '../../services/mysql';


export const login = async (EMAIL: string, PASSWORD: string): Promise<unknown> => {
  const mysqlData = await callProcedure(
    'READ$USER_PASSWORD_VIA_EMAIL',
    { EMAIL }
  );

  if (!mysqlData?.PASSWORD) { throw new AppError(`No Password found for given email: ${EMAIL}`, 'Unauthorized', 403); }

  const hashedPassword = mysqlData.PASSWORD;

  const authenticated = await compareHash(PASSWORD, hashedPassword);

  delete mysqlData.PASSWORD;

  if (!authenticated) {
    throw new AppError(`Comparison of entered and stored passwords resulted false for email: ${EMAIL}`, 'Unauthorized', 401);
  }

  return mysqlData;
};