import { Request, Response } from "express";

export default {
    async login(req: Request, res: Response) {
        return res.status(200).json({
            message: 'ok'
        });
    },
    async register(req: Request, res: Response) {
        return res.status(200).json({
            message: 'ok'
        });
    },
    async getSession(req: Request, res: Response) {
        return res.status(200).json({
            message: 'ok'
        });
    }
}