import express from 'express';
import articleController from '../controllers/article.controller';
import authenticateToken from '../middleware/authenticateToken';

const articleRouter = express.Router();

articleRouter.get('/bookmark', authenticateToken, articleController.fetchBookmarkArticles);
articleRouter.get('/isBookmark/:id', authenticateToken, articleController.isBookmarked);
articleRouter.post('/bookmark', authenticateToken, articleController.bookmarkArticle);
articleRouter.delete('/bookmark/:id', authenticateToken, articleController.removeBookmark);

articleRouter.post('', authenticateToken, articleController.createArticle);
articleRouter.put('', authenticateToken, articleController.updateArticle);
articleRouter.get('', authenticateToken, articleController.fetchArticles);
articleRouter.get('/:id', articleController.fetchArticleById);
articleRouter.delete('/:id', authenticateToken, articleController.deleteArticle);

export default articleRouter;
