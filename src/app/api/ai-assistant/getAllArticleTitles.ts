import { client } from '@/sanity/client';

export async function getAllArticleTitles(): Promise<string[]> {
  try {
    const articles: { title: string }[] = await client.fetch(
      `*[_type == "articlesItem" && i18n_lang == "en"]{ title }`
    );
    const titles = articles.map(a => a.title).filter(Boolean);
    const uniqueTitles = Array.from(new Set(titles));

    return uniqueTitles;
  } catch (error) {
    console.error("❌ Ошибка при получении заголовков статей:", error);
    return [];
  }
}
