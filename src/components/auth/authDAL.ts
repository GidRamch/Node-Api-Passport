import { AppError } from '../../models/AppError';
import { compareHash, getHash } from '../../services/hasher';
import { signData, verifyToken } from '../../services/jwt';
import { callProcedure } from '../../services/mysql';


export const login = async (EMAIL: string, PASSWORD: string): Promise<unknown> => {
  const userInfo = await getUserInfo(EMAIL);

  const hashedPassword = userInfo.PASSWORD;

  const authenticated = await compareHash(PASSWORD, hashedPassword);

  delete userInfo.PASSWORD;

  if (!authenticated) {
    throw new AppError(`Comparison of entered and stored passwords resulted false for email: ${EMAIL}`, 'Unauthorized', 401);
  }

  return userInfo;
};


const getUserInfo = async (EMAIL: string): Promise<any> => {
  const mysqlData = await callProcedure(
    'READ$USER_INFO_VIA_EMAIL',
    { EMAIL }
  );

  if (!mysqlData?.PASSWORD) { throw new AppError(`No Password found for given email: ${EMAIL}`, 'Unauthorized', 403); }
  if (!mysqlData?.VERIFIED) { throw new AppError(`Account not verified: ${EMAIL}`, 'Not Verified!', 403); }

  return mysqlData;
};


export const register = async (EMAIL: string, PASSWORD: string): Promise<unknown> => {

  const hashedPassword = await getHash(PASSWORD);

  const mysqlData = await callProcedure(
    'CREATE$USER',
    { EMAIL, PASSWORD: hashedPassword }
  );

  if (!mysqlData?.ID) { throw new Error(`Failed to create user with email: ${EMAIL}`); }


  // CREATE VERIFICATION TOKEN
  const token = await signData({ email: EMAIL });

  // SEND EMAIL

  return mysqlData;
};


export const verifyUser = async (TOKEN: string): Promise<unknown> => {

  const tokenData = await verifyToken(TOKEN)
    .catch((err: Error) => {
      throw new AppError(err.message, 'Bad Request', 400);
    });

  const mysqlData = await callProcedure(
    'UPDATE$USER_VERIFIED_VIA_EMAIL',
    { EMAIL: tokenData.email, VERIFIED: 1 }
  );

  return mysqlData;
};


export const forgotPassword = async (EMAIL: string): Promise<unknown> => {
  const userInfo = await getUserInfo(EMAIL);

  const token = await signData({ email: EMAIL }, '15m');

  delete userInfo.PASSWORD;

  // SEND EMAIL

  return userInfo;
};


export const resetPassword = async (PASSWORD: string, TOKEN: string): Promise<unknown> => {
  const tokenData = await verifyToken(TOKEN)
    .catch((err: Error) => {
      throw new AppError(err.message, 'Bad Request', 400);
    });

  const hashedPassword = await getHash(PASSWORD);

  const mysqlData = await callProcedure(
    'UPDATE$USER_PASSWORD_VIA_EMAIL',
    { PASSWORD: hashedPassword, EMAIL: tokenData.email}
  );

  return mysqlData;
};