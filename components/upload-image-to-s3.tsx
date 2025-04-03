import { NextApiRequest, NextApiResponse } from "next";
import { S3Client, PutObjectCommand, ObjectCannedACL  } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { file, fileType } = req.body; // Expecting base64 image or file buffer
    if (!file || !fileType) {
      return res.status(400).json({ error: "Missing file or fileType" });
    }

    const fileName = `${uuidv4()}.${fileType.split("/")[1]}`; // Generate unique filename
    const bucketName = process.env.AWS_S3_BUCKET_NAME!;

    const buffer = Buffer.from(file, "base64");

    const uploadParams = {
      Bucket: bucketName,
      Key: `uploads/${fileName}`,
      Body: buffer,
      ContentType: fileType,
      ACL: "public-read" as ObjectCannedACL, // Make file publicly accessible (optional)
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const imageUrl = `https://${bucketName}.s3.amazonaws.com/uploads/${fileName}`;

    return res.status(200).json({ message: "Upload successful", imageUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ error: "Failed to upload" });
  }
}
