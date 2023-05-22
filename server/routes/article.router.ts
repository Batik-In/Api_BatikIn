import express from 'express';
import articleController from '../controllers/article.controller';

const articleRouter = express.Router();

articleRouter.post('', articleController.createArticle);
articleRouter.put('', articleController.updateArticle);
articleRouter.get('', articleController.fetchArticles);
articleRouter.get('/:id', articleController.fetchArticleById);
articleRouter.delete('/:id', articleController.deleteArticle);

export default articleRouter;
