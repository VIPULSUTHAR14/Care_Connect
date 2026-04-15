import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Ensure we run in the Node.js runtime
export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

async function uploadBufferToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "hospital/premises" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result?.secure_url || "");
      }
    );

    uploadStream.end(buffer);
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const buffers: Buffer[] = await Promise.all(
      files.map(async (file) => {
        if (!(file instanceof File)) {
          throw new Error("Invalid file input");
        }
        const arrayBuffer = await file.arrayBuffer();
        return Buffer.from(arrayBuffer);
      })
    );

    const urls = await Promise.all(buffers.map((buf) => uploadBufferToCloudinary(buf)));

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}


