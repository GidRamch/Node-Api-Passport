import passport from 'passport';
import { Strategy as GoogleStrategy }  from 'passport-google-oauth20';
import config from '../../config/config';


export const passportInitialize = (): void => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.secrets.googleDesktopClientId,
        clientSecret: config.secrets.googleDesktopClientSecret,
        callbackURL: '/auth/google/redirect',
      },
      accessToken => {
        console.log('access token: ', accessToken);
      },
    ),
  );
};
