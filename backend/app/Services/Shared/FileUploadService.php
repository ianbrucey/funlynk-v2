<?php

namespace App\Services\Shared;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * File Upload Service
 * 
 * Handles file uploads to AWS S3 with image optimization and validation
 */
class FileUploadService
{
    private array $allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    private array $allowedDocumentTypes = ['pdf', 'doc', 'docx'];
    private int $maxFileSize = 10240; // 10MB in KB

    /**
     * Upload and optimize an image file
     *
     * @param UploadedFile $file
     * @param string $directory
     * @return array
     * @throws InvalidArgumentException
     */
    public function uploadImage(UploadedFile $file, string $directory = 'images'): array
    {
        $this->validateImage($file);
        
        $filename = $this->generateFilename($file, 'webp');
        $path = $directory . '/' . $filename;
        
        // Resize and optimize image
        $image = Image::make($file);
        $image->resize(1200, 1200, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        
        // Convert to WebP for better compression
        $webpImage = $image->encode('webp', 85);
        
        // Upload to S3
        Storage::disk('s3')->put($path, $webpImage);
        
        // Create thumbnail
        $thumbnailPath = $this->createThumbnail($image, $directory, $filename);
        
        return [
            'original_name' => $file->getClientOriginalName(),
            'filename' => $filename,
            'path' => $path,
            'thumbnail_path' => $thumbnailPath,
            'url' => Storage::disk('s3')->url($path),
            'thumbnail_url' => Storage::disk('s3')->url($thumbnailPath),
            'size' => $file->getSize(),
            'mime_type' => 'image/webp',
        ];
    }

    /**
     * Upload a document file
     *
     * @param UploadedFile $file
     * @param string $directory
     * @return array
     * @throws InvalidArgumentException
     */
    public function uploadDocument(UploadedFile $file, string $directory = 'documents'): array
    {
        $this->validateDocument($file);
        
        $filename = $this->generateFilename($file);
        $path = $directory . '/' . $filename;
        
        // Upload to S3
        Storage::disk('s3')->putFileAs($directory, $file, $filename);
        
        return [
            'original_name' => $file->getClientOriginalName(),
            'filename' => $filename,
            'path' => $path,
            'url' => Storage::disk('s3')->url($path),
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];
    }

    /**
     * Delete a file from S3
     *
     * @param string $path
     * @return bool
     */
    public function deleteFile(string $path): bool
    {
        return Storage::disk('s3')->delete($path);
    }

    /**
     * Delete multiple files from S3
     *
     * @param array $paths
     * @return bool
     */
    public function deleteFiles(array $paths): bool
    {
        return Storage::disk('s3')->delete($paths);
    }

    /**
     * Validate image file
     *
     * @param UploadedFile $file
     * @throws InvalidArgumentException
     */
    private function validateImage(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());
        
        if (!in_array($extension, $this->allowedImageTypes)) {
            throw new InvalidArgumentException('Invalid image type. Allowed: ' . implode(', ', $this->allowedImageTypes));
        }
        
        if ($file->getSize() > $this->maxFileSize * 1024) {
            throw new InvalidArgumentException('File size exceeds maximum allowed size of ' . $this->maxFileSize . 'KB');
        }
    }

    /**
     * Validate document file
     *
     * @param UploadedFile $file
     * @throws InvalidArgumentException
     */
    private function validateDocument(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());
        
        if (!in_array($extension, $this->allowedDocumentTypes)) {
            throw new InvalidArgumentException('Invalid document type. Allowed: ' . implode(', ', $this->allowedDocumentTypes));
        }
        
        if ($file->getSize() > $this->maxFileSize * 1024) {
            throw new InvalidArgumentException('File size exceeds maximum allowed size of ' . $this->maxFileSize . 'KB');
        }
    }

    /**
     * Generate unique filename
     *
     * @param UploadedFile $file
     * @param string|null $forceExtension
     * @return string
     */
    private function generateFilename(UploadedFile $file, ?string $forceExtension = null): string
    {
        $extension = $forceExtension ?? $file->getClientOriginalExtension();
        return Str::uuid() . '.' . $extension;
    }

    /**
     * Create thumbnail for image
     *
     * @param mixed $image
     * @param string $directory
     * @param string $filename
     * @return string
     */
    private function createThumbnail($image, string $directory, string $filename): string
    {
        $thumbnailImage = clone $image;
        $thumbnailImage->resize(300, 300, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        
        $webpThumbnail = $thumbnailImage->encode('webp', 75);
        $thumbnailPath = $directory . '/thumbnails/' . $filename;
        
        Storage::disk('s3')->put($thumbnailPath, $webpThumbnail);
        
        return $thumbnailPath;
    }
}
