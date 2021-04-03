import dotenv from 'dotenv';

dotenv.config();

// INTERFACE TO STRONGLY TYPE

interface CustomEnv {
  app: {
    host: string;
    protocol: string;
    port: number;
  },
  db: {
    host: string;
    user: string;
    password: string;
    schema: string;
  },
  secrets: {
    JWT: string;
  }
}


// ENVIRONMENTS

const dev: CustomEnv = {
  app: {
    host: '0.0.0.0',
    protocol: 'http',
    port:3050,
  },
  db: {
    host: '127.0.0.1',
    user: 'gideon',
    password: process.env.DB_PASSWORD as string,
    schema: 'API_GATEWAY',
  },
  secrets: {
    JWT: process.env.JWTSecret as string,
  }
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