//src/app/article/[slug]/page.tsx
import ArticleClient from './ArticleClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}


export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  return <ArticleClient slug={slug} />;
}