import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

export const ALLOWED_BUCKETS = ["course-images", "exercise-audios", "results-images"] as const;
export type Bucket = (typeof ALLOWED_BUCKETS)[number];
