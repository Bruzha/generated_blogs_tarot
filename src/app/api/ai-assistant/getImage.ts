import { getBase64ImageFromPublic } from "@/utils/imageToBase64";

const NEGATIVE_PROMPT = "deformed face, blurry face, extra limbs, distorted hands, missing fingers, incorrect anatomy, unrealistic reflections, duplicate body parts, asymmetrical face, artifacts, glitch, watermark, text, logo, poorly drawn face, extra arms, fused fingers, low quality";

const STYLE_IMAGES = [
  "image-styles/image1.png",
  "image-styles/image2.png",
  "image-styles/image3.png",
  "image-styles/image4.png",
  "image-styles/image5.png",
  "image-styles/image6.png"
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
  Generate a natural, high-quality minimalistic illustration in which ${imageDescription}.
  Use the style, color palette, and mood of the reference image,
  but do not copy its content, subject, objects, or composition.
  The result must be a completely new scene with unique elements,
  only inspired by the artistic style of the reference image.
  The output image must be exactly 1024x1024 pixels in resolution. 
  Don't add text or outlines. Gradients and light, fine dotted fill structures are allowed (as in the reference).

  You can use colors (hex): 
    #0A0912 
    #272639 
    #35334B 
    #494766 
    #4C5A8E 
    #A481BF 
    #F2D4A2 
    #B9586B 
    #959FD8 
    #D5A2F2 
    #FFC274 
    #F76D77

  Negative prompt: ${NEGATIVE_PROMPT}
`.trim();

  return { prompt, styleImageBase64: base64 };
}