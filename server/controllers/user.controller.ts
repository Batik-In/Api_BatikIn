import { Request, Response } from "express";
import prisma from "../config/prisma";
import constant from "../config/constant";
import httpResponse from "../helpers/httpResponse";
import bcrypt from 'bcrypt';

export default {
    async fetchAllUsers(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            const data = await prisma.users.findMany({
                orderBy: {
                    role: 'asc'
                }
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on fetchAllUsers : ', e);
            return httpResponse.mapError(e, res);
        }
    }, 
    async fetchUserById(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            const { id } = req.params;
            const data = await prisma.users.findFirst({
                where: {
                    id: Number(id)
                }
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on fetchUserById : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    /* User or Admin can use this endpoint on profile page */
    async fetchUserByToken(req: Request, res: Response) {
        try {
            const data = await prisma.users.findFirst({
                where: {
                    id: Number(req.user?.id)
                }
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on fetchUserByToken : ', e);
            return httpResponse.mapError(e, res);
        }
    }, 
    /* User or Admin can use this endpoint on profile page */
    async updateUserByToken(req: Request, res: Response) {
        try {
            const { name, phone = '', address = '', city = '', profile = '' } = req.body;
            const data = await prisma.users.update({
                where: {
                    id: Number(req.user?.id)
                },
                data: {
                    name,
                    phone,
                    address, 
                    city,
                    profilePicture: profile
                }
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on updateUserByToken : ', e);
            return httpResponse.mapError(e, res);
        }
    }, 
    /* User or Admin can use this endpoint on profile page */
    async updatePasswordByToken(req: Request, res: Response) {
        try {
            const { password } = req.body;
            const data = await prisma.users.update({
                where: {
                    id: Number(req.user?.id)
                },
                data: {
                    password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
                }
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on updatePasswordByToken : ', e);
            return httpResponse.mapError(e, res);
        }
    }, 

}