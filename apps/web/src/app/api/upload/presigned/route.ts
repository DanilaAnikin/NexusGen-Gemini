import { NextRequest, NextResponse } from 'next/server';
import {
  createStorageClientFromEnv,
  getSignedUploadUrl,
  generateUuid,
} from '@repo/utils';

// ============ Types ============

interface PresignedUrlRequest {
  filename: string;
  contentType: string;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

// ============ Constants ============

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
];

const MAX_FILENAME_LENGTH = 255;
const PRESIGNED_URL_EXPIRES_IN = 300; // 5 minutes

// ============ Helper Functions ============

/**
 * Sanitize filename to prevent path traversal and other security issues
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  let sanitized = filename.replace(/[/\\:\x00]/g, '_');

  // Remove leading dots to prevent hidden files
  sanitized = sanitized.replace(/^\.+/, '');

  // Limit length
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = sanitized.slice(sanitized.lastIndexOf('.'));
    const name = sanitized.slice(0, MAX_FILENAME_LENGTH - ext.length - 1);
    sanitized = `${name}${ext}`;
  }

  // Ensure we have a valid filename
  if (!sanitized || sanitized === '.') {
    sanitized = 'file';
  }

  return sanitized;
}

/**
 * Get file extension from content type
 */
function getExtensionFromContentType(contentType: string): string {
  const mapping: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
  };
  return mapping[contentType] || 'bin';
}

/**
 * Generate a unique storage key for the uploaded file
 */
function generateStorageKey(filename: string, contentType: string): string {
  const uuid = generateUuid();
  const sanitizedFilename = sanitizeFilename(filename);
  const extension = getExtensionFromContentType(contentType);
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // Format: uploads/YYYY/MM/uuid/filename.ext
  // This structure allows for easy organization and cleanup
  return `uploads/${year}/${month}/${uuid}/${sanitizedFilename}.${extension}`;
}

// ============ Route Handler ============

export async function POST(
  request: NextRequest
): Promise<NextResponse<PresignedUrlResponse | ErrorResponse>> {
  try {
    // Parse request body
    let body: PresignedUrlRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { filename, contentType } = body;

    // Validate required fields
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json(
        { error: 'Filename is required and must be a string' },
        { status: 400 }
      );
    }

    if (!contentType || typeof contentType !== 'string') {
      return NextResponse.json(
        { error: 'Content type is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate content type
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          error: 'Invalid content type',
          details: `Allowed types: ${ALLOWED_CONTENT_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Create storage client and get bucket from environment
    let client;
    let bucket: string;
    try {
      const storage = createStorageClientFromEnv();
      client = storage.client;
      bucket = storage.bucket;
    } catch (error) {
      console.error('Storage configuration error:', error);
      return NextResponse.json(
        {
          error: 'Storage service unavailable',
          details: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : 'Unknown error')
            : undefined,
        },
        { status: 503 }
      );
    }

    // Generate unique storage key
    const key = generateStorageKey(filename, contentType);

    // Generate presigned upload URL
    let uploadUrl: string;
    try {
      uploadUrl = await getSignedUploadUrl(client, bucket, key, {
        contentType,
        expiresIn: PRESIGNED_URL_EXPIRES_IN,
      });
    } catch (error) {
      console.error('Failed to generate presigned URL:', error);
      return NextResponse.json(
        {
          error: 'Failed to generate upload URL',
          details: process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : 'Unknown error')
            : undefined,
        },
        { status: 500 }
      );
    }

    // Return the presigned URL and key
    return NextResponse.json(
      {
        uploadUrl,
        key,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error in presigned URL endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : 'Unknown error')
          : undefined,
      },
      { status: 500 }
    );
  }
}

// ============ OPTIONS Handler for CORS ============

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
