import { body, param, ValidationChain } from 'express-validator';


const rules: Record<string, ValidationChain[]> = {
  login: [
    body('email', 'You must provide an email!').exists(),
    body('email', 'Email must be a string!').isString(),
    body('email', 'Email must be atleast 5 characters long!').isLength({ min: 5 }),
    body('email', 'Email must be at most 30 characters long!').isLength({ max: 30 }),
    body('email', 'Please enter valid email!').isEmail(),

    body('password', 'You must provide an password!').exists(),
    body('password', 'Password must be a string!').isString(),
    body('password', 'Password must be atleast 5 characters long!').isLength({ min: 5 }),
    body('password', 'Password must be at most 20 characters long!').isLength({ max: 20 }),
  ],
  register: [
    body('email', 'You must provide an email!').exists(),
    body('email', 'Email must be a string!').isString(),
    body('email', 'Email must be atleast 5 characters long!').isLength({ min: 5 }),
    body('email', 'Email must be at most 30 characters long!').isLength({ max: 30 }),
    body('email', 'Please enter valid email!').isEmail(),

    body('password', 'You must provide an password!').exists(),
    body('password', 'Password must be a string!').isString(),
    body('password', 'Password must be atleast 5 characters long!').isLength({ min: 5 }),
    body('password', 'Password must be at most 20 characters long!').isLength({ max: 20 }),
  ],

  'verify-user': [
    param('token', 'You must provide a valid verification token!').exists(),
    param('token', 'You must provide a valid verification token!').isJWT(),
  ],


  'forgot-password': [
    body('email', 'You must provide an email!').exists(),
    body('email', 'Email must be a string!').isString(),
    body('email', 'Email must be atleast 5 characters long!').isLength({ min: 5 }),
    body('email', 'Email must be at most 30 characters long!').isLength({ max: 30 }),
    body('email', 'Please enter valid email!').isEmail(),
  ],

  'reset-password': [
    param('token', 'You must provide a valid verification token!').exists(),
    param('token', 'You must provide a valid verification token!').isJWT(),
    body('password', 'You must provide an password!').exists(),
    body('password', 'Password must be a string!').isString(),
    body('password', 'Password must be atleast 5 characters long!').isLength({ min: 5 }),
    body('password', 'Password must be at most 20 characters long!').isLength({ max: 20 }),
  ]
};


export const getAuthValidationRules = (method: string): ValidationChain[] => rules[method];