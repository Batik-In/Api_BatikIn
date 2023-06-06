import exresss from 'express';
import authRouter from './auth.router';
import articleRouter from './article.router';
import classificationRouter from './classification.router';
import quizRouter from './quiz.router';

const router = exresss.Router();

router.use('/api/auth', authRouter);
router.use('/api/articles', articleRouter);
router.use('/api/classification', classificationRouter);
router.use('/api/quiz', quizRouter);

export default router;
