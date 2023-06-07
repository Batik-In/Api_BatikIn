import { Request, Response } from "express";
import constant from "../config/constant";
import httpResponse from "../helpers/httpResponse";
import prisma from "../config/prisma";
import { uid } from "uid";

export interface IQuizResultData {
    question: string;
    isCorrect: boolean;
    explanation: string;
}

export default {
    /* Endpoint to randomize question */
    async startQuiz(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'USER') {
                return httpResponse.forbiddenAccess(res);
            }
            const questions = await prisma.question.findMany({
                where: {
                    isActive: true
                },
                include: {
                    options: {
                        select: {
                            id: true,
                            questionId: true,
                            content: true,
                            hasImage: true,
                            image: true,
                            explanation: false,
                            isCorrect: false
                        }
                    }
                },
            });
            const questionIndex: Array<number> = questions.map((q) => {
                return q.id
            });
            console.log('Question Total : ', questionIndex.length);
            const selectedIndex: Array<number> = [];
            do {
                const randomIndex = Math.floor(Math.random() * questionIndex.length);
                const exists = selectedIndex.find((i) => i === randomIndex);
                if(!exists) {
                    selectedIndex.push(randomIndex)
                }
            } while(selectedIndex.length < 10);
            const finalData = selectedIndex.map((i) => {
                return questions[i];
            })
            return httpResponse.send(res, 201, constant.success, finalData);
        } catch(e) {
            console.log('ERROR on startQuiz : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    /* Endpoint to fetch Detail Question by Id */
    async fetchDetailQuestion(req: Request, res: Response) {
        try {
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
                            explanation: false,
                            isCorrect: false
                        }
                    }
                },
            });
            return httpResponse.send(res, 200, constant.success, question);
        } catch(e) {
            console.log('ERROR on fetchDetailQuestion : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    /* Endpoint to fetch check answer is correct or not */
    async checkAnswer(req: Request, res: Response) {
        try {
            const { questionId, answerId } = req.body;
            let response = {
                isCorrect: false,
                explanation: 'Sorry, no explanation for this answer'
            }
            const answer = await prisma.answer.findFirst({
                where: {
                    id: Number(answerId),
                    questionId: Number(questionId)
                },
            });
            if(answer) {
                response.isCorrect = answer.isCorrect;
                response.explanation = answer.explanation;
            }
            return httpResponse.send(res, 200, constant.success, response);
        } catch(e) {
            console.log('ERROR on checkAnswer : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    /* Endpoint to save quiz result (after click button finish quiz) */
    async saveQuizResult(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'USER') {
                return httpResponse.forbiddenAccess(res);
            }
            const historyId = uid(16);
            const { data, score } = req.body;
            const creation = await prisma.quizHistory.create({
                data: {
                    id: historyId,
                    userId: req.user.id,
                    score: Number(score)
                }
            });
            await prisma.$transaction(
                (data as Array<IQuizResultData>).map((d) => 
                    prisma.quizHistoryDetail.create({
                        data: {
                            id: uid(16),
                            quizHistoryId: historyId,
                            question: d.question,
                            isCorrect: d.isCorrect,
                            explanation: d.explanation
                        }
                    })
                )
            )
            return httpResponse.send(res, 200, constant.success, creation);
        } catch(e) {
            console.log('ERROR on saveQuizResult : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    /* Endpoint to fetch quiz history detail */
    async fetchQuizHistory(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'USER') {
                return httpResponse.forbiddenAccess(res);
            }
            const data = await prisma.quizHistory.findMany({
                where: {
                    userId: req.user.id
                }
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on fetchQuizHistory : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    /* Endpoint to  fetchQuizHistoryDetail */
    async fetchQuizHistoryDetail(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'USER') {
                return httpResponse.forbiddenAccess(res);
            }
            const { id } = req.params;
            const data = await prisma.quizHistoryDetail.findMany({
                where: {
                    quizHistoryId: id as string
                }
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on fetchQuizHistoryDetail : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    /* Endpoint to generate Dummy question (20 Question) */ 
    async generateDummyQuestion(req: Request, res: Response) {
        const questions: Array<number> = [];
        for (let i = 1; i < 21; i++) {
            const question = await prisma.question.create({
                data: {
                    content: `Question ${i}`,
                    hasImage: false,
                    isActive: true
                }
            });
            questions.push(question.id);
        }
        const answers: Array<any> = [];
        questions.map((q) => {
            for (let i = 1; i < 4; i++) {
                answers.push({
                    questionId: q,
                    content: `Option ${i}`,
                    explanation: `This answer is XXXX`,
                    hasImage: false,
                    isCorrect: false
                })
            }
        });
        await prisma.$transaction([
            prisma.answer.createMany({
                data: answers
            })
        ]);
        return httpResponse.send(res, 200, constant.success, { status: 'OK!'});
    }
}