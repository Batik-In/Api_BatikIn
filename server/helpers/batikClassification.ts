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
                description: ''
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
        const datas = ["mega mendung", "kraton", "batik test", "parang", "batik coba", "gentongan", "tujuh rupa", "batik"];
        const randomIndex = Math.floor(Math.random() * datas.length);
        return datas[randomIndex].toLowerCase();
    },
    async processImage() {
        /* TODO : Forward image request to ML model */

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