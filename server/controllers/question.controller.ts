import { Request, Response } from "express";
import prisma from "../config/prisma";
import constant from "../config/constant";
import httpResponse from "../helpers/httpResponse";
import { uploadMedia } from "../helpers/uploadMedia";
import { IQuestionAnswer } from "../types/answer.interface";

export default {
    async upsertQuestion(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            let { id, question, options, isActive } = req.body;
            let mediaUrl = '';
            let hasImage = false;
            if(req.file) {
                mediaUrl = await uploadMedia(req.file) as string;
                hasImage =  mediaUrl !== '';
            }
            let result = null;
            if(id) {
                /* Update */
                let updatedData: any = {
                    content: question,
                    hasImage,
                    isActive
                }
                if(hasImage) {
                    updatedData.image = mediaUrl;
                }
                result = await prisma.question.update({
                    where: {
                        id: Number(id)
                    },
                    data: updatedData
                });
            } else {
                /* Create */
                result = await prisma.question.create({
                    data: { 
                        content: question,
                        hasImage,
                        image: mediaUrl,
                        isActive
                    }
                });
                id = result.id;
            }
            let createNewAnswer = true;
            if((options as Array<IQuestionAnswer>)[0].id) {
                createNewAnswer = false;
            }
            
            if(createNewAnswer) {
                /* Create */
                await prisma.$transaction(
                    (options as Array<IQuestionAnswer>).map((o) =>
                        prisma.answer.create({
                            data: {
                                questionId: Number(id),
                                content: o.content,
                                explanation: o.explanation,
                                hasImage: false,
                                isCorrect: o.isCorrect
                            }
                        })
                    )
                );
            } else {
                /* Update */
                await prisma.$transaction(
                    (options as Array<IQuestionAnswer>).map((o) =>
                        prisma.answer.update({
                            where: {
                                id: Number(o.id)
                            },
                            data: {
                                questionId: Number(id),
                                content: o.content,
                                explanation: o.explanation,
                                hasImage: false,
                                isCorrect: o.isCorrect
                            }
                        })
                    )
                );
            }
            
            return httpResponse.send(res, 200, constant.success, result);
        } catch(e) {
            console.log('ERROR on upsertQuestion : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async updateQuestionStatus(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            const { isActive, questionId } = req.body;
            const data = await prisma.question.update({
                where: {
                    id: Number(questionId)
                },
                data: {
                    isActive
                }
            })
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on updateQuestionStatus : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async deleteQuestion(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            const { id } = req.params;
            await prisma.answer.deleteMany({
                where: {
                    questionId: Number(id)
                }
            });
            const questionDeletion = await prisma.question.delete({
                where: {
                    id: Number(id)
                }
            });
            return httpResponse.send(res, 200, constant.success, questionDeletion);
        } catch(e) {
            console.log('ERROR on deleteQuestion : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async fetchQuestionDetailAsAdmin(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            const { id } = req.params;
            const question = await prisma.question.findFirst({
                where: {
                    id: Number(id)
                },
                include: {
                    options: {
                        select: {
                            id: true,
                            questionId: true,
                            content: true,
                            hasImage: true,
                            image: true,
                            explanation: true,
                            isCorrect: true
                        }
                    }
                },
            });
            return httpResponse.send(res, 201, constant.success, question);
        } catch(e) {
            console.log('ERROR on fetchQuestionDetailAsAdmin : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async fetchAllQuestion(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            const data = await prisma.question.findMany({
                orderBy: {
                    updatedAt: 'desc'
                }
            });
            return httpResponse.send(res, 201, constant.success, data);
        } catch(e) {
            console.log('ERROR on fetchAllQuestion : ', e);
            return httpResponse.mapError(e, res);
        }
    }
}