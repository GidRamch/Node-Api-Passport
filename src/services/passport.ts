import passport from 'passport';
import { Profile, Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20';
import config from '../../config/config';
import { logger } from './logger';
import { callProcedure } from './mysql';


export const passportInitialize = (): void => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.secrets.googleDesktopClientId,
        clientSecret: config.secrets.googleDesktopClientSecret,
        callbackURL: 'http://fakedomaingideon.com/auth/google/redirect',
      },
      async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        const res = await callProcedure('CREATE$GOOGLE_USER', {
          EMAIL: profile._json.email,
          GOOGLE_ID: profile.id,
        });

        done(null, res);
      },
    ),
  );

  passport.serializeUser(async (user: any, done: VerifyCallback) => {
    logger.info(`GOOGLE AUTH serialize -> user: ${JSON.stringify(user)}`);
    done(null, user.ID);
  });


  passport.deserializeUser(async (ID: number, done: VerifyCallback) => {

    logger.info('GOOGLE AUTH deserialize');
    const user = await callProcedure('READ$USER_INFO_VIA_ID', {
      ID,
    });
    logger.info(`GOOGLE AUTH deserialize -> user info: ${JSON.stringify(user)}`);
    done(null, ID);
  });
};
