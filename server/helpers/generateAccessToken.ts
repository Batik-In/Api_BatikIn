import jwt from 'jsonwebtoken';
import { Users } from '@prisma/client';

const SECRET = process.env.APP_SECRET_KEY;

export default function generateAccessToken(user: Pick<Users, 'id' | 'email' | 'role'>) {
    if(!SECRET) return;
    return jwt.sign(user, SECRET, { expiresIn: '14d'});
}