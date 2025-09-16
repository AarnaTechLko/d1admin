import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(request: Request) {
  const { fileName, mimeType, folder } = await request.json();

  const bucket = process.env.AWS_BUCKET_NAME;
  const key = `${folder || 'uploads'}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: mimeType,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 300 seconds
  return NextResponse.json({ signedUrl, key });
}