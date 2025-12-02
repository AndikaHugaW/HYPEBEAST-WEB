import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const heroImagesDir = join(process.cwd(), "public", "images", "hero");
    const files = await readdir(heroImagesDir);
    
    // Filter hanya file gambar (png, jpg, jpeg, webp)
    const imageFiles = files
      .filter((file) => 
        /\.(png|jpg|jpeg|webp)$/i.test(file)
      )
      .sort() // Sort untuk memastikan urutan konsisten
      .map((file) => `/images/hero/${file}`);
    
    return NextResponse.json({ images: imageFiles });
  } catch (error) {
    console.error("Error reading hero images directory:", error);
    return NextResponse.json(
      { images: [] },
      { status: 500 }
    );
  }
}

