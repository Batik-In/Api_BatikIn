import { Storage } from '@google-cloud/storage';

const storage = new Storage({
    credentials: {
        client_email: process.env.GCLOUD_CLIENT_EMAIL,
        private_key: process.env.GCLOUD_PRIVATE_KEY
    },
    projectId: process.env.GCLOUD_PROJECT_ID,
});

export default storage;