import exresss from 'express';
import authRouter from './auth.router';

const router = exresss.Router();

router.use('/api/auth', authRouter);

router.use('/api/articles', authRouter);
router.use('/api/quiz', authRouter);
router.use('/api/classification', authRouter);

export default router;
