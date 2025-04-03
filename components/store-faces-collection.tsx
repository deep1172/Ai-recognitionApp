import { RekognitionClient, IndexFacesCommand } from "@aws-sdk/client-rekognition";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Initialize AWS Rekognition client using environment variables
const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function indexFace(imageKey: string) {
  const params = {
    CollectionId: process.env.AWS_FACE_COLLECTION!,
    Image: { S3Object: { Bucket: process.env.AWS_BUCKET_NAME!, Name: imageKey } },
    ExternalImageId: imageKey,
  };

  try {
    const command = new IndexFacesCommand(params);
    const response = await rekognition.send(command);
    return response.FaceRecords;
  } catch (error) {
    console.error("Rekognition Error:", error);
    return null;
  }
}
