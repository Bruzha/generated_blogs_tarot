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
  async function translateText(text: string, targetLang: 'ru' | 'uk') {
    const res = await fetch('/api/ai-assistant/translateText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });

    const data = await res.json();
    if (!res.ok || !data.translation) {
      console.error('Translation failed', data);
      return text;
    }

    return data.translation;
  }
  const translatedTitle = await translateText(baseArticle.title, lang);
  const translatedDesc = await translateText(baseArticle.desc, lang);
  const translatedContentRawStr = await translateText(JSON.stringify(baseArticle.contentRaw), lang);
  let translatedContentRaw: PTBlock[] = [];
  try {
    translatedContentRaw = JSON.parse(translatedContentRawStr);
  } catch (error) {
    console.error('Failed to parse translated contentRaw:', error);
    translatedContentRaw = baseArticle.contentRaw; // fallback
  }

  // Перевод SEO
  const translatedSeo = {
    ...baseArticle.seo,
    seoTitle: baseArticle.seo.seoTitle ? await translateText(baseArticle.seo.seoTitle, lang) : '',
    seoDescription: baseArticle.seo.seoDescription
      ? await translateText(baseArticle.seo.seoDescription, lang)
      : '',
  };

  // Перевод altText для coverImage
  const translatedCover =
    baseArticle.coverImage && baseArticle.coverImage.altText
      ? {
          ...baseArticle.coverImage,
          altText: await translateText(baseArticle.coverImage.altText, lang),
        }
      : baseArticle.coverImage;

  return {
    title: translatedTitle,
    desc: translatedDesc,
    contentRaw: translatedContentRaw,
    seo: translatedSeo,
    coverImage: translatedCover,
  };
}
