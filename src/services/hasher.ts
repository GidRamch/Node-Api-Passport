import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const getHash = (plainText: string): Promise<string> => bcrypt.hash(plainText, SALT_ROUNDS);

export const compareHash = (plainText: string, hash: string): Promise<boolean> => bcrypt.compare(plainText, hash);