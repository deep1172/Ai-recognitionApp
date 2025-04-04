import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (file: File): Promise<string> => {
  try {
    const bucketName = process.env.AWS_S3_BUCKET;
    if (!bucketName) {
      throw new Error("S3 Bucket name is not defined in environment variables.");
    }

    const key = `uploads/${Date.now()}-${file.name}`;

    // Convert ArrayBuffer to Uint8Array
    const fileBuffer = new Uint8Array(await file.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ACL: "public-read",
      ContentType: file.type,
    });

    await s3.send(command);

    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`S3 Upload Failed: ${errorMessage}`);
  }
};
