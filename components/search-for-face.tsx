import { RekognitionClient, SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize AWS Rekognition client
const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function searchFace(imageKey: string) {
  const params = {
    CollectionId: process.env.AWS_FACE_COLLECTION!,
    Image: { S3Object: { Bucket: process.env.AWS_BUCKET_NAME!, Name: imageKey } },
    MaxFaces: 1,
    FaceMatchThreshold: 85, // Minimum confidence threshold
  };

  try {
    const command = new SearchFacesByImageCommand(params);
    const response = await rekognition.send(command);

    return response.FaceMatches && response.FaceMatches.length > 0
      ? { match: true, confidence: response.FaceMatches[0].Similarity }
      : { match: false, confidence: 0 };
  } catch (error) {
    console.error("Rekognition Error:", error);
    return { match: false, confidence: 0 };
  }
}
