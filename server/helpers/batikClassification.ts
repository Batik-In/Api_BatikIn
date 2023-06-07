import { ProcessStatus } from "@prisma/client";
import constant from "../config/constant";
import prisma from "../config/prisma";
import { uid } from "uid";

export default {
    async fetchBatikByName(name: string) {
        const result = {
            valid: false,
            data: {
                name,
                description: '',
                city: ''
            },
            message: constant.data_not_found
        }
        try {
            const data = await prisma.batik.findFirst({
                where: {
                    name
                }
            });
            if(data) {
                result.valid = true;
                result.data.name = `Batik ${name}`;
                result.data.city = data.city;
                result.data.description = data.description;
                result.message = constant.success;
            }
        } catch(e) {
            console.log('ERROR on fetchBatikByName : ', e);
            result.message = constant.internal_server_error;
        }
        return result;
    },
    getRandonBatikName() {
        /* This is function to testing image classification response (will be deprecated after ML model ready) */
        const CLASS_LABELS = [
            "geblek renteng", "gunungan", "kawung", "mega mendung", "parang",
            "pring sedapur", "sidoarjo", "simbut", "truntum", "tumpal"
        ];
        const randomIndex = Math.floor(Math.random() * CLASS_LABELS.length);
        return CLASS_LABELS[randomIndex].toLowerCase();
    },
    async saveClassificationHistory(userId: number, image: string, status: ProcessStatus, result: any, rawResponse: string) {
        /* Function to save image classification hsitory */
        return await prisma.scanHistory.create({
            data: {
                id: uid(32),
                userId: Number(userId),
                image,
                status,
                result,
                rawResponse
            },
        });
    }
}