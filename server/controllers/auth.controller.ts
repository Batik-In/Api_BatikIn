import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import httpResponse from "../helpers/httpResponse";
import constant from "../config/constant";
import prisma from "../config/prisma";
import generateAccessToken from "../helpers/generateAccessToken";

export default {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const data = await prisma.users.findMany({
                where: {
                    email
                }
            });
            if(data.length < 1) {
                /* If login using not registered email */
                return httpResponse.send(res, 401, `Email not registered !`, undefined);
            }
            const user = data[0];
            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if(!isValidPassword) {
                /* If login using invalid password */
                return httpResponse.send(res, 401, `Incorrect password!`, undefined);
            }
            const accessToken = generateAccessToken({id: user.id, email: user.email, role: user.role});
            return httpResponse.send(res, 200, constant.success, {
                userId: user.id.toString(),
                name: user.name,
                accessToken
            });
        } catch(e) {
            console.log('ERROR on login : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async register(req: Request, res: Response) {
        try {
            const { email, password, name } = req.body;
            const data = await prisma.users.findMany({
                where: {
                    email
                }
            });
            if(data.length > 0) {
                /* Validation for existing email */
                return httpResponse.send(res, 400, `Email ${email} already used!`, undefined);
            }
            const newUser = await prisma.users.create({
                data: {
                    email,
                    password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
                    name
                }
            });
            return httpResponse.send(res, 200, constant.success, newUser);
        } catch(e) {
            console.log('ERROR on register : ', e);
            return httpResponse.mapError(e, res);
        }
    },
}