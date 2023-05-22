import exresss from 'express';
import authRouter from './auth.router';
import articleRouter from './article.router';

const router = exresss.Router();

router.use('/api/auth', authRouter);
router.use('/api/articles', articleRouter);

/* TODO */
router.use('/api/quiz', authRouter);
router.use('/api/classification', authRouter);

export default router;
