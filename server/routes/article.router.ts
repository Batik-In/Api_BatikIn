import express from 'express';
import articleController from '../controllers/article.controller';
import authenticateToken from '../middleware/authenticateToken';

const articleRouter = express.Router();

articleRouter.post('', authenticateToken, articleController.createArticle);
articleRouter.put('', authenticateToken, articleController.updateArticle);
articleRouter.get('', authenticateToken, articleController.fetchArticles);
articleRouter.get('/:id', articleController.fetchArticleById);
articleRouter.delete('/:id', authenticateToken, articleController.deleteArticle);

export default articleRouter;
