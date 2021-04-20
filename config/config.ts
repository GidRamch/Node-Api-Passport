import dotenv from 'dotenv';

dotenv.config();

// INTERFACES TO STRONGLY TYPE


interface URL {
  host: string;
  protocol: string;
  port: number;
}

interface MailingUrl extends URL {
  from: string;
}

interface CustomEnv {
  app: URL,
  mailing: MailingUrl,
  db: {
    host: string;
    user: string;
    password: string;
    schema: string;
  },
  secrets: {
    JWT: string;
    cookie: string;
    googleDesktopClientId: string;
    googleDesktopClientSecret: string;
  },
  clients: {
    [id: string]: URL,
  };
}


// ENVIRONMENTS

const dev: CustomEnv = {
  app: {
    host: '0.0.0.0',
    protocol: 'http',
    port:3050,
  },
  mailing: {
    host: '0.0.0.0',
    protocol: 'http',
    port: 3333,
    from: 'Gideon Ramcharan <gidramch@gmail.com>',
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

const env = process.env.NODE_ENV || 'dev';

const config: Record<string, CustomEnv> = {
  dev,
  // sandbox,
  // prod,
};

export default config[env];