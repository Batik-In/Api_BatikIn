import { Request, Response } from "express";
import constant from "../config/constant";
import prisma from "../config/prisma";
import httpResponse from "../helpers/httpResponse";

export default {
    async fetchBatikDataset(req: Request, res: Response) {
        try {
            const data = await prisma.batik.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on fetchBatikDataset : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async fetchBatikDatasetById(req: Request, res: Response) {
        try {
            const {id } = req.params;
            const data = await prisma.batik.findFirst({
                where: {
                    id: Number(id)
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on fetchBatikDatasetById : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async upsertBatikDataset(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            const { id, name, description, city } = req.body;
            let data = null;
            if(id) {
                /* Update */
                data = await prisma.batik.update({
                    where: {
                       id: Number(id)
                    },
                    data: {
                        name,
                        description,
                        city
                    }
                });
            } else {
                /* Insert */
                data = await prisma.batik.create({
                    data: {
                        name,
                        description,
                        city
                    }
                });
            }
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on upsertBatikDataset : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async deleteBatikDatasetById(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            const { id } = req.params;
            const data = await prisma.batik.delete({
                where: {
                    id: Number(id)
                },
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on deleteBatikDatasetById : ', e);
            return httpResponse.mapError(e, res);
        }
    },
}