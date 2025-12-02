import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    if (!file) {
      return NextResponse.json(
        { error: { message: 'No file provided', code: 'NO_FILE' } },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: { message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.', code: 'INVALID_TYPE' } },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: { message: 'File size exceeds 5MB limit', code: 'FILE_TOO_LARGE' } },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = productId 
      ? `${productId}-${Date.now()}.${fileExt}`
      : `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false, // Set to true if you want to overwrite existing files
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json(
        { error: { message: error.message, code: 'UPLOAD_ERROR' } },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      path: filePath,
      url: urlData.publicUrl,
      fileName: fileName,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to upload image',
          code: 'UPLOAD_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove images
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: { message: 'File path is required', code: 'NO_PATH' } },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return NextResponse.json(
        { error: { message: error.message, code: 'DELETE_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to delete image',
          code: 'DELETE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

