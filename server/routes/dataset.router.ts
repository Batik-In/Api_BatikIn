import express from 'express';
import authenticateToken from '../middleware/authenticateToken';
import datasetController from '../controllers/dataset.controller';

const datasetRouter = express.Router();

datasetRouter.get('', authenticateToken, datasetController.fetchBatikDataset);
datasetRouter.get('/:id', authenticateToken, datasetController.fetchBatikDatasetById);
datasetRouter.delete('/:id', authenticateToken, datasetController.deleteBatikDatasetById);
datasetRouter.post('', authenticateToken, datasetController.upsertBatikDataset);


export default datasetRouter;
