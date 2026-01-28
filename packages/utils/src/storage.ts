/**
 * @nexusgen/utils - Storage utilities
 * S3-compatible storage client for file uploads and signed URLs
 *
 * Supports both AWS S3 and MinIO (self-hosted) backends
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';

// ============ Types ============

/**
 * Storage configuration for S3-compatible services
 */
export interface StorageConfig {
  /** Custom endpoint URL (required for MinIO) */
  endpoint?: string;
  /** AWS region */
  region: string;
  /** S3 bucket name */
  bucket: string;
  /** AWS access key ID */
  accessKeyId: string;
  /** AWS secret access key */
  secretAccessKey: string;
  /** Use path-style URLs (required for MinIO) */
  forcePathStyle?: boolean;
}

/**
 * Options for file upload
 */
export interface UploadOptions {
  /** MIME content type */
  contentType?: string;
  /** Custom metadata */
  metadata?: Record<string, string>;
  /** Access control list */
  acl?: 'private' | 'public-read';
}

/**
 * Options for signed upload URL
 */
export interface SignedUploadOptions {
  /** MIME content type */
  contentType?: string;
  /** URL expiration in seconds */
  expiresIn?: number;
}

/**
 * Result of a file upload
 */
export interface UploadResult {
  /** Object key in the bucket */
  key: string;
  /** ETag of the uploaded object */
  etag: string;
  /** Full URL to the object */
  location: string;
}

// ============ Client Creation ============

/**
 * Create an S3-compatible storage client
 *
 * @param config - Storage configuration
 * @returns Configured S3 client
 *
 * @example
 * ```ts
 * // AWS S3
 * const client = createStorageClient({
 *   region: 'us-east-1',
 *   bucket: 'my-bucket',
 *   accessKeyId: process.env.S3_ACCESS_KEY_ID!,
 *   secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
 * });
 *
 * // MinIO
 * const minioClient = createStorageClient({
 *   endpoint: 'http://localhost:9000',
 *   region: 'us-east-1',
 *   bucket: 'my-bucket',
 *   accessKeyId: 'minioadmin',
 *   secretAccessKey: 'minioadmin',
 *   forcePathStyle: true,
 * });
 * ```
 */
export function createStorageClient(config: StorageConfig): S3Client {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.forcePathStyle ?? !!config.endpoint,
  });
}

/**
 * Create a storage client from environment variables
 *
 * Uses:
 * - S3_ENDPOINT (optional, for MinIO)
 * - S3_REGION
 * - S3_BUCKET
 * - S3_ACCESS_KEY_ID
 * - S3_SECRET_ACCESS_KEY
 *
 * @returns Configured S3 client and bucket name
 * @throws Error if required environment variables are missing
 */
export function createStorageClientFromEnv(): { client: S3Client; bucket: string } {
  const region = process.env.S3_REGION;
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing required environment variables: S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY'
    );
  }

  const endpoint = process.env.S3_ENDPOINT;

  const client = createStorageClient({
    endpoint,
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    forcePathStyle: !!endpoint,
  });

  return { client, bucket };
}

// ============ File Operations ============

/**
 * Upload a file to S3-compatible storage
 *
 * @param client - S3 client
 * @param bucket - Bucket name
 * @param key - Object key (path in bucket)
 * @param body - File content
 * @param options - Upload options
 * @returns Upload result with key, etag, and location
 *
 * @example
 * ```ts
 * const result = await uploadFile(
 *   client,
 *   'my-bucket',
 *   'uploads/image.png',
 *   fileBuffer,
 *   { contentType: 'image/png', acl: 'public-read' }
 * );
 * console.log(result.location); // https://my-bucket.s3.amazonaws.com/uploads/image.png
 * ```
 */
export async function uploadFile(
  client: S3Client,
  bucket: string,
  key: string,
  body: Buffer | Readable | string,
  options?: UploadOptions
): Promise<UploadResult> {
  const input: PutObjectCommandInput = {
    Bucket: bucket,
    Key: key,
    Body: body,
  };

  if (options?.contentType) {
    input.ContentType = options.contentType;
  }

  if (options?.metadata) {
    input.Metadata = options.metadata;
  }

  if (options?.acl) {
    input.ACL = options.acl;
  }

  const command = new PutObjectCommand(input);
  const response = await client.send(command);

  // Build location URL
  const config = await client.config.endpoint?.();
  const hostname = config?.hostname ?? `${bucket}.s3.amazonaws.com`;
  const protocol = config?.protocol ?? 'https:';
  const location = `${protocol}//${hostname}/${key}`;

  return {
    key,
    etag: response.ETag?.replace(/"/g, '') ?? '',
    location,
  };
}

/**
 * Get a signed URL for downloading a file
 *
 * @param client - S3 client
 * @param bucket - Bucket name
 * @param key - Object key
 * @param expiresIn - URL expiration in seconds (default: 3600)
 * @returns Signed URL for download
 *
 * @example
 * ```ts
 * const url = await getSignedUrl(client, 'my-bucket', 'private/document.pdf', 900);
 * // URL expires in 15 minutes
 * ```
 */
export async function getSignedUrl(
  client: S3Client,
  bucket: string,
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return awsGetSignedUrl(client, command, { expiresIn });
}

/**
 * Get a signed URL for uploading a file (pre-signed PUT)
 *
 * @param client - S3 client
 * @param bucket - Bucket name
 * @param key - Object key
 * @param options - Signed upload options
 * @returns Signed URL for upload
 *
 * @example
 * ```ts
 * const uploadUrl = await getSignedUploadUrl(
 *   client,
 *   'my-bucket',
 *   'uploads/user-123/avatar.jpg',
 *   { contentType: 'image/jpeg', expiresIn: 300 }
 * );
 * // Client can PUT to this URL directly
 * ```
 */
export async function getSignedUploadUrl(
  client: S3Client,
  bucket: string,
  key: string,
  options?: SignedUploadOptions
): Promise<string> {
  const input: PutObjectCommandInput = {
    Bucket: bucket,
    Key: key,
  };

  if (options?.contentType) {
    input.ContentType = options.contentType;
  }

  const command = new PutObjectCommand(input);

  return awsGetSignedUrl(client, command, {
    expiresIn: options?.expiresIn ?? 3600,
  });
}

/**
 * Delete a file from storage
 *
 * @param client - S3 client
 * @param bucket - Bucket name
 * @param key - Object key
 *
 * @example
 * ```ts
 * await deleteFile(client, 'my-bucket', 'uploads/old-file.pdf');
 * ```
 */
export async function deleteFile(
  client: S3Client,
  bucket: string,
  key: string
): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
}

/**
 * Check if a file exists in storage
 *
 * @param client - S3 client
 * @param bucket - Bucket name
 * @param key - Object key
 * @returns True if file exists, false otherwise
 *
 * @example
 * ```ts
 * if (await fileExists(client, 'my-bucket', 'uploads/image.png')) {
 *   console.log('File found!');
 * }
 * ```
 */
export async function fileExists(
  client: S3Client,
  bucket: string,
  key: string
): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (error) {
    // Check if it's a "not found" error
    if (
      error instanceof Error &&
      (error.name === 'NotFound' || error.name === 'NoSuchKey' || (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404)
    ) {
      return false;
    }
    // Re-throw other errors
    throw error;
  }
}

// ============ Re-exports ============

// Re-export S3Client type for consumers
export { S3Client } from '@aws-sdk/client-s3';
