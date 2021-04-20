import mysql, { Pool } from 'mysql';
import config from '../../config/config';
import { logger } from './logger';


let connectionPool: Pool;     // Not meant to be referenced directly -> use getConnectionPool();


export const getConnectionPool = (): Pool => {
  if (connectionPool) { return connectionPool; }

  connectionPool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    connectionLimit: 50,
    database: config.db.schema,
    multipleStatements: true,
  });

  return connectionPool;
};


const executeQuery = (sql: string, values: unknown = undefined): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const pool = getConnectionPool();

      pool.query(
        {
          sql,
          values: JSON.stringify(values)
        },
        (err, results) => {
          if (err) { reject(err); }
          resolve(results);
        }
      );

    } catch (err) {
      reject(err);
    }
  });
};


/**
 * 
 * @param procedureName name of procedure to invoke (only pass hardcoded strings to this, never user input)
 * @param value value to pass to procedure as input
 * @returns promise of output data from procedure
 */
export const callProcedure = async (procedureName: string, value: unknown): Promise<any> => {
  logger.debug(`Procedure: ${procedureName} | Input: %o`, value);

  const res = await executeQuery(`CALL ${procedureName}(?, @OUTPUT); SELECT @OUTPUT;`, value);
  const stringRes = res[1][0]['@OUTPUT'];

  logger.debug(`Result: ${stringRes} | Procedure: ${procedureName} | Input: %o`, value);

  return stringRes ? JSON.parse(stringRes) : null;
};