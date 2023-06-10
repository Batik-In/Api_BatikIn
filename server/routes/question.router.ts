import express from 'express';
import authenticateToken from '../middleware/authenticateToken';
import questionController from '../controllers/question.controller';

const questionRouter = express.Router();

questionRouter.get('', authenticateToken, questionController.fetchAllQuestion);
questionRouter.post('', authenticateToken, questionController.upsertQuestion);
questionRouter.put('/status', authenticateToken, questionController.updateQuestionStatus);
questionRouter.get('/:id', authenticateToken, questionController.fetchQuestionDetailAsAdmin);
questionRouter.delete('/:id', authenticateToken, questionController.deleteQuestion);

export default questionRouter;
