//src/app/article/[slug]/ArticleClient.tsx
'use client';

import { PostType } from '@/app/componets/ui/postTable/PostTable';
import { client } from '@/sanity/client';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import './style.scss';
import LoadingIndicator from '@/app/componets/ui/loadingIndicator/LoadingIndicator';

interface Props {
  slug: string;
}

export default function ArticleClient({ slug }: Props) {
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPostFromSanity() {
      try {
        const query = `*[_type == "articlesItem" && slug.current == $slug][0]`;
        const fetchedPost = await client.fetch(query, { slug });

        if (fetchedPost) {
          setPost(fetchedPost);
        } else {
          console.error("❌ Error loading article from Sanity");
        }
      } catch (error) {
        console.error("❌ Error loading article from Sanity:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPostFromSanity();
  }, [slug]);

  if (loading) {
    return <LoadingIndicator stage={'initial-article'} />;
  }

  if (!post) {
    return null;
  }

  return (
    <div className="article">
      <Link href="/" className="article__backLink">
        Back
      </Link>
      <h1 className="article__title">{post.title}</h1>
      <p className="article__publishedDate">
        Published: {format(new Date(post.publishedAt), 'dd.MM.yyyy')}
      </p>
      <div dangerouslySetInnerHTML={{ __html: post.body || '' }} />
    </div>
  );
}
