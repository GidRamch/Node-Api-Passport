import axios from 'axios';
import config from '../../config/config';
import { logger } from './logger';


interface MailingOptions {
  to: string[],
  subject: string,
  text: string,
  from?: string,
  cc?: string[],
  bcc?: string[],
  html?: string,
  attachments?: unknown,
}


export const sendMail = async (data: MailingOptions): Promise<void> => {
  logger.info('SEND MAIL');

  try {

    if (!data.from) { data.from = config.mailing.from; }

    const resp = await axios({
      method: 'POST',
      url: `${config.mailing.protocol}://${config.mailing.host}:${config.mailing.port}/sendMail`,
      data,
    });

    logger.info(`SEND MAIL RESPONSE: ${resp.status} - ${resp.data}`);

  } catch (err) {
    logger.error(err);
  }
};