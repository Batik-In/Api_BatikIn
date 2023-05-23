import express from 'express';
import classificationController from '../controllers/classification.controller';
import authenticateToken from '../middleware/authenticateToken';

const classificationRouter = express.Router();

classificationRouter.get('', authenticateToken, classificationController.fetchClassificationHistory);
classificationRouter.post('', authenticateToken, classificationController.scanObject);

export default classificationRouter;
