import type { NextApiRequest, NextApiResponse } from "next";
import rekognition from "@/components/aws-config";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { sourceImage, targetImage } = req.body;

    const params = {
      SourceImage: { S3Object: { Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME, Name: sourceImage } },
      TargetImage: { S3Object: { Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME, Name: targetImage } },
    };

    const response = await rekognition.compareFaces(params).promise();

    if (response.FaceMatches && response.FaceMatches.length > 0) {
      res.status(200).json({
        match: true,
        confidence: response.FaceMatches[0].Similarity,
      });
    } else {
      res.status(200).json({
        match: false,
        confidence: 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Face matching failed", details: error });
  }
}
