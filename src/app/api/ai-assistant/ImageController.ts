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
    const resizedImage = await resizeBase64Image(imageBase64, 1024, 748);

    const result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
      input: {
        image_url: resizedImage,
        prompt,
        strength: 0.9,
        guidance_scale: 5.5,
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

async function resizeBase64Image(base64: string, width: number, height: number): Promise<string> {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const resizedBuffer = await sharp(buffer)
    .resize(width, height, {
      fit: "cover",
    })
    .toFormat("png")
    .toBuffer();

  const resizedBase64 = `data:image/png;base64,${resizedBuffer.toString("base64")}`;
  return resizedBase64;
}