import { getBase64ImageFromPublic } from "@/utils/imageToBase64";

const NEGATIVE_PROMPT = "deformed face, blurry face, extra limbs, distorted hands, missing fingers, incorrect anatomy, asymmetrical face, watermark, text, logo, poorly drawn face, distorted tarot card, illegible symbols, nightmare tarot, malformed text on card, fake cards, ugly symbols, incorrect tarot, outline, crooked faces on tarot";

const STYLE_IMAGES = [
  "image-styles/image1.png",
  "image-styles/image2.png",
  "image-styles/image3.png",
  "image-styles/image4.png",
  "image-styles/image5.png"
];

// export function getImage(imageDescription: string): {
//   prompt: string;
//   styleImageBase64: string;
// } {
//   const styleSrc = STYLE_IMAGES[Math.floor(Math.random() * STYLE_IMAGES.length)];
//   const base64 = getBase64ImageFromPublic(styleSrc);

//   if (!base64) {
//     throw new Error("Style image not found or failed to convert to base64");
//   }

// const prompt = `
//   Create a natural illustration based on the following description:
//   "${imageDescription}"
  
//   Instructions:
//     - Follow the description strictly for layout, characters, and objects
//     - Use the reference only for artistic style (color, texture, mood, shading)
//   Style: Soft gradients, minimal dotted textures, clean flat fills, 2D, without outline.
//   Color palette (hex):
//     #0A0912, #272639, #35334B, #494766, #4C5A8E, #A481BF, #F2D4A2,
//     #B9586B, #959FD8, #D5A2F2, #FFC274, #F76D77

//   Negative prompt: ${NEGATIVE_PROMPT}
// `.trim();


//   return { prompt, styleImageBase64: base64 };
// }

export function getImage(imageDescription: string): {
  prompt: string;
  styleImageBase64: string[];
} {
  const styleSrc = STYLE_IMAGES[Math.floor(Math.random() * STYLE_IMAGES.length)];
  const base64 = getBase64ImageFromPublic(styleSrc);
  const base64Card = getBase64ImageFromPublic("image-styles/card2.png");

  if (!base64) {
    throw new Error("Style image not found or failed to convert to base64");
  }

  const containsTarot = /tarot/i.test(imageDescription);

  const styleImages = containsTarot && base64Card
    ? [base64, base64Card]
    : [base64];

  const prompt = `
Create a natural illustration based on the following description:
"${imageDescription}"

Instructions:
  - Use the first reference image as a style, the second (if you have one) - to insert the tarot cards into the final image
  - If you have Tarot cards, make sure they don't have deformed faces
Style: Soft gradients, minimal dotted textures, clean flat fills, 2D, without outline.

Negative prompt: ${NEGATIVE_PROMPT}
`.trim();
console.log("styleImages: ", styleImages.length);
  return {
    prompt,
    styleImageBase64: styleImages,
  };
}
