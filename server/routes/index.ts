import exresss from 'express';
import authRouter from './auth.router';
import articleRouter from './article.router';
import classificationRouter from './classification.router';
import quizRouter from './quiz.router';
import datasetRouter from './dataset.router';

const router = exresss.Router();

router.use('/api/auth', authRouter);
router.use('/api/articles', articleRouter);
router.use('/api/classification', classificationRouter);
router.use('/api/quiz', quizRouter);
router.use('/api/batik', datasetRouter);

export default router;
