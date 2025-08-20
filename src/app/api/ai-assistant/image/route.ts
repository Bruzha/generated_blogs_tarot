import { NextRequest, NextResponse } from "next/server";
import { generateImageWithFlux } from "../ImageController";
import { getImage } from "../getImage";


// export async function POST(req: NextRequest) {
//   try {
//     const { prompt: description } = await req.json();

//     if (!description) {
//       return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
//     }

//     const { prompt, styleImageBase64 } = getImage(description);
//     const imageBase64 = await generateImageWithFlux(prompt, styleImageBase64);

//     if (!imageBase64) {
//       return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
//     }

//     return NextResponse.json({ image: imageBase64 }, { status: 200 });
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     console.error("Error in /api/ai-assistant/image:", error);
//     return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const { prompt: description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { prompt, styleImageBase64 } = getImage(description);

    console.log("Starting generation with description:", description);
    console.log("Prompt generated:", prompt);

    const imageBase64 = await generateImageWithFlux(prompt, styleImageBase64);

    if (!imageBase64) {
      return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
    }

    return NextResponse.json({ image: imageBase64 }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("🔥 Error in /api/ai-assistant/image:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
