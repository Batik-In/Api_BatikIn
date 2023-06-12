import exresss from 'express';
import authRouter from './auth.router';
import articleRouter from './article.router';
import classificationRouter from './classification.router';
import quizRouter from './quiz.router';
import datasetRouter from './dataset.router';
import questionRouter from './question.router';
import userRouter from './user.router';
import mediaRouter from './media.router';

const router = exresss.Router();

router.use('/api/auth', authRouter);
router.use('/api/articles', articleRouter);
router.use('/api/classification', classificationRouter);
router.use('/api/quiz', quizRouter);
router.use('/api/batik', datasetRouter);
router.use('/api/question', questionRouter);
router.use('/api/user', userRouter);
router.use('/api/media', mediaRouter);

export default router;
