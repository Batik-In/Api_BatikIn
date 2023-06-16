import { Request, Response } from "express";
import httpResponse from "../helpers/httpResponse";
import batikClassification from "../helpers/batikClassification";
import prisma from "../config/prisma";
import constant from "../config/constant";
import * as tf from '@tensorflow/tfjs-node';
import axios from "axios";
import sharp from 'sharp';
import { uploadMedia } from "../helpers/uploadMedia";

const ML_MODEL_PATH = 'file://./server/model/classification/static_model/model.json';
const CLASS_LABELS = [
    "geblek renteng", "gunungan", "kawung", "mega mendung", "parang",
    "pring sedapur", "sidoarjo", "simbut", "truntum", "tumpal"
];

export default {
    async scanObject(req: Request, res: Response) {
        try {
            /* Check if a file was uploaded */
            if (!req.file) {
              res.status(400).send('No image file uploaded');
              return;
            }
            console.log('Loading Model ..');
            const model = await tf.loadGraphModel(ML_MODEL_PATH);
            console.log('Uploading Media ..');
            const mediaUrl = await uploadMedia(req.file, req.user?.id || 0);

            console.log('Preprocess Image');
            /* Start Make the prediction using the loaded model */
            const imagePreprocessed = await preprocess2(mediaUrl as string);
            // Convert the input data to float32
            console.log('Predicting...');
            const a = imagePreprocessed?.toFloat();
            let classIndex = 0;
            let raw = "";
            if(a) {
                const p2 = model.predict(a) as tf.Tensor;;
                raw = JSON.stringify(p2);
                const predictedClassTensor = tf.argMax(p2, 1);
                const predictedClassIndex = await predictedClassTensor.data();
                const predictedClass = predictedClassIndex[0];
                console.log("Predicted Class : ", predictedClass)
                classIndex = predictedClass;
            }

            /* Get the predicted class label */
            const predictedClass = CLASS_LABELS[classIndex];

            const batikDetail = await batikClassification.fetchBatikByName(predictedClass);
            batikClassification.saveClassificationHistory(req.user?.id || 0, mediaUrl as string, 'SUCCESS', batikDetail, raw);
            
            return res.status(200).json({
                message: constant.success,
                data: {
                    name: batikDetail.data.name,
                    description: batikDetail.data.description,
                    city: batikDetail.data.city,
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
    },
    async fetchClassificationHistoryAsAdmin(req: Request, res: Response) {
        try {
            if(req.user?.role !== 'ADMIN') {
                return httpResponse.forbiddenAccess(res);
            }
            const { limit = 20 } = req.query;
            const data = await prisma.scanHistory.findMany({
                orderBy: {
                    createdAt: 'desc'
                },
                take: Number(limit)
            });
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on fetchClassificationHistory : ', e);
            return httpResponse.mapError(e, res);
        }
    },
    async insertDummyClassification(req: Request, res: Response) {
        try {
            const data = await prisma.batik.createMany({
                data: [
                    {
                        name: 'geblek renteng',
                        city: 'Solo, Jawa Tengah, Indonesia',
                        description: `Filosofi yang terkandung dalam motif batik Geblek Renteng mengandalkan pada keberanian, kesederhanaan, dan semangat untuk menghadapi tantangan dalam kehidupan.
                        \n\nMakna dari motif Geblek Renteng diwujudkan dalam desainnya yang terdiri dari pola bergelombang atau zigzag yang terhubung. Pola ini menggambarkan perjalanan hidup yang penuh dengan rintangan dan kesulitan yang harus dihadapi dengan keberanian dan ketekunan.
                        \n\nSecara harfiah, "Geblek" berarti "berani" atau "berani menghadapi", sedangkan "Renteng" memiliki arti "berbaris atau berderet-deret". Makna dari filosofi ini adalah untuk menggambarkan bahwa hidup adalah perjalanan yang tidak selalu mudah, tetapi dengan keberanian dan semangat yang tinggi, kita dapat mengatasi segala rintangan dan kesulitan yang ada di depan kita.
                        `
                    },
                    {
                        name: 'gunungan',
                        city: 'Yogyakarta dan Surakarta (Solo), Jawa Tengah, Indonesia',
                        description: `Filosofi yang terkandung dalam motif batik Gunungan sangat kaya dan kompleks. Gunungan dalam budaya Jawa mengacu pada sebuah simbol berupa gunung yang melambangkan keselarasan dan harmoni alam semesta. Gunung dalam budaya Jawa sering dianggap sebagai tempat para dewa dan roh leluhur bersemayam, sehingga memiliki makna yang sakral dan magis.
                        \n\nMakna filosofis dari batik Gunungan adalah sebagai simbol keselarasan dan harmoni antara manusia dengan alam, serta hubungan yang erat antara manusia dengan dunia spiritual. Gunungan dalam motif batik ini biasanya digambarkan sebagai gunung yang besar dengan bentuk kerucut yang tajam, yang melambangkan kemuliaan dan kekuatan alam.
                        \n\nSelain itu, batik Gunungan juga mengandung makna tentang kesadaran akan keberadaan manusia di dunia ini, di mana manusia merupakan bagian dari alam dan harus hidup secara seimbang dengan alam dan lingkungannya. Motif-motif lain yang sering digunakan dalam batik Gunungan adalah burung Garuda dan pohon beringin, yang memiliki makna keagungan dan keluhuran.
                        \n\nSecara keseluruhan, batik Gunungan mengajarkan kita untuk menjaga keseimbangan dan harmoni dengan alam serta meningkatkan kesadaran spiritual. Motif ini juga mengingatkan kita akan pentingnya menjaga lingkungan dan menjalin hubungan yang baik antara manusia dengan alam semesta dan dunia spiritual.
                        `
                    },
                    {
                        name: 'kawung',
                        city: 'Solo, Jawa Tengah, Indonesia',
                        description: `
                        Batik Kawung adalah salah satu motif batik tradisional yang memiliki makna khusus dalam budaya Jawa, Indonesia. Motif ini terdiri dari lingkaran-lingkaran berbentuk buah kawung yang saling berhubungan. Kawung sendiri merujuk pada buah cempedak yang telah masak.
                        \n\nBatik Kawung sering dianggap sebagai simbol kekuasaan, kebijaksanaan, dan keadilan. Motif ini melambangkan kekuatan dan kesucian. Bentuk lingkaran pada motif ini juga mewakili kesatuan dan keluhuran.
                        \n\nSelain itu, Batik Kawung juga dikaitkan dengan kesuburan, keberuntungan, dan harapan akan masa depan yang cerah. Motif ini sering digunakan pada pakaian adat, baik oleh raja dan keluarga kerajaan maupun oleh masyarakat umum dalam acara-acara istimewa.
                        \n\nSecara keseluruhan, Batik Kawung memiliki makna yang dalam dan mewakili nilai-nilai budaya dan filosofi Jawa yang kaya.
                        `
                    },
                    {
                        name: 'mega mendung',
                        city: 'Cirebon, Jawa Barat, Indonesia',
                        description: `Batik Mega Mendung adalah motif batik yang terinspirasi dari awan mendung yang besar dan terlihat di langit. Makna di balik motif ini adalah harapan akan keselamatan, kelancaran, dan kemakmuran. Motif Mega Mendung juga melambangkan perlindungan dan kekuatan dari segala arah.`
                    },
                    {
                        name: 'parang',
                        city: 'Yogyakarta, Jawa Tengah, Indonesia',
                        description: `Motif Parang adalah salah satu motif batik yang paling populer di Indonesia. Motif ini terinspirasi dari pola-pola yang menggambarkan bentuk keris atau golok, yang melambangkan keberanian, kekuatan, dan kemakmuran. Batik Parang sering kali digunakan dalam acara pernikahan atau upacara keagamaan untuk membawa keberuntungan dan kebahagiaan.`
                    },
                    {
                        name: 'pring sedapur',
                        city: 'Yogyakarta, Jawa Tengah, Indonesia',
                        description: `Motif Batik Pring Sedapur menggambarkan pohon bambu dengan daun yang melengkung ke atas. Pohon bambu melambangkan keteguhan, kesuburan, dan keluwesan. Motif ini sering dikaitkan dengan harapan akan kelimpahan rezeki, kesuburan, dan kehidupan yang sejahtera.`
                    },
                    {
                        name: 'sidoarjo',
                        city: 'Sidoarjo, Jawa Timur, Indonesia',
                        description: `
                        Biasanya batik Sidoarjo memiliki pola ciri khas sendiri yaitu ikan bandeng dan udang karena Sidoarjo merupakan penghasil utama dari ikan bandeng dan udang.Selain itu,Motif batik Sidoarjo mengandung makna filosofi yang mendalam yang mencerminkan kearifan lokal dan kehidupan masyarakat setempat.
                        \n\nMakna filosofi dari batik Sidoarjo meliputi:
                        \n\n- Keindahan Alam: Motif-motif dalam batik Sidoarjo sering kali terinspirasi oleh alam sekitar, seperti bunga, daun, dan binatang. Makna filosofi yang terkandung adalah penghormatan terhadap keindahan alam dan kehidupan yang diberikan oleh alam tersebut.
                        \n\n- Simbol Keberuntungan: Beberapa motif dalam batik Sidoarjo juga memiliki makna sebagai simbol keberuntungan. Misalnya, motif naga, burung phoenix, atau ikan koi, yang melambangkan kekuatan, keberanian, dan kemakmuran.
                        \n\n- Tradisi dan Budaya: Batik Sidoarjo juga sering kali menggambarkan unsur-unsur budaya dan tradisi lokal. Motif-motif seperti wayang kulit, tari tradisional, atau permainan tradisional, mencerminkan pentingnya menjaga dan melestarikan warisan budaya setempat.
                        \n\n- Makna Spiritual: Beberapa motif batik Sidoarjo juga memiliki makna spiritual yang dalam. Misalnya, motif-motif yang terkait dengan agama, seperti kaligrafi atau lambang-lambang keagamaan, yang mencerminkan keyakinan dan ketakwaan dalam kehidupan sehari-hari.
                        Secara keseluruhan, batik Sidoarjo mengandung filosofi yang berkaitan dengan alam, keberuntungan, tradisi, dan spiritualitas. Melalui corak dan motifnya, batik Sidoarjo menjadi wujud penghargaan terhadap keindahan alam, kehidupan, dan budaya setempat, serta memperkuat identitas dan kearifan lokal yang ada di Sidoarjo.
                        `
                    },
                    {
                        name: 'simbut',
                        city: 'Suku Badui (Banten)',
                        description: `Motif batik Simbut berbentuk daun yang menyerupai daun talas. Motif Simbut berasal dari suku  Badui pedalaman di Sunda yang kental dengan peradaban lama. Namun, seiring dengan berjalannya waktu, para penduduk badui yang menerima modernitas mengembangkan batik ini di daerah pesisir Banten. Sehingga batik motif Simbut dikenal juga dengan batik Banten.`
                    },
                    {
                        name: 'truntum',
                        city: 'Surakarta, Jawa Tengah, Indonesia',
                        description: `Motif batik ini bermakna cinta yang tumbuh kembali. Diciptakan oleh Kanjeng Ratu Kencana (Permaisuri Ingkang Sinuhun Sri Susuhunan Pakubuwana III dari Surakarta) sebagai simbol cinta yang tulus tanpa syarat, abadi, dan semakin lama semakin terasa subur berkembang (tumaruntum). Karena maknanya, kain bermotif truntum biasa dipakai oleh orang tua pengantin pada hari pernikahan. Harapannya adalah agar cinta kasih yang tumaruntum ini akan menghinggapi kedua mempelai.`
                    },
                    {
                        name: 'tumpal',
                        city: 'Berbagai daerah di Indonesia, termasuk Jawa, Sumatra, dan Sulawesi.',
                        description: `
                        Makna filosofi dari batik Tumpal adalah:
                        \n\n1. Kemakmuran dan Kekayaan: Tumpal merupakan motif yang sering kali digunakan untuk menggambarkan kemakmuran dan kekayaan. Motif tumpal yang berbentuk segitiga atau jajaran genjang yang saling berhubungan melambangkan kelimpahan, kesuburan, dan berkah dalam kehidupan.
                        \n\n2. Keindahan Simetri: Motif Tumpal sering kali diatur dalam pola simetris yang teratur. Hal ini mencerminkan keharmonisan dan keseimbangan dalam kehidupan. Simetri dalam batik Tumpal juga melambangkan kesatuan dan keterhubungan antara manusia dengan alam semesta.
                        \n\n3. Kedamaian dan Kesejajaran: Tumpal juga dapat menggambarkan kedamaian dan kesejajaran. Dalam beberapa motif, tumpal digunakan sebagai perbatasan antara bagian yang berbeda dalam batik, menandakan keselarasan dan keteraturan dalam kehidupan.
                        \n\n4. Lambang Kebangsawanan dan Kekuasaan: Tumpal juga digunakan sebagai simbol kebangsawanan dan kekuasaan dalam budaya Jawa. Motif tumpal yang terdapat pada pakaian adat keraton dan kebangsawanan melambangkan derajat tinggi dan kedudukan istimewa.
                        \n\nSecara keseluruhan, batik Tumpal mengandung filosofi yang berkaitan dengan kemakmuran, keseimbangan, kedamaian, dan kekuasaan. Melalui motif dan simbolnya, batik Tumpal menjadi wujud penghargaan terhadap keindahan, kekayaan, dan nilai-nilai budaya yang tinggi di Indonesia.
                        `
                    },
                ]
            })
            return httpResponse.send(res, 200, constant.success, data);
        } catch(e) {
            console.log('ERROR on insertDummyClassification : ', e);
            return httpResponse.mapError(e, res);
        }
    }

}

/* Helper function to preprocess the input image */
const preprocessImage = async (imageUrl: string) => {
    try {
      /* Download the image from the URL */
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data, 'binary');
  
      /* Resize the image to the desired dimensions using the sharp library */
      const resizedImage = await sharp(imageData)
        .resize({ width: 224, height: 224 })
        .toBuffer();
  
      /* Convert the image data to a TensorFlow.js tensor */
      const tensor = tf.node.decodeImage(resizedImage, 3);
      const expandedTensor = tensor.expandDims(0);
  
      return expandedTensor;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw new Error('Image preprocessing failed');
    }
  }

  const preprocess2 = async (imageUrl: string) => {
    try {
         //convert the image data to a tensor 
         const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
         const imageData = Buffer.from(response.data, 'binary');

         const tensor = tf.node.decodeImage(imageData);
        //resize to 50 X 50
        const resized = tf.image.resizeBilinear(tensor, [224, 224]).toFloat()
        // Normalize the image 
        const offset = tf.scalar(255.0);
        const normalized = tf.scalar(1.0).sub(resized.div(offset));
        //We add a dimension to get a batch shape 
        const batched = normalized.expandDims(0)
        return batched
    } catch(e) {
        console.log('ERROR preprocess2 : ', e);
    }
  }
