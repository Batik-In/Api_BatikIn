import { Users } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import constant from '../config/constant';

const SECRET = process.env.APP_SECRET_KEY;

function authenticateToken(req: Request & { user?: Pick<Users, 'id' | 'email' | 'role'> }, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) {
        return res.status(401).json({
            message: constant.unauthorized
        }); 
    }
  
    jwt.verify(token, SECRET as string, (err, user) => {
      if (err) {
        return res.status(401).json({
            message: constant.unauthorized
        }); 
      }
      req.user = user as Pick<Users, 'id' | 'email' | 'role'>;
      next();
    });
  }
  
  export default authenticateToken;