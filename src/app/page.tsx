'use client';

import { useEffect, useState } from 'react';
import PostTable, { PostType } from './componets/ui/postTable/PostTable';
import { generateContentPlan } from '@/utils/generateContentPlan';
import { client } from '@/sanity/client';
import "./style.scss";
import LoadingIndicator, { LoadingStage } from './componets/ui/loadingIndicator/LoadingIndicator';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { setPosts, updatePostStatus } from '../../store/reducers/postsSlice';

export default function IndexPage() {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('initial');
  const [, setSelectedPosts] = useState<string[]>([]);

  const posts = useSelector((state: RootState) => state.posts.data);
  const sortedPosts = [...posts].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);
  const initialized = useSelector((state: RootState) => state.posts.initialized);
  const dispatch = useDispatch<AppDispatch>();

  // Загрузка постов
  useEffect(() => {
    const fetchAllPostsFromSanity = async () => {
      setLoading(true);
      try {
        const allPosts = await client.fetch(`*[_type == "post"] | order(publishedAt desc)`);
        dispatch(setPosts(allPosts));
        if (!allPosts || allPosts.length === 0) {
          await generateContentPlan(allPosts, dispatch, setLoading, setLoadingStage);
        }
      } catch (error) {
        console.error("❌ Error loading posts from Sanity:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialized) {
      fetchAllPostsFromSanity();
    }
  }, [dispatch, initialized]);


  // Обновление статуса поста
  const handlePostUpdate = async (postId: string, newStatus: PostType['status']) => {
    dispatch(updatePostStatus({ id: postId, status: newStatus }));
    if (newStatus === 'Planned for publication') {
      setSelectedPosts(prev => [...prev, postId]);
    } else {
      setSelectedPosts(prev => prev.filter(id => id !== postId));
    }
    setLoadingStage("status-update");
    setLoading(true);
    try {
      const draftId = postId.startsWith('drafts.') ? postId : `drafts.${postId}`;
      await client.patch(draftId).set({ status: newStatus }).commit();
    } catch (error) {
      console.error(`❌ Error updating post status ${postId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Публикация
  const handlePublication = async () => {
    setLoadingStage("publishing");
    setLoading(true);
    try {
      const postsToPublish = posts.filter(post => post.status === 'Planned for publication');

      for (const post of postsToPublish) {
        try {
          const draftId = post._id.startsWith('drafts.') ? post._id : `drafts.${post._id}`;
          const publishedId = draftId.replace('drafts.', '');

          await client
            .transaction()
            .createIfNotExists({
              ...post,
              _id: publishedId,
              _type: 'post',
              status: 'Published',
            })
            .delete(draftId)
            .commit();

          dispatch(updatePostStatus({ id: post._id, status: 'Published' }));
        } catch (error) {
          console.error(`❌ Error while publishing: ${post.title}`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error while publishing posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      {loading ? (
        <LoadingIndicator stage={loadingStage} />
      ) : (
        <>
          <h1 className="main__title">Articles for the CROCODE blog</h1>
          <div className="main__buttonContainer">
            <button
              className={`blueButton ${loading ? 'loading' : ''}`}
              onClick={() =>
                generateContentPlan(posts, dispatch, setLoading, setLoadingStage)
              }
              disabled={loading}
            >
              {loading ? 'Generation...' : 'Create a content plan'}
            </button>
            <button
              className="main__publicationButton"
              onClick={handlePublication}
              disabled={loading}
            >
              Publication
            </button>
          </div>
          <PostTable posts={sortedPosts} onPostUpdate={handlePostUpdate} />
        </>
      )}
    </main>
  );
}