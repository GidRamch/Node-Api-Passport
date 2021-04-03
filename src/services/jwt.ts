import { sign, verify } from 'jsonwebtoken';
import config from '../../config/config';


export const signData = (input: any, expiresIn = '1d'): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    try {
      sign(input, config.secrets.JWT, { expiresIn }, (err: any, data: string | undefined): void => {
        if (err) { reject(err); }
        resolve(data);
      });
    } catch (err) {
      reject(err);
    }
  });
};


export const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      verify(token, config.secrets.JWT, { }, (err: any, data: any): void => {
        if (err) { reject(err); }
        resolve(data);
      });
    } catch (err) {
      reject(err);
    }
  });
};