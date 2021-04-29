interface URL {
  host: string;
  protocol: string;
  port: number;
}

interface MailingUrl extends URL {
  from: string;
}

export interface CustomEnv {
  app: URL,
  mailing: MailingUrl,
  db: {
    host: string;
    user: string;
    password: string;
    schema: string;
  },
  redis: URL,
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