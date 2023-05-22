import { Users } from '@prisma/client';

export {};

declare global {
  namespace Express {
    export interface Request {
      user?: Pick<Users, 'id' | 'email' | 'role'>;
    }
  }
}