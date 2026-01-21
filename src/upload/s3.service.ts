import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: process.env.SUPABASE_REGION, 
      endpoint: process.env.SUPABASE_S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.SUPABASE_ACCESS_KEY!,
        secretAccessKey: process.env.SUPABASE_SECRET_KEY!,
      },
      forcePathStyle: true, // важливо для Supabase
    });
  }

  async uploadFile(bucket: string, key: string, file: Buffer, mimeType: string) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
    });
    return await this.client.send(command);
  }

  async deleteFile(bucket: string, key: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return await this.client.send(command);
  }
}
