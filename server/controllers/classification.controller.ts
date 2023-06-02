import { Request, Response } from "express";
import httpResponse from "../helpers/httpResponse";
import batikClassification from "../helpers/batikClassification";
import prisma from "../config/prisma";
import constant from "../config/constant";
import * as tf from '@tensorflow/tfjs-node';
import axios from "axios";
import sharp from 'sharp';
import { uploadMedia } from "../helpers/uploadMedia";

const ML_MODEL_PATH = 'file://./server/model/classification/graph_model/model.json';

export default {
    async scanObject(req: Request, res: Response) {
        try {
            /* Check if a file was uploaded */
            if (!req.file) {
              res.status(400).send('No image file uploaded');
              return;
            }
            const model = await tf.loadGraphModel(ML_MODEL_PATH);
            const mediaUrl = await uploadMedia(req.file);

            /* Start Make the prediction using the loaded model */
            const inputData = await preprocessImage(mediaUrl as string);
            // Convert the input data to float32
            const float32InputData = inputData.toFloat();
            const prediction = model.predict(float32InputData);

            let predictionValues: number[] | number[][] | number[][][] | number[][][][] | number[][][][][] | number[][][][][][];

            if (prediction instanceof tf.Tensor) {
                // Single tensor case
                predictionValues = prediction.arraySync() as number[];
            } else if (Array.isArray(prediction)) {
                // Multiple tensors case
                predictionValues = prediction.map(tensor => tensor.arraySync()) as number[] | number[][] | number[][][] | number[][][][] | number[][][][][];
            } else {
                // Handle other cases or throw an error
                throw new Error("Invalid prediction format");
            }
              
            // Flatten the array of values
            const flattenedArray = ([] as number[]).concat(
                ...(Array.isArray(predictionValues[0])
                  ? (predictionValues as number[][]).flat()
                  : (predictionValues as number[])
                )
            );
              
            // Find the index of the highest value in the array
            const maxIndex = flattenedArray.indexOf(Math.max(...flattenedArray));
              
            // Get the predicted class label
            const classLabels = ["gunungan", "kawung", "mega mendung", "parang", "truntum"];
            const predictedClass = classLabels[maxIndex];
              
            // Send the prediction as the response
            return res.status(200).json({
                message: constant.success,
                data: {
                    name: predictedClass,
                    description: 'Lorem Ipsum Dolor Sit Amet',
                    imageUrl: mediaUrl
                }
            });
          } catch (error) {
            console.error('Error on scanObject : ', error);
            return httpResponse.mapError(error, res);
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

// Helper function to preprocess the input image
const preprocessImage = async (imageUrl: string) => {
    try {
      // Download the image from the URL
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data, 'binary');
  
      // Resize the image to the desired dimensions using the sharp library
      const resizedImage = await sharp(imageData)
        .resize({ width: 224, height: 224 })
        .toBuffer();
  
      // Convert the image data to a TensorFlow.js tensor
      const tensor = tf.node.decodeImage(resizedImage, 3);
      const expandedTensor = tensor.expandDims(0);
  
      return expandedTensor;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw new Error('Image preprocessing failed');
    }
  }
  

            // const classificationResult = batikClassification.getRandonBatikName();
            // /* Check if result exists */
            // const batikData = await batikClassification.fetchBatikByName(classificationResult);
            // const processStatus = batikData.valid ? ProcessStatus.SUCCESS : ProcessStatus.FAILED;
            // await batikClassification.saveClassificationHistory(req.user.id, 'XXXXX', processStatus, batikData.data, classificationResult);
            // const responseCode = batikData.valid ? 200 : 404;
            //return httpResponse.send(res, responseCode, batikData.message, batikData.data);