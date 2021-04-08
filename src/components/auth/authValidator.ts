import { body, param, ValidationChain } from 'express-validator';

const email = [
  body('email', 'You must provide an email!').exists(),
  body('email', 'Email must be a string!').isString(),
  body('email', 'Email must be atleast 5 characters long!').isLength({ min: 5 }),
  body('email', 'Email must be at most 30 characters long!').isLength({ max: 30 }),
  body('email', 'Please enter valid email!').isEmail(),
];

const password = [
  body('password', 'You must provide an password!').exists(),
  body('password', 'Password must be a string!').isString(),
  body('password', 'Password must be atleast 5 characters long!').isLength({ min: 5 }),
  body('password', 'Password must be at most 20 characters long!').isLength({ max: 20 }),
];

const token = [
  param('token', 'You must provide a valid verification token!').exists(),
  param('token', 'You must provide a valid verification token!').isJWT(),
];

const appId = [
  body('appId', 'You must provide a valid app id!').exists(),
  body('appId', 'App ID must be a string').isString(),
];


const rules: Record<string, ValidationChain[]> = {
  login: [
    ...email,
    ...password,
  ],
  register: [
    ...email,
    ...password,
    ...appId,
  ],

  'verify-user': [
    ...token,
  ],


  'forgot-password': [
    ...email,
    ...appId,
  ],

  'reset-password': [
    ...token,
    ...password,
    ...email,
  ]
};


export const getAuthValidationRules = (method: string): ValidationChain[] => rules[method];