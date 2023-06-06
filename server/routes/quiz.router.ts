import express from 'express';
import authenticateToken from '../middleware/authenticateToken';
import quizController from '../controllers/quiz.controller';

const quizRouter = express.Router();

quizRouter.post('/start', authenticateToken, quizController.startQuiz); //
quizRouter.post('/finalize', authenticateToken, quizController.saveQuizResult); //
quizRouter.post('/dummy', quizController.generateDummyQuestion); // DONE

quizRouter.get('/question/:id', quizController.fetchDetailQuestion); // DONE
quizRouter.post('/answer/check', authenticateToken, quizController.checkAnswer); // DONE

quizRouter.get('/history', authenticateToken, quizController.fetchQuizHistory); // 
quizRouter.get('/history/:id', authenticateToken, quizController.fetchQuizHistoryDetail); //


export default quizRouter;
