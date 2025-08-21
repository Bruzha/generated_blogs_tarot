import { getBase64ImageFromPublic } from "@/utils/imageToBase64";

const NEGATIVE_PROMPT = "deformed face, blurry face, extra limbs, distorted hands, missing fingers, incorrect anatomy, duplicate body parts, asymmetrical face, artifacts, glitch, watermark, text, logo, poorly drawn face, extra arms, fused fingers, low quality, photorealism, volumetric fills, outlines, copy of reference, no image, solid fill on entire canvas, black canvas";

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
  Create a unique, natural illustration based on the following description:
  "${imageDescription}"
  
  Instructions:
    - Follow the description strictly for layout, characters, and objects
    - Do not replicate content, layout, or composition from the reference image
    - Use the reference only for artistic style (color, texture, mood, shading)
    -Make it feel like a new artwork that shares the same aesthetic.
  Style: Soft gradients, minimal dotted textures, clean flat fills, without outline.
  Color palette (hex):
    #0A0912, #272639, #35334B, #494766, #4C5A8E, #A481BF, #F2D4A2,
    #B9586B, #959FD8, #D5A2F2, #FFC274, #F76D77

  Negative prompt: ${NEGATIVE_PROMPT}
`.trim();


  return { prompt, styleImageBase64: base64 };
}