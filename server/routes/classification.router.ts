import express from 'express';
import classificationController from '../controllers/classification.controller';
import authenticateToken from '../middleware/authenticateToken';
import multer from 'multer';

const classificationRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

classificationRouter.get('', authenticateToken, classificationController.fetchClassificationHistory);
classificationRouter.get('/admin', authenticateToken, classificationController.fetchClassificationHistoryAsAdmin);
classificationRouter.post('', authenticateToken, classificationController.scanObject);
classificationRouter.post('/dummy', authenticateToken, classificationController.insertDummyClassification);

export default classificationRouter;
