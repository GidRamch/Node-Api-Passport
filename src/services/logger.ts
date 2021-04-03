import { createLogger, format, transports } from 'winston';
import PrettyError from 'pretty-error';
import { join } from 'path';
const pe = new PrettyError();


const myFormat = format.printf(info => {
  return `${info.timestamp} [${info.service}] ${info.level}: ${info.message} ${(info instanceof Error) ? '\n' + pe.render(info) : ''}`;
});


export const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY/MMM/DD HH:mm:ss:SS' }),
    format.align(),
    format.splat(),
    myFormat,
    format.colorize({ all: true }),
  ),
  defaultMeta: { service: 'NODE-TEMPLATE' },
  transports: [
    new transports.Console(),
    new transports.File(
      {
        dirname: join(__dirname, '../../logs/'),
        filename: 'app.log',
        maxFiles: 4,
        maxsize: 25 * 1000 * 1000,  // 25 MB
        tailable: true,
      }),
  ],
});