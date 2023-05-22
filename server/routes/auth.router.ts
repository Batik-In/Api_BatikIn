import express from 'express';
import authController from '../controllers/auth.controller';

const authRouter = express.Router();

authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.get('/session', authController.getSession);

export default authRouter;
