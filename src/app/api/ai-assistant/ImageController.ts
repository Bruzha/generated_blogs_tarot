import { fal } from "@fal-ai/client";
import { fetch } from "undici";
import sharp from "sharp";

fal.config({
  credentials: process.env.FAL_KEY as string,
});

export async function generateImageWithFlux(
  prompt: string,
  imageBase64s: string[]
): Promise<string | null> {
  try {
    if (!imageBase64s || imageBase64s.length === 0) {
      throw new Error("No reference images provided");
    }

    const imageUrls: string[] = await Promise.all(
      imageBase64s.map(async (base64) => {
        const resized = await resizeBase64Image(base64, 1024, 748);
        return await resized;
      })
    );

    console.log("Prompt: ", prompt);

    const result = await fal.subscribe("fal-ai/flux-pro/kontext/max/multi", {
      input: {
        prompt,
        image_urls: imageUrls,
        guidance_scale: 7,
        num_images: 1,
      },
      logs: true
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60 сек таймаут

  try {
    console.log("Fetching image from URL:", imageUrl);

    const res = await fetch(imageUrl, { signal: controller.signal });
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);

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
  } finally {
    clearTimeout(timeout);
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