import config from '../../../config/config';
import { AppError } from '../../models/AppError';
import { compareHash, getHash } from '../../services/hasher';
import { signData, verifyToken } from '../../services/jwt';
import { sendMail } from '../../services/maling';
import { callProcedure } from '../../services/mysql';



const getUserByEmail = async (EMAIL: string, onlyVerified = true): Promise<any> => {
  const mysqlData = await callProcedure(
    'READ$USER_INFO_VIA_EMAIL',
    { EMAIL }
  );

  if (!mysqlData?.PASSWORD) { throw new AppError(`No Password found for given email: ${EMAIL}`, 'Unauthorized', 403); }
  if (!mysqlData?.VERIFIED && onlyVerified) { throw new AppError(`Account not verified: ${EMAIL}`, 'Not Verified!', 403); }

  return mysqlData;
};


export const register = async (EMAIL: string, PASSWORD: string, APP_ID: string): Promise<unknown> => {

  const hashedPassword = await getHash(PASSWORD);

  const mysqlData = await callProcedure(
    'CREATE$USER',
    { EMAIL, PASSWORD: hashedPassword }
  );

  if (!mysqlData?.ID) { throw new Error(`Failed to create user with email: ${EMAIL}`); }

  const token = await signData({ email: EMAIL });

  const client = config.clients[APP_ID];

  sendMail({
    to: [EMAIL],
    subject: 'Account Created!',
    text: `Your account has been created! Please click the following link to verify your account:\n
      ${client.protocol}://${client.host}:${client.port}/verify-user?token=${token}
    `,
  });

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


export const forgotPassword = async (EMAIL: string, APP_ID: string): Promise<unknown> => {
  const userInfo = await getUserByEmail(EMAIL, false);

  const token = await signData({ email: EMAIL }, '15m', userInfo.PASSWORD);

  delete userInfo.PASSWORD;

  const client = config.clients[APP_ID];

  sendMail({
    to: [EMAIL],
    subject: 'Reset Password!',
    text: `You may reset your password by following this link below:\n
      ${client.protocol}://${client.host}:${client.port}/reset-password?token=${token}?email=${EMAIL}
    `,
  });

  return userInfo;
};


export const resetPassword = async (PASSWORD: string, TOKEN: string, EMAIL: string): Promise<unknown> => {
  const userInfo = await getUserByEmail(EMAIL, false);

  const tokenData = await verifyToken(TOKEN, userInfo.PASSWORD)
    .catch((err: Error) => {
      throw new AppError(err.message, 'Bad Request', 400);
    });

  if (tokenData.email !== EMAIL) { throw new AppError('RESET PASSWORD -> Token email and input email did not match', 'Bad Request', 400); }

  const hashedPassword = await getHash(PASSWORD);

  const mysqlData = await callProcedure(
    'UPDATE$USER_PASSWORD_VIA_EMAIL',
    { PASSWORD: hashedPassword, EMAIL: tokenData.email }
  );

  return mysqlData;
};


export const changePassword = async (user: any, OLD_PASSWORD: string, NEW_PASSWORD: string): Promise<unknown> => {
  const userInfo = await getUserByEmail(user.EMAIL);

  const hashedPassword = userInfo.PASSWORD;

  const authenticated = await compareHash(OLD_PASSWORD, hashedPassword);

  if (!authenticated) {
    throw new AppError(`Comparison of entered and stored passwords resulted false for email: ${user.EMAIL}`, 'Unauthorized', 401);
  }

  const hashedNewPassword = await getHash(NEW_PASSWORD);

  const mysqlData = await callProcedure(
    'UPDATE$USER_PASSWORD_VIA_EMAIL',
    { PASSWORD: hashedNewPassword, EMAIL: user.EMAIL }
  );

  return mysqlData;
};
