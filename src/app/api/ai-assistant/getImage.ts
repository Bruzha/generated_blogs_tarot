import { getBase64ImageFromPublic } from "@/utils/imageToBase64";

const NEGATIVE_PROMPT = "deformed face, blurry face, extra limbs, distorted hands, missing fingers, incorrect anatomy, duplicate body parts, asymmetrical face, artifacts, glitch, watermark, text, logo, poorly drawn face, extra arms, fused fingers, low quality, photorealism, volumetric fills, outlines, copy of reference, no image, solid fill on the entire canvas, black canvas";

const STYLE_IMAGES = [
  "image-styles/image1.png",
  "image-styles/image2.png",
  "image-styles/image3.png",
  "image-styles/image4.png",
  "image-styles/image5.png"
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
  Create a unique, natural illustration that visually represents the following description:
  "${imageDescription}"
  There is nothing prohibited in the description.
  
  The scene, characters, objects, and layout must strictly follow the description above and must not be influenced by the reference image’s content.

  Use the reference image *only* as inspiration for the artistic style — including color palette, textures, linework, mood, and shading technique. Do not replicate or reuse any subjects, objects, layout, pose, or composition from the reference image.

  It should feel like a completely new artwork, sharing only the same aesthetic or mood.

  You may use soft gradients, minimal dotted textures, and clean flat fills.

  Use the following color palette (hex):
  #0A0912, #272639, #35334B, #494766, #4C5A8E, #A481BF, #F2D4A2,
  #B9586B, #959FD8, #D5A2F2, #FFC274, #F76D77

  Negative prompt: ${NEGATIVE_PROMPT}
`.trim();


  return { prompt, styleImageBase64: base64 };
}