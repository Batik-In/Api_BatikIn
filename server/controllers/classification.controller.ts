import { Request, Response } from "express";
import httpResponse from "../helpers/httpResponse";
import batikClassification from "../helpers/batikClassification";
import prisma from "../config/prisma";
import constant from "../config/constant";
import { ProcessStatus } from "@prisma/client";
import axios from 'axios';

export default {
    async scanObject(req: Request, res: Response) {
        try {
            /* TODO :  Adjust this controller after ML Model ready */
            if(req.user?.role !== 'USER') {
                return httpResponse.forbiddenAccess(res);
            }
            /* TODO : Forward request to ML model */
            const classificationResult = batikClassification.getRandonBatikName();
            /* Check if result exists */
            const batikData = await batikClassification.fetchBatikByName(classificationResult);
            const processStatus = batikData.valid ? ProcessStatus.SUCCESS : ProcessStatus.FAILED;
            await batikClassification.saveClassificationHistory(req.user.id, 'XXXXX', processStatus, batikData.data, classificationResult);
            const responseCode = batikData.valid ? 200 : 404;
            return httpResponse.send(res, responseCode, batikData.message, batikData.data);
        } catch(e) {
            console.log('ERROR on scanObject : ', e);
            if (axios.isAxiosError(e)) {
                await batikClassification.saveClassificationHistory(req?.user?.id || 0, 'XXXXX', ProcessStatus.FAILED, {name: '', description: ''}, JSON.stringify(e.response?.data));
            }
            return httpResponse.mapError(e, res);
        }
    },
    async fetchClassificationHistory(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'USER') {
                return httpResponse.forbiddenAccess(res);
            }
            const data = await prisma.scanHistory.findMany({
                where: {
                    userId: Number(req.user.id)
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on fetchClassificationHistory : ', e);
            return httpResponse.mapError(e, res);
        }
    }

}