// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PTBlock = Record<string, any>;

export default async function translateArticle(
  baseArticle: {
    title: string;
    desc: string;
    contentRaw: PTBlock[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    seo: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coverImage?: { image: any; altText: string };
  },
  lang: 'ru' | 'uk'
) {
  const payload = {
    title: baseArticle.title,
    desc: baseArticle.desc,
    contentRaw: baseArticle.contentRaw,
    seo: {
      title: baseArticle.seo.title,
      description: baseArticle.seo.description,
      keywords: baseArticle.seo.keywords,
      imageAlt: baseArticle.seo.image?.altText || '',
    },
    coverImageAlt: baseArticle.coverImage?.altText || '',
  };

  const res = await fetch('/api/ai-assistant/translateText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: JSON.stringify(payload), targetLang: lang }),
  });

  const data = await res.json();
  if (!res.ok || !data.translation) {
    console.error('Translation failed', data);
    return baseArticle;
  }

  let translated: typeof payload;
  try {
    const cleaned = data.translation
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/\*\*/g, '')
      .trim();
    translated = JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse translated JSON, using original', e);
    return baseArticle;
  }

  return {
    title: translated.title,
    desc: translated.desc,
    contentRaw: translated.contentRaw,
    seo: {
      ...baseArticle.seo,
      title: translated.seo.title,
      description: translated.seo.description,
      keywords: translated.seo.keywords,
      image: baseArticle.seo.image
        ? { ...baseArticle.seo.image, altText: translated.seo.imageAlt }
        : undefined,
    },
    coverImage: baseArticle.coverImage
      ? { ...baseArticle.coverImage, altText: translated.coverImageAlt }
      : undefined,
  };
}
