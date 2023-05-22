import { Response } from "express";
import axios from 'axios';
import { Prisma } from "@prisma/client";

export default {
    send(res: Response, code: number, message: string, data: any) {
        return res.status(code).json({
            message,
            data
        });
    },
    mapError(err: unknown, res: Response) {
        let status = 500;
        let message = 'Unknown error';
    
        try {
            if (axios.isAxiosError(err)) {
                status = err.response?.status || 500;
                message = err.response?.data;
            } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code.startsWith('P1')) {
                    message = `Database and prisma connection error occured`;
                }
                if (err.code.startsWith('P3')) {
                    message = `Prisma migration error occured`;
                }
                if (err.code.startsWith('P4')) {
                    message = `Prisma db pull error occured`;
                }
                if (err.code === 'P2000') {
                    status = 400;
                    message = `The provided value for the column is too long`;
                }
                if (err.code === 'P2001') {
                    status = 400;
                    message = `Record not found in where condition`;
                }
                if (err.code === 'P2002') {
                    status = 400;
                    message = `Your ${(err.meta as { target: string[] }).target.includes('countryCode') &&
                            (err.meta as { target: string[] }).target.includes('subscriberNumber')
                            ? 'phone number'
                            : (err.meta as { target: string[] }).target.join(', ')
                        } has been registered in bitbybit. Please enter a valid one`;
                }
                if (err.code === 'P2003') {
                    status = 400;
                    message = `Foreign key constraint failed`;
                }
                if (err.code === 'P2004') {
                    status = 400;
                    message = `Unknown constraint failed`;
                }
            } else if (err instanceof Prisma.NotFoundError) {
                status = 400;
                message = err.message;
            } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
                status = 400;
                message = `Unexpected prisma error`;
            } else if (err instanceof Prisma.PrismaClientRustPanicError) {
                status = 400;
                message = `Unexpected prisma client termination`;
            } else if (err instanceof Prisma.PrismaClientInitializationError) {
                status = 400;
                message = `Prisma client initialization error`;
            } else if (err instanceof Prisma.PrismaClientValidationError) {
                status = 400;
                message = `Prisma validation fails`;
            } else if (err instanceof Error) {
                status = 400;
                message = err.message;
            }
        } catch (err) {
            console.error('Parsing error message fails::', err);
        }
        return res?.status(status).json(message);
    }
}