import { getBase64ImageFromPublic } from "@/utils/imageToBase64";

const NEGATIVE_PROMPT = "deformed face, blurry face, extra limbs, distorted hands, missing fingers, incorrect anatomy, asymmetrical face, watermark, outline, poorly drawn face, distorted tarot card, illegible symbols, nightmare tarot, malformed text on card, fake cards, ugly symbols, incorrect tarot, outline, crooked faces on tarot";

const STYLE_IMAGES = [
  "image-styles/image1.png",
  "image-styles/image2.png",
  "image-styles/image3.png",
  "image-styles/image4.png",
  "image-styles/image5.png"
];

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

  //const containsTarot = /tarot/i.test(imageDescription);
  // const styleImages = containsTarot && base64Card
  //   ? [base64, base64Card]
  //   : [base64];

   const styleImages = [String(base64), String(base64Card)];

  const prompt = `
Create a natural illustration based on the following description:
"${imageDescription}"

Instructions:
  - Use the first reference image as a style, the second (if you have one) - to insert the tarot cards into the final image
  - If you have Tarot cards, make sure that the faces are not deformed and that the text is correct and legible
Style: Soft gradients, 2D clean flat fills without outline.
Negative prompt: ${NEGATIVE_PROMPT}
`.trim();
  return {
    prompt,
    styleImageBase64: styleImages,
  };
}
