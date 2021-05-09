import passport from 'passport';

import { Profile, Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as LocalStategy } from 'passport-local';

import config from '../config/config';
import { FORBIDDEN, UNAUTHORIZED } from './enums/HTTP_STATUS';
import { AppError } from './models/AppError';
import { compareHash } from './services/hasher';
import { logger } from './services/logger';
import { callProcedure } from './services/mysql';


export const passportInitialize = (): void => {

  passport.use(
    new LocalStategy(
      {
        usernameField: 'email',
      },
      async (email, password, done) => {
        try {
          const userInfo = await getUserByEmail(email);

          const hashedPassword = userInfo.PASSWORD;

          const authenticated = await compareHash(password, hashedPassword);

          if (!authenticated) {
            throw new AppError(
              `Comparison of entered and stored passwords resulted false for email: ${email}`,
              UNAUTHORIZED.MESSAGE,
              UNAUTHORIZED.CODE,
            );
          }

          done(null, userInfo);
        } catch (e) { done(e); }  // same as next(e) in regular middleware
      }
    ),
  );


  passport.use(
    new GoogleStrategy(
      {
        clientID: config.secrets.googleDesktopClientId,
        clientSecret: config.secrets.googleDesktopClientSecret,
        callbackURL: 'http://fakedomaingideon.com/auth/google/redirect',
      },
      async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
          const res = await callProcedure('CREATE$GOOGLE_USER', {
            EMAIL: profile._json.email,
            GOOGLE_ID: profile.id,
          });
          done(null, res);
        } catch (e) { done(e); }  // same as next(e) in regular middleware
      },
    ),
  );


  passport.serializeUser((user: any, done: VerifyCallback) => {
    logger.info(`AUTH serialize -> user: ${JSON.stringify(user)}`);
    done(null, user.ID);
  });


  passport.deserializeUser(async (ID: number, done: VerifyCallback) => {
    logger.info('AUTH deserialize');
    const user = await callProcedure('READ$USER_INFO_VIA_ID', { ID });
    logger.info(`AUTH deserialize -> user info: ${JSON.stringify(user)}`);
    done(null, user);
  });
};


const getUserByEmail = async (EMAIL: string): Promise<any> => {
  const mysqlData = await callProcedure(
    'READ$USER_INFO_VIA_EMAIL',
    { EMAIL }
  );

  if (!mysqlData) {
    throw new AppError(
      `No user found with given email: ${EMAIL}`,
      UNAUTHORIZED.MESSAGE,
      UNAUTHORIZED.CODE,
    );
  }
  if (!mysqlData.PASSWORD) {
    throw new AppError(
      `No Password found for user with given email: ${EMAIL}`,
      UNAUTHORIZED.MESSAGE,
      UNAUTHORIZED.CODE,
    );
  }
  if (!mysqlData.VERIFIED) {
    throw new AppError(
      `Account not verified: ${EMAIL}`,
      FORBIDDEN.MESSAGE,
      FORBIDDEN.CODE,
    );
  }

  return mysqlData;
};