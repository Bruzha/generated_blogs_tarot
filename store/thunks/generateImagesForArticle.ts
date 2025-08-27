// export default async function generateImagesForArticle(bodyContent: string) {
//   const imagePlaceholderRegex = /<img\s+src=""\s+data-image-description="\[IMAGE:(.*?)\]"\s+alt="(.*?)">/gi;

//   let match;
//   let modifiedBodyContent = bodyContent;
//   let alt;
//   let image;

//   while ((match = imagePlaceholderRegex.exec(bodyContent)) !== null) {
//     const originalTag = match[0];
//     const imageDescription = match[1].trim();
//     alt = match[2].trim();

//     try {
//       const imageResponse = await fetch('/api/ai-assistant/image', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: imageDescription }),
//       });

//       if (!imageResponse.ok) {
//         console.error(`❌ Failed to generate image for "${imageDescription}"`);
//         continue;
//       }

//       const { image: base64Image } = await imageResponse.json();

//       if (!base64Image?.startsWith("data:image/")) {
//         console.error(`❌ Invalid base64 image data:`, base64Image);
//         continue;
//       }
//       image = base64Image;
//       const updatedTag = originalTag.replace('src=""', `src="${base64Image}"`);
//       const escapedOriginalTag = originalTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//       const tagRegex = new RegExp(escapedOriginalTag, 'g');
//       modifiedBodyContent = modifiedBodyContent.replace(tagRegex, updatedTag);

//     } catch (error) {
//       console.error(`❌ Error generating image for "${imageDescription}":`, error);
//     }
//   }

//   return { modifiedBodyContent, alt, image};
// }

// generateImagesForArticle.ts



// eslint-disable-next-line @typescript-eslint/no-explicit-any

import { client } from '@/sanity/client';
import { nanoid } from 'nanoid';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PTBlock = Record<string, any>;

export default async function generateImagesForArticle(
  bodyContent: unknown
): Promise<{
  modifiedBodyContent: PTBlock[];
  images: {
    altText: string;
    image: { _type: 'image'; asset: { _type: 'reference'; _ref: string } };
  }[];
}> {
  let blocks: PTBlock[];

  // 1) Приводим к массиву блоков
  if (Array.isArray(bodyContent)) {
    blocks = bodyContent as PTBlock[];
  } else if (typeof bodyContent === 'string') {
    try {
      blocks = JSON.parse(bodyContent) as PTBlock[];
    } catch (error) {
      console.error('❌ Invalid JSON format for bodyContent:', error);
      return { modifiedBodyContent: [], images: [] };
    }
  } else {
    console.error('❌ bodyContent must be an array or a JSON string');
    return { modifiedBodyContent: [], images: [] };
  }

  const images: {
    altText: string;
    image: { _type: 'image'; asset: { _type: 'reference'; _ref: string } };
  }[] = [];

  const updatedBlocks: PTBlock[] = [];

  for (const block of blocks) {
    // Добавляем _key, если его нет
    if (!block._key) block._key = nanoid();

    // Если это блок изображения с dataImageDescription
    if (block._type === 'image' && block.dataImageDescription) {
      //const match = String(block.dataImageDescription).match(/\[IMAGE:(.*?)\]/i);
      const match = String(block.dataImageDescription).match(/\[IMAGE:\s*(.*?)\]/i);
      console.log("match: ", match);
      if (!match) {
        updatedBlocks.push(block);
        continue;
      }

      const imageDescription = match[1].trim();
      console.log("imageDescription: ", imageDescription);
      const altText = typeof block.alt === 'string' ? block.alt : '';

      try {
        const imageResponse = await fetch('/api/ai-assistant/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imageDescription }),
        });

        if (!imageResponse.ok) {
          console.error(`❌ Failed to generate image for "${imageDescription}"`);
          updatedBlocks.push(block);
          continue;
        }

        const { image: base64Image } = await imageResponse.json();

        if (!base64Image || typeof base64Image !== 'string' || !base64Image.startsWith('data:image/')) {
          console.error('❌ Invalid base64 image data:', base64Image);
          updatedBlocks.push(block);
          continue;
        }

        // Конвертируем base64 в Blob и загружаем в Sanity
        const response = await fetch(base64Image);
        const blob = await response.blob();

        const uploadedAsset = await client.assets.upload('image', blob, {
          filename: `${Date.now()}.webp`,
        });

        // Создаём новый валидный PT-блок для изображения
        const imageBlock: PTBlock = {
          _key: nanoid(),
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: uploadedAsset._id,
          },
          alt: altText,
        };

        images.push({
          altText,
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: uploadedAsset._id,
            },
          },
        });

        updatedBlocks.push(imageBlock);
      } catch (error) {
        console.error(`❌ Error generating image for "${imageDescription}":`, error);
        updatedBlocks.push(block);
      }
    } else {
      // Всё остальное оставляем без изменений
      updatedBlocks.push(block);
    }
  }

  return {
    modifiedBodyContent: updatedBlocks,
    images,
  };
}
