import { NextRequest, NextResponse } from "next/server";
import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition";

// ✅ Ensure environment variables are set
if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET) {
  throw new Error("Missing AWS environment variables. Please check your .env file.");
}

// ✅ Initialize AWS Rekognition Client
const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { sourceImage, targetImage } = await req.json();

    // ✅ Validate input images
    if (!sourceImage || !targetImage) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const params = {
      SourceImage: { S3Object: { Bucket: process.env.AWS_S3_BUCKET!, Name: sourceImage } },
      TargetImage: { S3Object: { Bucket: process.env.AWS_S3_BUCKET!, Name: targetImage } },
      SimilarityThreshold: 70,
    };

    console.log("🔍 Sending request to AWS Rekognition with params:", params);

    const response = await rekognition.send(new CompareFacesCommand(params));

    console.log("✅ Rekognition Response:", response);

    const faceMatch = response.FaceMatches?.[0] || null;

    return NextResponse.json({
      match: !!faceMatch,
      confidence: faceMatch?.Similarity ?? 0,
    });

  } catch (error) {
    console.error("❌ Rekognition Error:", error);

    // ✅ Ensure TypeScript can safely access `error.message`
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: "Failed to process your request", details: errorMessage },
      { status: 500 }
    );
  }
}
