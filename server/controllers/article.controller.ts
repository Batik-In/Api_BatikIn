import { Request, Response } from "express";
import httpResponse from "../helpers/httpResponse";
import prisma from "../config/prisma";
import { ItemStatus } from "@prisma/client";
import constant from "../config/constant";

export default {
    async createArticle (req: Request, res: Response) {
        try {
            const { categoryId, title, subtitle, content, image, status } = req.body;
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            const data = await prisma.articles.create({
                data: {
                    categoryId: Number(categoryId),
                    title,
                    subtitle,
                    content,
                    status: status as ItemStatus,
                    image
                }
            });
            return httpResponse.send(res, 201, constant.success, data);
        } catch(e) {
            console.log('ERROR on createArticle : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async updateArticle (req: Request, res: Response) {
        try {
            const { id, categoryId, title, subtitle, content, image, status } = req.body;
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            const exists = await prisma.articles.findFirst({
                where: {
                    id: Number(id)
                }
            });
            if(exists) {
                const data = await prisma.articles.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        categoryId: Number(categoryId),
                        title,
                        subtitle,
                        content,
                        status: status as ItemStatus,
                        image
                    }
                });
                return httpResponse.send(res, 200, constant.success, data);
            }
            /* If item not found */
            return httpResponse.send(res, 404, constant.data_not_found, undefined);
        } catch(e) {
            console.log('ERROR on updateArticle : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async deleteArticle (req: Request, res: Response) {
        try {
            const { id } = req.params;
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            const exists = await prisma.articles.findFirst({
                where: {
                    id: Number(id)
                }
            });
            if(exists) {
                await prisma.articles.delete({
                    where: {
                        id: Number(id)
                    }
                });
                return httpResponse.send(res, 200, constant.success, undefined);
            }
            return httpResponse.send(res, 404, constant.data_not_found, undefined);
        } catch(e) {
            console.log('ERROR on deleteArticle : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async fetchArticles (req: Request, res: Response) {
        try {
            const { categoryId = 1, status } = req.query;
            if(status) {
                const data = await prisma.articles.findMany({
                    where: {
                        categoryId: Number(categoryId),
                        status: status as ItemStatus
                    }
                });
                return httpResponse.send(res, 200, constant.success, data);
            }
            const data = await prisma.articles.findMany({
                where: {
                    categoryId: Number(categoryId),
                }
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on fetchArticles : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async fetchArticleById (req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = await prisma.articles.findFirst({
                where: {
                    id: Number(id)
                }
            });
            if(!data) {
                return httpResponse.send(res, 404, constant.data_not_found, undefined);
            }
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on fetchArticleById : ', e);
            return httpResponse.mapError(e, res);
        }
    }

}