import http from 'http';

import app from '../app';
import config from '../../config/config';
import { logger } from '../services/logger';

const port = config.app.port;
const host = config.app.host;

app.set('port', port);
app.set('host', host);


// Create Server

const server = http.createServer(app);

server.listen(port, host, () => logger.info(`Server listening on ${host}${port ? `:${port}` : ''}`));