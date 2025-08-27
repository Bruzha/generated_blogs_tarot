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
        const allPosts = await client.fetch(`*[_type == "articlesItem" && i18n_lang == "en"] | order(date desc)`);
        //const allPosts = await client.fetch(`*[_type == "articlesItem"] | order(date desc)`);
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

  // const handleDeletePosts = async (postIds: string[]) => {
  //   if (postIds.length === 0) return;

  //   setLoadingStage('deleting');
  //   setLoading(true);

  //   try {
  //     // Удаление постов из Sanity
  //     await Promise.all(postIds.map(id => client.delete(id)));

  //     // Обновление состояния Redux
  //     dispatch(setPosts(posts.filter(post => !postIds.includes(post._id))));
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
    for (const id of postIds) {
      // 1️⃣ Находим все связанные документы (переводы + базовый)
      const query = `*[_type == "articlesItem" && (references($id) || _id == $id)]._id`;
      const allIds = await client.fetch<string[]>(query, { id });

      if (allIds.length === 0) continue;

      // 2️⃣ Создаём транзакцию
      const transaction = client.transaction();

      // Сначала удаляем переводы (они ссылаются на базовый)
      const translations = allIds.filter(docId => docId !== id);
      translations.forEach(docId => transaction.delete(docId));

      // Потом удаляем базовый
      transaction.delete(id);

      await transaction.commit();

      // 3️⃣ Обновляем Redux
      dispatch(setPosts(posts.filter(post => !allIds.includes(post._id))));
    }
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

// export default function IndexPage() {
//   const [loading, setLoading] = useState(false);
//   const [loadingStage, setLoadingStage] = useState<LoadingStage>('initial');
//   const [, setSelectedPosts] = useState<string[]>([]);

//   const posts = useSelector((state: RootState) => state.posts.data);
//   const sortedPosts = [...posts].sort(
//   (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
// );
//   const initialized = useSelector((state: RootState) => state.posts.initialized);
//   const dispatch = useDispatch<AppDispatch>();

//   // Загрузка постов
//   useEffect(() => {
//     const fetchAllPostsFromSanity = async () => {
//       setLoading(true);
//       try {
//         const allPosts = await client.fetch(`*[_type == "post"] | order(publishedAt desc)`);
//         dispatch(setPosts(allPosts));
//         if (!allPosts || allPosts.length === 0) {
//           await generateContentPlan(allPosts, dispatch, setLoading, setLoadingStage);
//         }
//       } catch (error) {
//         console.error("❌ Error loading posts from Sanity:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (!initialized) {
//       fetchAllPostsFromSanity();
//     }
//   }, [dispatch, initialized]);


//   // Обновление статуса поста
//   const handlePostUpdate = async (postId: string, newStatus: PostType['status']) => {
//     dispatch(updatePostStatus({ id: postId, status: newStatus }));
//     if (newStatus === 'Planned for publication') {
//       setSelectedPosts(prev => [...prev, postId]);
//     } else {
//       setSelectedPosts(prev => prev.filter(id => id !== postId));
//     }
//     setLoadingStage("status-update");
//     setLoading(true);
//     try {
//       const draftId = postId.startsWith('drafts.') ? postId : `drafts.${postId}`;
//       await client.patch(draftId).set({ status: newStatus }).commit();
//     } catch (error) {
//       console.error(`❌ Error updating post status ${postId}:`, error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Публикация
//   const handlePublication = async () => {
//     setLoadingStage("publishing");
//     setLoading(true);
//     try {
//       const postsToPublish = posts.filter(post => post.status === 'Planned for publication');

//       for (const post of postsToPublish) {
//         try {
//           const draftId = post._id.startsWith('drafts.') ? post._id : `drafts.${post._id}`;
//           const publishedId = draftId.replace('drafts.', '');

//           await client
//             .transaction()
//             .createIfNotExists({
//               ...post,
//               _id: publishedId,
//               _type: 'post',
//               status: 'Published',
//             })
//             .delete(draftId)
//             .commit();

//           dispatch(updatePostStatus({ id: post._id, status: 'Published' }));
//         } catch (error) {
//           console.error(`❌ Error while publishing: ${post.title}`, error);
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error while publishing posts:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeletePosts = async (postIds: string[]) => {
//     if (postIds.length === 0) return;

//     setLoadingStage('deleting');
//     setLoading(true);

//     try {
//       // Удаление постов из Sanity
//       await Promise.all(postIds.map(id => client.delete(id)));

//       // Обновление состояния Redux
//       dispatch(setPosts(posts.filter(post => !postIds.includes(post._id))));
//     } catch (error) {
//       console.error('❌ Error deleting posts:', error);
//       alert('Failed to delete some posts');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="main">
//       {loading ? (
//         <LoadingIndicator stage={loadingStage} />
//       ) : (
//         <>
//           <h1 className="main__title">Articles for the tarot blog</h1>
//           <div className="main__buttonContainer">
//             <button
//               className={`blueButton ${loading ? 'loading' : ''}`}
//               onClick={() =>
//                 generateContentPlan(posts, dispatch, setLoading, setLoadingStage)
//               }
//               disabled={loading}
//             >
//               {loading ? 'Generation...' : 'Create a content plan'}
//             </button>
//             <button
//               className="main__publicationButton"
//               onClick={handlePublication}
//               disabled={loading}
//             >
//               Publication
//             </button>
//           </div>
//           <PostTable posts={sortedPosts} onPostUpdate={handlePostUpdate} onDeletePosts={handleDeletePosts} />
//         </>
//       )}
//     </main>
//   );
// }

// 'use client';

// import { useEffect, useState } from 'react';
// import PostTable, { PostType } from './componets/ui/postTable/PostTable';
// import { generateContentPlan } from '@/utils/generateContentPlan';
// import "./style.scss";
// import LoadingIndicator, { LoadingStage } from './componets/ui/loadingIndicator/LoadingIndicator';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, RootState } from '../../store';
// import { setPosts, updatePostStatus } from '../../store/reducers/postsSlice';

// // GraphQL helper
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// async function sanityGraphQLRequest(query: string, variables: Record<string, any> = {}) {
//   const response = await fetch(process.env.NEXT_PUBLIC_SANITY_GRAPHQL_URL!, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SANITY_API_TOKEN}`
//     },
//     body: JSON.stringify({ query, variables })
//   });

//   const json = await response.json();

//   if (json.errors) {
//     console.error("❌ GraphQL Error:", json.errors);
//     throw new Error(JSON.stringify(json.errors));
//   }

//   return json.data;
// }

// export default function IndexPage() {
//   console.log("process.env.NEXT_PUBLIC_SANITY_GRAPHQL_URL: ", process.env.NEXT_PUBLIC_SANITY_GRAPHQL_URL);
//   const [loading, setLoading] = useState(false);
//   const [loadingStage, setLoadingStage] = useState<LoadingStage>('initial');
//   const [, setSelectedPosts] = useState<string[]>([]);

//   const posts = useSelector((state: RootState) => state.posts.data);
//   const sortedPosts = [...posts].sort(
//     (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
//   );
//   const initialized = useSelector((state: RootState) => state.posts.initialized);
//   const dispatch = useDispatch<AppDispatch>();

//   // Загрузка постов
//   useEffect(() => {
//     const fetchAllPostsFromSanity = async () => {
//       setLoading(true);
//       try {
//         const query = `
//           query {
//             allPage {
//               _id
//               title
//             }
//           }
//         `;

//         const data = await sanityGraphQLRequest(query);
//         console.log("data: ", data)
//         const allPosts = data.allPost;

//         //dispatch(setPosts(allPosts));

//         if (!allPosts || allPosts.length === 0) {
//           await generateContentPlan(allPosts, dispatch, setLoading, setLoadingStage);
//         }
//       } catch (error) {
//         console.error("❌ Error loading posts from Sanity:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (!initialized) {
//       fetchAllPostsFromSanity();
//     }
//   }, [dispatch, initialized]);

//   // Обновление статуса поста
//   const handlePostUpdate = async (postId: string, newStatus: PostType['status']) => {
//     dispatch(updatePostStatus({ id: postId, status: newStatus }));

//     if (newStatus === 'Planned for publication') {
//       setSelectedPosts(prev => [...prev, postId]);
//     } else {
//       setSelectedPosts(prev => prev.filter(id => id !== postId));
//     }

//     setLoadingStage("status-update");
//     setLoading(true);

//     try {
//       const mutation = `
//         mutation UpdatePostStatus($id: ID!, $status: String!) {
//           patchPost(id: $id, data: { status: $status }) {
//             _id
//             status
//           }
//         }
//       `;

//       await sanityGraphQLRequest(mutation, { id: postId, status: newStatus });
//     } catch (error) {
//       console.error(`❌ Error updating post status ${postId}:`, error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Публикация
//   const handlePublication = async () => {
//     setLoadingStage("publishing");
//     setLoading(true);

//     try {
//       const postsToPublish = posts.filter(post => post.status === 'Planned for publication');

//       for (const post of postsToPublish) {
//         try {
//           const mutation = `
//             mutation PublishPost($draftId: ID!, $publishedId: ID!) {
//               createPost(id: $publishedId, data: {
//                 title: "${post.title}",
//                 slug: { current: "${post.slug.current}" },
//                 publishedAt: "${post.publishedAt}",
//                 status: "Published",
//                 body: ${JSON.stringify(post.body)}
//               }) {
//                 _id
//                 status
//               }
//               deletePost(id: $draftId) {
//                 _id
//               }
//             }
//           `;

//           await sanityGraphQLRequest(mutation, {
//             draftId: post._id,
//             publishedId: post._id.replace('drafts.', '')
//           });

//           dispatch(updatePostStatus({ id: post._id, status: 'Published' }));
//         } catch (error) {
//           console.error(`❌ Error while publishing: ${post.title}`, error);
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error while publishing posts:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeletePosts = async (postIds: string[]) => {
//     if (postIds.length === 0) return;

//     setLoadingStage('deleting');
//     setLoading(true);

//     try {
//       const mutation = `
//         mutation DeletePosts($ids: [ID!]!) {
//           deletePost(id: $ids) {
//             _id
//           }
//         }
//       `;

//       await sanityGraphQLRequest(mutation, { ids: postIds });
//       dispatch(setPosts(posts.filter(post => !postIds.includes(post._id))));
//     } catch (error) {
//       console.error('❌ Error deleting posts:', error);
//       alert('Failed to delete some posts');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="main">
//       {loading ? (
//         <LoadingIndicator stage={loadingStage} />
//       ) : (
//         <>
//           <h1 className="main__title">Articles for the tarot blog</h1>
//           <div className="main__buttonContainer">
//             <button
//               className={`blueButton ${loading ? 'loading' : ''}`}
//               onClick={() =>
//                 generateContentPlan(posts, dispatch, setLoading, setLoadingStage)
//               }
//               disabled={loading}
//             >
//               {loading ? 'Generation...' : 'Create a content plan'}
//             </button>
//             <button
//               className="main__publicationButton"
//               onClick={handlePublication}
//               disabled={loading}
//             >
//               Publication
//             </button>
//           </div>
//           <PostTable
//             posts={sortedPosts}
//             onPostUpdate={handlePostUpdate}
//             onDeletePosts={handleDeletePosts}
//           />
//         </>
//       )}
//     </main>
//   );
// }
