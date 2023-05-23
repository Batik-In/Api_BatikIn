import exresss from 'express';
import authRouter from './auth.router';
import articleRouter from './article.router';
import classificationRouter from './classification.router';

const router = exresss.Router();

router.use('/api/auth', authRouter);
router.use('/api/articles', articleRouter);
router.use('/api/classification', classificationRouter);

/* TODO */
router.use('/api/quiz', authRouter);

export default router;
