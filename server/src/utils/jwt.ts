import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateToken = (id: string, role?: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const sendTokenResponse = (user: any, statusCode: number, res: Response, rememberMe: boolean = false) => {
  const token = generateToken(user.id, user.role);
  
  const days = rememberMe ? 30 : 7;
  const options = {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  const { password, ...userWithoutPassword } = user;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userWithoutPassword
    });
};
