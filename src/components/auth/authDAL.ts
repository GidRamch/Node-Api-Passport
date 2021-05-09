import config from '../../../config/config';
import { BAD_REQUEST, CONFLICT, FORBIDDEN, UNAUTHORIZED } from '../../enums/HTTP_STATUS';
import { AppError } from '../../models/AppError';
import { compareHash, getHash } from '../../services/hasher';
import { signData, verifyToken } from '../../services/jwt';
import { sendMail } from '../../services/maling';
import { callProcedure } from '../../services/mysql';


const getUserByEmail = async (EMAIL: string): Promise<any> => {

  const mysqlData = await callProcedure('READ$USER_INFO_VIA_EMAIL', { EMAIL });

  if (!mysqlData) {
    throw new AppError(`No user found with given email: ${EMAIL}`, UNAUTHORIZED.MESSAGE, UNAUTHORIZED.CODE);
  }
  if (!mysqlData.PASSWORD) {
    throw new AppError(`No Password found for user with given email: ${EMAIL}`, UNAUTHORIZED.MESSAGE, UNAUTHORIZED.CODE);
  }
  if (!mysqlData.VERIFIED) {
    throw new AppError(`Account not verified: ${EMAIL}`, FORBIDDEN.MESSAGE, FORBIDDEN.CODE);
  }

  return mysqlData;
};


export const register = async (EMAIL: string, PASSWORD: string, APP_ID: string): Promise<unknown> => {

  const hashedPassword = await getHash(PASSWORD);

  const user = await callProcedure('READ$USER_INFO_VIA_EMAIL', { EMAIL });

  if (user) {
    throw new AppError(`User with given email (${EMAIL}) already exists`, CONFLICT.MESSAGE, CONFLICT.CODE);
  }

  const mysqlData = await callProcedure('CREATE$USER', { EMAIL, PASSWORD: hashedPassword });

  if (!mysqlData?.ID) { throw new AppError(`Failed to create user with email: ${EMAIL}`, CONFLICT.MESSAGE, CONFLICT.CODE); }

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
      throw new AppError(err.message, BAD_REQUEST.MESSAGE, BAD_REQUEST.CODE);
    });

  const mysqlData = await callProcedure(
    'UPDATE$USER_VERIFIED_VIA_EMAIL',
    { EMAIL: tokenData.email, VERIFIED: 1 }
  );

  return mysqlData;
};


export const forgotPassword = async (EMAIL: string, APP_ID: string): Promise<unknown> => {
  const userInfo = await getUserByEmail(EMAIL);

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
  const userInfo = await getUserByEmail(EMAIL);

  const tokenData = await verifyToken(TOKEN, userInfo.PASSWORD)
    .catch((err: Error) => {
      throw new AppError(err.message, BAD_REQUEST.MESSAGE, BAD_REQUEST.CODE);
    });

  if (tokenData.email !== EMAIL) {
    throw new AppError(
      'RESET PASSWORD -> Token email and input email did not match',
      BAD_REQUEST.MESSAGE,
      BAD_REQUEST.CODE,
    );
  }

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
    throw new AppError(
      `Comparison of entered and stored passwords resulted false for email: ${user.EMAIL}`,
      UNAUTHORIZED.MESSAGE,
      UNAUTHORIZED.CODE,
    );
  }

  const hashedNewPassword = await getHash(NEW_PASSWORD);

  const mysqlData = await callProcedure(
    'UPDATE$USER_PASSWORD_VIA_EMAIL',
    { PASSWORD: hashedNewPassword, EMAIL: user.EMAIL }
  );

  return mysqlData;
};
