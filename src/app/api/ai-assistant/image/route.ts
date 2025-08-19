import { NextRequest, NextResponse } from "next/server";
import { generateImageWithFlux } from "../ImageController";

import { getBase64ImageFromPublic } from "@/utils/imageToBase64";

const NEGATIVE_PROMPT = "deformed face, blurry face, extra limbs, distorted hands, missing fingers, incorrect anatomy, unrealistic reflections, duplicate body parts, asymmetrical face, artifacts, glitch, watermark, text, logo, poorly drawn face, extra arms, fused fingers, low quality, incorrect screen location, deformed diagrams";
const STYLE_IMAGES = [
  "image-styles/style1.png",
  "image-styles/style2.png",
  "image-styles/style3.png",
  "image-styles/style4.png",
  "image-styles/style5.png",
  "image-styles/style6.png",
  "image-styles/style10.png",
];

export function getImage(imageDescription: string): {
  prompt: string;
  styleImageBase64: string;
} {
  const styleSrc = STYLE_IMAGES[Math.floor(Math.random() * STYLE_IMAGES.length)];
  const base64 = getBase64ImageFromPublic(styleSrc);

  if (!base64) {
    throw new Error("Style image not found or failed to convert to base64");
  }

  const prompt = `
  Generate a realistic natural photo in which ${imageDescription}.
  Use the style, color palette, and mood of the reference image,
  but do not copy its content, subject, objects, or composition.
  The result must be a completely new scene with unique elements,
  only inspired by the artistic style of the reference image.
  The output image must be exactly 1024x1024 pixels in resolution.

  Negative prompt: ${NEGATIVE_PROMPT}
`.trim();

  return { prompt, styleImageBase64: base64 };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt: description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { prompt, styleImageBase64 } = getImage(description);
    const imageBase64 = await generateImageWithFlux(prompt, styleImageBase64);

    if (!imageBase64) {
      return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
    }

    return NextResponse.json({ image: imageBase64 }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error in /api/ai-assistant/image:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
