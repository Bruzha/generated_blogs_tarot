// import OpenAI from 'openai';
// import sharp from 'sharp';
// import { fetch } from 'undici';

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// export default async function generateImage(prompt: string): Promise<string | null> {
//   try {
//     const response = await openai.images.generate({
//       prompt,
//       n: 1,
//       size: '1024x1024',
//       model: 'dall-e-3',
//       style: 'vivid',
//     });

//     const imageUrl = response.data?.[0]?.url;
//     console.log("imageUrl: ", imageUrl);
//     if (!imageUrl) {
//       console.warn("No image URL returned from OpenAI.");
//       return null;
//     }
//     const optimizedBase64 = await fetchAndOptimizeImage(imageUrl);
//     return optimizedBase64;
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     console.error("Error generating image:", error);
//     if (error.response) {
//       console.error("Image generation error response data:", error.response.data);
//     }
//     return null;
//   }
// }

// async function fetchAndOptimizeImage(imageUrl: string): Promise<string | null> {
//   try {
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 секунд

//     const response = await fetch(imageUrl, {
//       signal: controller.signal,
//     });
//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       throw new Error(`Failed to fetch image: ${response.statusText}`);
//     }

//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     const image = sharp(buffer);
//     const metadata = await image.metadata();

//     const webpBuffer = await image
//       .resize({
//         width: 1024,
//         fit: sharp.fit.inside,
//         withoutEnlargement: true,
//       })
//       .webp({
//         quality: 70,
//         alphaQuality: metadata.hasAlpha ? 70 : undefined,
//       })
//       .toBuffer();

//     const base64String = webpBuffer.toString('base64');
//     return `data:image/webp;base64,${base64String}`;
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     console.error("Error optimizing image:", error);
//     return null;
//   }
// }

import { fal } from "@fal-ai/client";
import { fetch } from "undici";
import sharp from "sharp";

// Подключение API-ключа
fal.config({
  credentials: process.env.FAL_KEY as string,
});

export async function generateImageWithFlux(
  prompt: string,
  imageBase64: string
): Promise<string | null> {
  try {
    const result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
      input: {
        image_url: imageBase64,
        prompt,
        strength: 0.8,
        guidance_scale: 3.5,
        num_inference_steps: 40,
      },
      logs: true,
    });

    const generatedUrl = result.data?.images?.[0]?.url;
    if (!generatedUrl) {
      console.warn("Flux returned no image URL");
      return null;
    }

    return await fetchAndOptimizeImage(generatedUrl);
  } catch (error) {
    console.error("Error generating image with Flux:", error);
    return null;
  }
}

async function fetchAndOptimizeImage(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(res.statusText);
    const buffer = Buffer.from(await res.arrayBuffer());
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const webp = await image
      .resize({ width: 1024, fit: sharp.fit.inside, withoutEnlargement: true })
      .webp({ quality: 70, alphaQuality: metadata.hasAlpha ? 70 : undefined })
      .toBuffer();

    return `data:image/webp;base64,${webp.toString("base64")}`;
  } catch (err) {
    console.error("Error optimizing Flux image:", err);
    return null;
  }
}