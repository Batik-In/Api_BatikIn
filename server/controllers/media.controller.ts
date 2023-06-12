import { Request, Response } from "express";
import prisma from "../config/prisma";
import { ItemStatus } from "@prisma/client";
import constant from "../config/constant";
import httpResponse from "../helpers/httpResponse";
import { uploadMedia } from "../helpers/uploadMedia";

export default {
    async uploadMedia (req: Request, res: Response) {
        try {
            const { userId } = req.params;
            let mediaUrl = '';
            if(req.file) {
                mediaUrl = await uploadMedia(req.file, Number(userId)) as string;
            }
            return httpResponse.send(res, 201, constant.success, { url: mediaUrl });
        } catch(e) {
            console.log('ERROR on uploadMedia : ', e);
            return httpResponse.mapError(e, res);
        }
    }
}