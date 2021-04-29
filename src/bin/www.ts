import http from 'http';

import PrettyError from 'pretty-error';
const pe = new PrettyError();

import config, { validateConfig } from '../../config/config';


// Create Server

const startServer = async () => {
  try {

    validateConfig(config);

    const app = (await (import('../app'))).default;   // Dynamic imports ensures config is not used before validation
    const logger = (await import('../services/logger')).logger;

    const port = config.app.port;
    const host = config.app.host;

    app.set('port', port);
    app.set('host', host);

    const server = http.createServer(app);

    server.listen(port, host, () => logger.info(`Server listening on ${host}${port ? `:${port}` : ''}`));
  } catch (err) {
    if ((typeof err) === 'string') {
      const info = `
        No value provided for parameter: ${err} in ./config/config.ts file. Parameter must have a value.
  
        If parameter in config is pointing to .env file (e.g. parameter: process.env.KEY_EXAMPLE), ensure that .env file has a value for KEY_EXAMPLE
  
        You may copy and rename the .env.template to .env in the ./config directory and add appropriate values.`;
  
      console.error(pe.render(info));
      return;
    }
    console.error(pe.render(err));
  }
};

startServer();