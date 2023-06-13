import express from 'express';
import authenticateToken from '../middleware/authenticateToken';
import quizController from '../controllers/quiz.controller';

const quizRouter = express.Router();

quizRouter.get('/state', authenticateToken, quizController.fetchActiveState); // 1
quizRouter.post('/start', authenticateToken, quizController.startQuiz); // 2

quizRouter.post('/finalize', authenticateToken, quizController.saveQuizResult); // 6
quizRouter.post('/dummy', quizController.generateDummyQuestion); 

quizRouter.get('/question/:id', quizController.fetchDetailQuestion); // 3
quizRouter.post('/answer/check', authenticateToken, quizController.checkAnswer); // 4
quizRouter.put('/state', authenticateToken, quizController.updateQuizState); // 5

quizRouter.get('/history', authenticateToken, quizController.fetchQuizHistory); // 7
quizRouter.get('/history/admin', authenticateToken, quizController.fetchQuizHistory); // 7
quizRouter.get('/history/:id', authenticateToken, quizController.fetchQuizHistoryDetail); // 8


export default quizRouter;
