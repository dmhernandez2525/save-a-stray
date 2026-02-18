import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { logger } from './logger';

// Configure from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export interface UploadSignatureResult {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  format?: string;
}

export function generateUploadSignature(folder: string): UploadSignatureResult {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    throw new Error('Cloudinary API secret not configured');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    folder,
  };
}

export function generateImageUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  const transforms: Record<string, string | number | undefined> = {};
  if (options.width) transforms.width = options.width;
  if (options.height) transforms.height = options.height;
  if (options.crop) transforms.crop = options.crop;
  if (options.quality) transforms.quality = options.quality;
  if (options.format) transforms.fetch_format = options.format;

  return cloudinary.url(publicId, {
    transformation: [transforms],
    secure: true,
  });
}

export function getThumbnailUrl(publicId: string): string {
  return generateImageUrl(publicId, {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'webp',
  });
}

export function getMediumUrl(publicId: string): string {
  return generateImageUrl(publicId, {
    width: 800,
    height: 600,
    crop: 'limit',
    quality: 'auto',
    format: 'webp',
  });
}

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    logger.error('cloudinary_delete_failed', {
      publicId,
      message: (error as Error).message,
    });
    return false;
  }
}

const VIDEO_URL_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
  /^https?:\/\/youtu\.be\/[\w-]+/,
  /^https?:\/\/(www\.)?vimeo\.com\/\d+/,
  /^https?:\/\/.+\.(mp4|webm|ogg)(\?.*)?$/i,
];

export function isValidVideoUrl(url: string): boolean {
  return VIDEO_URL_PATTERNS.some(pattern => pattern.test(url));
}

export function extractVideoThumbnail(url: string): string | null {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtubeMatch) {
    return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
  }
  // Vimeo thumbnails require API call, return null
  return null;
}
