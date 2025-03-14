import {s3Storage, s3Database} from '@hot-updater/aws';
import {metro} from '@hot-updater/metro';
import 'dotenv/config';
import {defineConfig} from 'hot-updater';

const options = {
  bucketName: process.env.HOT_UPDATER_S3_BUCKET_NAME!,
  region: process.env.HOT_UPDATER_S3_REGION!,
  credentials: {
    accessKeyId: process.env.HOT_UPDATER_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.HOT_UPDATER_S3_SECRET_ACCESS_KEY!,
  },
};

export default defineConfig({
  build: metro({enableHermes: true, sourcemap: true}),
  storage: s3Storage(options),
  database: s3Database(options),
});
