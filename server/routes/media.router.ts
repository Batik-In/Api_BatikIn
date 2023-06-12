import express from 'express';
import authenticateToken from '../middleware/authenticateToken';
import userController from '../controllers/user.controller';
import mediaController from '../controllers/media.controller';

const mediaRouter = express.Router();

mediaRouter.post('/:userId', authenticateToken, mediaController.uploadMedia);

export default mediaRouter;
