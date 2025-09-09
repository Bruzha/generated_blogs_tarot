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
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
  const initialized = useSelector((state: RootState) => state.posts.initialized);
  const dispatch = useDispatch<AppDispatch>();

  // Загрузка постов
  useEffect(() => {
    const fetchAllPostsFromSanity = async () => {
      setLoading(true);
      try {
        const allPosts = await client.fetch(`*[_type == "articlesItem" && i18n_lang == "en" && !(_id in path("drafts.**"))] | order(date desc)`);
        console.log("allPosts: ", allPosts)
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
            _type: 'articlesItem',
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
//   if (postIds.length === 0) return;

//   setLoadingStage('deleting');
//   setLoading(true);

//   try {
//     for (const id of postIds) {
//       const query = `*[_type == "articlesItem" && (references($id) || _id == $id)]._id`;
//       const allIds = await client.fetch<string[]>(query, { id });

//       if (allIds.length === 0) continue;
//       const transaction = client.transaction();
//       const translations = allIds.filter(docId => docId !== id);
//       translations.forEach(docId => transaction.delete(docId));
//       transaction.delete(id);

//       await transaction.commit();
//       dispatch(setPosts(posts.filter(post => !allIds.includes(post._id))));
      
//     }
//   } catch (error) {
//     console.error('❌ Error deleting posts:', error);
//     alert('Failed to delete some posts');
//   } finally {
//     setLoading(false);
//   }
// };

  const handleDeletePosts = async (postIds: string[]) => {
    if (postIds.length === 0) return;

    setLoadingStage('deleting');
    setLoading(true);

    try {
      const idsToRemove: string[] = [];

      for (const id of postIds) {
        const query = `*[_type == "articlesItem" && (references($id) || _id == $id)]._id`;
        const allIds = await client.fetch<string[]>(query, { id });

        if (allIds.length === 0) continue;
        const transaction = client.transaction();
        const translations = allIds.filter(docId => docId !== id);
        translations.forEach(docId => transaction.delete(docId));
        transaction.delete(id);

        await transaction.commit();

        idsToRemove.push(...allIds);
      }

      dispatch(setPosts(posts.filter(post => !idsToRemove.includes(post._id))));
    } catch (error) {
      console.error('❌ Error deleting posts:', error);
      alert('Failed to delete some posts');
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
          <h1 className="main__title">Articles for the tarot blog</h1>
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
          <PostTable posts={sortedPosts} onPostUpdate={handlePostUpdate} onDeletePosts={handleDeletePosts} />
        </>
      )}
    </main>
  );
}
