import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition";
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

export async function compareFaces(sourceImage: string, targetImage: string) {
  const params = {
    SourceImage: { S3Object: { Bucket: process.env.AWS_BUCKET_NAME!, Name: sourceImage } },
    TargetImage: { S3Object: { Bucket: process.env.AWS_BUCKET_NAME!, Name: targetImage } },
    SimilarityThreshold: 70, // Adjust as needed
  };

  try {
    const command = new CompareFacesCommand(params);
    const response = await rekognition.send(command);

    return response.FaceMatches && response.FaceMatches.length > 0
      ? { match: true, confidence: response.FaceMatches[0].Similarity }
      : { match: false, confidence: 0 };
  } catch (error) {
    console.error("Rekognition Error:", error);
    return { match: false, confidence: 0 };
  }
}
