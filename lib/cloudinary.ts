import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type CloudinaryUploadResult = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
  altText: string;
};

export async function uploadToCloudinary(file: File, altText: string): Promise<CloudinaryUploadResult> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are not configured.');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await new Promise<{
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'omri-prompt',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        overwrite: true,
        filename_override: file.name.split('.').slice(0, -1).join('.') || 'omri-prompt-image',
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          const cloudinaryError = error as { http_code?: number; message?: string; name?: string } | undefined;
          const status = cloudinaryError?.http_code ? ` (${cloudinaryError.http_code})` : '';
          if (cloudinaryError?.http_code === 403) {
            reject(new Error('Cloudinary upload failed (403): the configured API key lacks create/upload permission. Grant upload access to this key in Cloudinary or configure a key with upload permissions.'));
            return;
          }
          const reason = cloudinaryError?.message || cloudinaryError?.name || 'Unknown Cloudinary error';
          reject(new Error(`Cloudinary upload failed${status}: ${reason}`));
          return;
        }

        resolve({
          public_id: String(uploadResult.public_id ?? ''),
          secure_url: String(uploadResult.secure_url ?? ''),
          width: Number(uploadResult.width ?? 0),
          height: Number(uploadResult.height ?? 0),
          format: String(uploadResult.format ?? 'webp'),
          resource_type: String(uploadResult.resource_type ?? 'image'),
        });
      },
    );
    stream.end(buffer);
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width ?? 0,
    height: result.height ?? 0,
    format: result.format ?? 'webp',
    resourceType: result.resource_type ?? 'image',
    altText: altText || 'AI photo prompt visual',
  };
}
