import dotenv from 'dotenv';
import { CustomEnv } from '../src/models/CustomEnv';

dotenv.config({ path: './config/.env' });
const env = process.env.NODE_ENV || 'dev';


export const validateConfig = (conf: any, parentKey = env): void => {
  try {
    if (conf instanceof Object) {
      for (const key of Object.keys(conf)) {
        if (!conf[key] || ((conf[key] instanceof String) && !conf[key].length)) {
          throw key;
        } else if (conf[key] instanceof Object) {
          validateConfig(conf[key], key);
        }
      }
    }
  } catch(key) {
    throw `${parentKey}.${key}`;
  }
};


// ENVIRONMENTS

const dev: CustomEnv = {
  app: {
    host: '0.0.0.0',
    protocol: 'http',
    port: 3050,
  },
  mailing: {
    host: '0.0.0.0',
    protocol: 'http',
    port: 3333,
    from: 'Gideon Ramcharan <gidramch@gmail.com>',
  },
  redis: {
    host: '127.0.0.1',
    protocol: 'http',
    port: 6379,
  },
  db: {
    host: '127.0.0.1',
    user: 'gideon',
    password: process.env.DB_PASSWORD as string,
    schema: 'API_GATEWAY',
  },
  secrets: {
    JWT: process.env.JWTSecret as string,
    cookie: process.env.cookieSecret as string,
    googleDesktopClientId: process.env.GOOGLE_DESKTOP_CLIENT_ID as string,
    googleDesktopClientSecret: process.env.GOOGLE_DESKTOP_CLIENT_SECRET as string,
  },
  clients: {
    template_app: {
      host: '0.0.0.0',
      port: 3055,
      protocol: 'http',
    },
  },
};

// const sandbox: CustomEnv = {

// };

// const production:CustomEnv = {

// };


// CONFIGURING EXPORT - other files don't have to worry about which env is set

const config: Record<string, CustomEnv> = {
  dev,
  // sandbox,
  // prod,
};

export default config[env];