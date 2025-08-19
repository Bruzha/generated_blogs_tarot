import fs from "fs";
import path from "path";

export function getBase64ImageFromPublic(relativePath: string): string | null {
  try {
    const imagePath = path.join(process.cwd(), "public", relativePath);
    const file = fs.readFileSync(imagePath);
    const ext = path.extname(relativePath).slice(1);
    const base64 = file.toString("base64");
    return `data:image/${ext};base64,${base64}`;
  } catch (err) {
    console.error("Error reading image from public folder:", err);
    return null;
  }
}
