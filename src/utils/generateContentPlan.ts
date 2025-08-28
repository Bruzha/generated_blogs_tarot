import { getTuesdaysAndFridaysForNextMonth } from "./dateUtils";
import { exampleContentPlan } from "./ArticleTemplate";
import { getContentPlanPrompt } from "@/prompts/contentPlanPrompt";
import fetchContentPlan from "../../store/thunks/fetchContentPlan";
import { getArticlePrompt } from "@/prompts/articlePrompt";
import fetchArticleContent from "../../store/thunks/fetchArticleContent";
import generateImagesForArticle from "../../store/thunks/generateImagesForArticle";
import { client } from "../sanity/client";
import { LoadingStage } from "@/app/componets/ui/loadingIndicator/LoadingIndicator";
import { AppDispatch } from "../../store";
import { addPost } from "../../store/reducers/postsSlice";
import { PostType } from "@/app/componets/ui/postTable/PostTable";
import translateArticle from "./translateArticle";
import { selectCategoriesForDates } from "./modalUtils";

export async function generateContentPlan(
  posts: PostType[],
  dispatch: AppDispatch,
  setLoading: (val: boolean) => void,
  setLoadingStage: (stage: LoadingStage) => void
) {
  
  setLoading(true);
  setLoadingStage('content-plan');

  const existingTitles = posts.map(post => post.title);
  const articleDates = getTuesdaysAndFridaysForNextMonth();

  const selectedCategories = await selectCategoriesForDates(articleDates);

  if (!selectedCategories || Object.keys(selectedCategories).length === 0) {
    setLoading(false); 
    setLoadingStage('initial');
    return;                  
  }

  // const topicsForArticles = Array.from({ length: articleDates.length }, () => {
  //   return topics[Math.floor(Math.random() * topics.length)];
  // });

  const allCategoryIds = Object.values(selectedCategories).flat();
  const uniqueCategoryIds = [...new Set(allCategoryIds)];
  const categoriesData = await client.fetch<{ _id: string; title: string }[]>(
    `*[_type == "blogCategory" && _id in $ids]{_id, title}`,
    { ids: uniqueCategoryIds }
  );
  const categoriesForPrompt: string[] = articleDates.map(d => {
    const dateKey = d.toISOString().split('T')[0];
    const catsForDate = selectedCategories[dateKey] || [];
    const titles = catsForDate
      .map(catId => categoriesData.find(cat => cat._id === catId)?.title)
      .filter(Boolean);
    return titles.join(', ');
  });

  console.log("categoriesForPrompt: ", categoriesForPrompt)
  const combinedPromptContentPlan = getContentPlanPrompt(
    categoriesForPrompt,
    existingTitles,
    exampleContentPlan,
    articleDates
  );

  const combinedContentPlan = await fetchContentPlan(combinedPromptContentPlan);

  if (!combinedContentPlan || !Array.isArray(combinedContentPlan)) {
    console.error('❌ Failed to fetch combined content plan or result is not an array');
    setLoading(false);
    setLoadingStage('done');
    return;
  }

  setLoadingStage('article-generation');
  const articlePromises = [];

  for (let i = 0; i < 1; i++) {
    const contentPlan = combinedContentPlan[i];
    const d = articleDates[i];
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;

    if (!contentPlan) continue;

    const generateArticle = async () => {
      try {
        const promptArticle = getArticlePrompt(
          contentPlan.title,
          contentPlan.keywords,
          categoriesForPrompt[i]
        );

        const bodyContent = await fetchArticleContent(promptArticle);
        if (!bodyContent) return null;
        console.log("bodyContent: ", bodyContent);
        setLoadingStage('image-generation');

        const { modifiedBodyContent, images } = await generateImagesForArticle(bodyContent);

        const slugBase = contentPlan.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const timestamp = new Date().toISOString().replace(/[^a-z0-9]+/gi, '-');
        //const fullSlug = `${slugBase}-${timestamp}`;

        const cover = images.length > 0 ? { image: images[0].image, altText: images[0].altText } : undefined;

        const dateKey = d.toISOString().split('T')[0];
        const categoriesForDate = selectedCategories[dateKey] || [];
        
        // английская версия
        const enArticle = {
          _type: 'articlesItem',
          _id: timestamp,
          title: contentPlan.title,
          slug: { _type: 'slug', current: `/${slugBase}` },
          date,
          ...(cover ? { coverImage: cover } : {}),
          seo: {},
          i18n_lang: 'en',
          content: modifiedBodyContent,
          category: categoriesForDate.map((catId: string) => ({
            _key: timestamp,
            _type: 'reference',
            _ref: catId,
          }))
        };

        const createdEn = await client.create(enArticle);
        console.log("createdEn: ", createdEn);

        const categoriesWithRefs = await client.fetch<{
          _id: string;
          i18n_lang: string;
          refs: { _id: string; i18n_lang: string }[];
        }[]>(
          `*[_type == "blogCategory" && _id in $ids]{
            _id,
            i18n_lang,
            "refs": i18n_refs[]->{ _id, i18n_lang }
          }`,
          { ids: categoriesForDate }
        );

        const getLocalizedCategories = (lang: 'ru' | 'uk') => {
          return categoriesWithRefs.map(cat => {
            if (cat.i18n_lang === lang) {
              return { _key: timestamp, _type: 'reference', _ref: cat._id };
            }
            const match = cat.refs?.find(r => r.i18n_lang === lang);
            return { _key: timestamp, _type: 'reference', _ref: match ? match._id : cat._id };
          });
        };

        // Переводы
        setLoadingStage('create-other-version');
        const languages: ('ru' | 'uk')[] = ['ru', 'uk'];
        const translatedDocs = [];

        for (const lang of languages) {
          const localizedCategories = getLocalizedCategories(lang);
          console.log("localizedCategories: ", localizedCategories)

          const translatedData = await translateArticle(
            {
              title: createdEn.title,
              contentRaw: createdEn.content,
              seo: createdEn.seo,
              coverImage: createdEn.coverImage,
            },
            lang
          );

          const doc = {
            _id: `${timestamp}__i18n_${lang}`,
            _type: 'articlesItem',
            title: translatedData.title,
            slug: { _type: 'slug', current: `/${slugBase}-${lang}` },
            date: createdEn.date,
            content: translatedData.contentRaw,
            coverImage: translatedData.coverImage,
            seo: translatedData.seo,
            i18n_lang: lang,
            i18n_base: { _type: 'reference', _ref: createdEn._id },
            category: localizedCategories,
          };

          const createdDoc = await client.create(doc);
          translatedDocs.push(createdDoc);
        }

        // Обновление i18n_refs
        const allRefs = [createdEn, ...translatedDocs].map(d => ({ _type: 'reference', _ref: d._id }));

        await client.patch(createdEn._id).set({ i18n_refs: allRefs }).commit();

        for (const doc of translatedDocs) {
          await client.patch(doc._id).set({ i18n_refs: allRefs }).commit();
        }

        const postToStore: PostType = {
          _id: createdEn._id,
          title: createdEn.title,
          slug: { current: createdEn.slug.current },
          date: createdEn.date,
        };

        dispatch(addPost(postToStore));
        return postToStore;
      } catch (error) {
        console.error('❌ Error while generating article:', error);
        return null;
      } finally {
        setLoadingStage('article-generation');
      }
    };

    articlePromises.push(generateArticle());
  }

  await Promise.allSettled(articlePromises);
  setLoading(false);
  setLoadingStage('done');
}


// export async function generateContentPlan(
//   posts: PostType[],
//   dispatch: AppDispatch,
//   setLoading: (val: boolean) => void,
//   setLoadingStage: (stage: LoadingStage) => void,
// ) {
//   setLoading(true);
//   setLoadingStage('content-plan');

//   const existingTitles = posts.map(post => post.title);
//   const articleDates = getTuesdaysAndFridaysForNextMonth();

//   const topicsForArticles = Array.from({ length: articleDates.length }, () => {
//     return topics[Math.floor(Math.random() * topics.length)];
//   });

//   const combinedPromptContentPlan = getContentPlanPrompt(
//     topicsForArticles,
//     existingTitles,
//     exampleContentPlan,
//     articleDates
//   );

//   const combinedContentPlan = await fetchContentPlan(combinedPromptContentPlan);

//   if (!combinedContentPlan || !Array.isArray(combinedContentPlan)) {
//     console.error('❌ Failed to fetch combined content plan or result is not an array');
//     setLoading(false);
//     setLoadingStage('done');
//     return;
//   }

//   setLoadingStage('article-generation');

//   const articlePromises = [];

//   for (let i = 0; i < 1; i++) {
//     const contentPlan = combinedContentPlan[i];
//     const d = articleDates[i];
//     const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

//     if (!contentPlan) continue;

//     const generateArticle = async () => {
//       try {
//         const promptArticle = getArticlePrompt(
//           contentPlan.title,
//           contentPlan.keywords,
//           topicsForArticles[i]
//         );

//         const bodyContent = await fetchArticleContent(promptArticle);
//         if (!bodyContent) return null;

//         setLoadingStage('image-generation');

//         // Важно: здесь modifiedBodyContent — массив PT-блоков
//         const { modifiedBodyContent, images } = await generateImagesForArticle(bodyContent);

//         const slugBase = contentPlan.title.toLowerCase()
//           .replace(/[^a-z0-9]+/g, '-')
//           .replace(/^-+|-+$/g, '');
//         const timestamp = new Date().toISOString();
//         const safeTimestamp = timestamp.replace(/[^a-z0-9]+/gi, '-');
//         const fullSlug = `${slugBase}-${safeTimestamp}`;

//         const cover = images.length > 0
//           ? { image: images[0].image, altText: images[0].altText }
//           : undefined;

//         // Создаём объект для Sanity
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const newPage: any = {
//           _type: 'articlesItem',
//           _id: fullSlug,
//           title: contentPlan.title,
//           slug: { _type: 'slug', current: `/${fullSlug}` },
//           date,
//           contentRaw: modifiedBodyContent, // массив PT-блоков
//           ...(cover ? { coverImage: cover } : {}),
//           seo: {},
//           i18n_lang: 'en',
//         };

//         const createdDoc = await client.create(newPage);

//         const postToStore: PostType = {
//           _id: createdDoc._id,
//           title: createdDoc.title,
//           slug: { current: createdDoc.slug.current },
//           publishedAt: createdDoc.date,
//           image: createdDoc.coverImage ?? null,
//           body: createdDoc.contentRaw,
//         };

//         dispatch(addPost(postToStore));
//         return postToStore;
//       } catch (error) {
//         console.error('❌ Error while generating article:', error);
//         return null;
//       } finally {
//         setLoadingStage('article-generation');
//       }
//     };

//     articlePromises.push(generateArticle());
//   }

//   await Promise.allSettled(articlePromises);
//   setLoading(false);
//   setLoadingStage('done');
// }

// export async function generateContentPlan(
//   posts: PostType[],
//   dispatch: AppDispatch,
//   setLoading: (val: boolean) => void,
//   setLoadingStage: (stage: LoadingStage) => void,
// ) {
//   setLoading(true);
//   setLoadingStage('content-plan');

//   const existingTitles = posts.map(post => post.title);
//   const articleDates = getTuesdaysAndFridaysForNextMonth();

//   const topicsForArticles = Array.from({ length: articleDates.length }, () => {
//     return topics[Math.floor(Math.random() * topics.length)];
//   });

//   const combinedPromptContentPlan = getContentPlanPrompt(
//     topicsForArticles,
//     existingTitles,
//     exampleContentPlan,
//     articleDates
//   );

//   const combinedContentPlan = await fetchContentPlan(combinedPromptContentPlan);

//   if (!combinedContentPlan || !Array.isArray(combinedContentPlan)) {
//     console.error('❌ Failed to fetch combined content plan or result is not an array');
//     setLoading(false);
//     setLoadingStage('done');
//     return;
//   }

//   setLoadingStage('article-generation');

//   const articlePromises = [];

//   for (let i = 0; i < 1; i++) {
//     const contentPlan = combinedContentPlan[i];
//     const d = articleDates[i];
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const day = String(d.getDate()).padStart(2, '0');
//     const date = `${year}-${month}-${day}`;


//     if (!contentPlan) {
//       console.warn(`❌ No content plan found for topic ${topicsForArticles[i]} and date ${date}`);
//       continue;
//     }

//     const generateArticle = async () => {
//       try {
//         const promptArticle = getArticlePrompt(
//           contentPlan.title,
//           contentPlan.keywords,
//           topicsForArticles[i]
//         );
//         const bodyContent = await fetchArticleContent(promptArticle);
//         if (!bodyContent) return null;

//         setLoadingStage("image-generation");

//         const { modifiedBodyContent, images } = await generateImagesForArticle(bodyContent);

//         const slugBase = contentPlan.title.toLowerCase()
//           .replace(/[^a-z0-9]+/g, '-')
//           .replace(/^-+|-+$/g, '');

//         const timestamp = new Date().toISOString();
//         const safeTimestamp = timestamp.replace(/[^a-z0-9]+/gi, '-');

//         const fullSlug = `${slugBase}-${safeTimestamp}`;

//        const cover = images.length > 0
//           ? { image: images[0].image, altText: images[0].altText }
//           : undefined;

//         console.log("modifiedBodyContent: ", modifiedBodyContent);
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const newPage: any = {
//           _type: "articlesItem",
//           title: contentPlan.title,
//           slug: { _type: "slug", current: `/${fullSlug}` },
//           date: date,
//           contentRaw: modifiedBodyContent,       
//           ...(cover ? { coverImage: cover } : {}),
//           seo: {},
//           i18n_lang: "en",
//         };

//         console.log("newPage: ", newPage);

//         const createdDoc = await client.create({
//           ...newPage,
//           _id: fullSlug,
//         });

//         console.log("createdDoc: ", createdDoc);

//         // const createdDoc = await client.create({
//         //   ...newPage,
//         //   _id: `drafts.${fullSlug}`,
//         // });

//         const postToStore: PostType = {
//           _id: createdDoc._id,
//           title: createdDoc.title,
//           slug: { current: createdDoc.slug.current },
//           publishedAt: createdDoc.date,
//           image: createdDoc.coverImage ?? null,
//           body: createdDoc.contentRaw,
//         };

//         dispatch(addPost(postToStore));

//         return postToStore;
//       } catch (error) {
//         console.error('❌ Error while generating article:', error);
//         return null;
//       } finally {
//         setLoadingStage('article-generation');
//       }
//     };

//     articlePromises.push(generateArticle());
//   }

//   await Promise.allSettled(articlePromises);

//   setLoading(false);
//   setLoadingStage('done');
// }

// export async function generateContentPlan(
//   posts: PostType[],
//   dispatch: AppDispatch,
//   setLoading: (val: boolean) => void,
//   setLoadingStage: (stage: LoadingStage) => void,
// ) {
//   setLoading(true);
//   setLoadingStage('content-plan');

//   const existingTitles = posts.map(post => post.title);
//   const articleDates = getTuesdaysAndFridaysForNextMonth();


//   const topicsForArticles = Array.from({ length: articleDates.length }, () => {
//     return topics[Math.floor(Math.random() * topics.length)];
//   });

//   const combinedPromptContentPlan = getContentPlanPrompt(
//     topicsForArticles,
//     existingTitles,
//     exampleContentPlan,
//     articleDates
//   );

//   const combinedContentPlan = await fetchContentPlan(combinedPromptContentPlan);

//   if (!combinedContentPlan || !Array.isArray(combinedContentPlan)) {
//     console.error('❌ Failed to fetch combined content plan or result is not an array');
//     setLoading(false);
//     setLoadingStage('done');
//     return;
//   }

//   setLoadingStage('article-generation');

//   const articlePromises = [];

//   for (let i = 0; i < 1; i++) {
//     const contentPlan = combinedContentPlan[i];
//     const date = articleDates[i].toLocaleDateString('en-CA', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//     }).replace(/\//g, '-');

//     if (!contentPlan) {
//       console.warn(`❌ No content plan found for topic ${topicsForArticles[i]} and date ${date}`);
//       continue;
//     }

//     const generateArticle = async () => {
//       try {
//         const promptArticle = getArticlePrompt(
//           contentPlan.title,
//           contentPlan.keywords,
//           topicsForArticles[i]
//         );
//         const bodyContent = await fetchArticleContent(promptArticle);
//         if (!bodyContent) return null;

//         setLoadingStage('image-generation');

//         const { modifiedBodyContent } = await generateImagesForArticle(bodyContent);

//         const slugBase = contentPlan.title.toLowerCase()
//           .replace(/[^a-z0-9]+/g, '-')
//           .replace(/^-+|-+$/g, '');

//         const timestamp = new Date().toISOString();
//         const safeTimestamp = timestamp.replace(/[^a-z0-9]+/gi, '-');

//         const fullSlug = `${slugBase}-${safeTimestamp}`;

//         const newPost = {
//           _type: 'post',
//           title: contentPlan.title,
//           slug: {
//             _type: 'slug',
//             current: fullSlug,
//           },
//           publishedAt: date,
//           body: modifiedBodyContent,
//           image: null,
//           status: 'Unpublished',
//         };

//         const updatedDoc = await client.create({
//           ...newPost,
//           _id: `drafts.${fullSlug}`,
//         });

//         const postToStore: PostType = {
//           _id: updatedDoc._id,
//           title: updatedDoc.title,
//           slug: { current: updatedDoc.slug.current },
//           publishedAt: updatedDoc.publishedAt,
//           image: updatedDoc.image ?? null,
//           body: updatedDoc.body,
//           status: updatedDoc.status,
//         };

//         dispatch(addPost(postToStore));

//         return postToStore;
//       } catch (error) {
//         console.error('❌ Error while generating article:', error);
//         return null;
//       } finally {
//         setLoadingStage('article-generation');
//       }
//     };

//     articlePromises.push(generateArticle());
//   }

//   await Promise.allSettled(articlePromises);

//   setLoading(false);
//   setLoadingStage('done');
// }

// import { getTuesdaysAndFridaysForNextMonth } from "./dateUtils";
// import { exampleContentPlan, topics } from "./ArticleTemplate";
// import { getContentPlanPrompt } from "@/prompts/contentPlanPrompt";
// import fetchContentPlan from "../../store/thunks/fetchContentPlan";
// import { getArticlePrompt } from "@/prompts/articlePrompt";
// import fetchArticleContent from "../../store/thunks/fetchArticleContent";
// import generateImagesForArticle from "../../store/thunks/generateImagesForArticle";
// import { LoadingStage } from "@/app/componets/ui/loadingIndicator/LoadingIndicator";
// import { AppDispatch } from "../../store";
// import { addPost } from "../../store/reducers/postsSlice";
// import { PostType } from "@/app/componets/ui/postTable/PostTable";

// // Универсальный helper для GraphQL-запросов
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

// export async function generateContentPlan(
//   posts: PostType[],
//   dispatch: AppDispatch,
//   setLoading: (val: boolean) => void,
//   setLoadingStage: (stage: LoadingStage) => void,
// ) {
//   setLoading(true);
//   setLoadingStage('content-plan');

//   const existingTitles = posts.map(post => post.title);
//   const articleDates = getTuesdaysAndFridaysForNextMonth();

//   const topicsForArticles = Array.from({ length: articleDates.length }, () => {
//     return topics[Math.floor(Math.random() * topics.length)];
//   });

//   const combinedPromptContentPlan = getContentPlanPrompt(
//     topicsForArticles,
//     existingTitles,
//     exampleContentPlan,
//     articleDates
//   );

//   const combinedContentPlan = await fetchContentPlan(combinedPromptContentPlan);

//   if (!combinedContentPlan || !Array.isArray(combinedContentPlan)) {
//     console.error('❌ Failed to fetch combined content plan or result is not an array');
//     setLoading(false);
//     setLoadingStage('done');
//     return;
//   }

//   setLoadingStage('article-generation');

//   const articlePromises = [];

//   for (let i = 0; i < 1; i++) {
//     const contentPlan = combinedContentPlan[i];
//     const date = articleDates[i].toLocaleDateString('en-CA', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//     }).replace(/\//g, '-');

//     if (!contentPlan) {
//       console.warn(`❌ No content plan found for topic ${topicsForArticles[i]} and date ${date}`);
//       continue;
//     }

//     const generateArticle = async () => {
//       try {
//         const promptArticle = getArticlePrompt(
//           contentPlan.title,
//           contentPlan.keywords,
//           topicsForArticles[i]
//         );
//         const bodyContent = await fetchArticleContent(promptArticle);
//         if (!bodyContent) return null;

//         setLoadingStage('image-generation');

//         const { modifiedBodyContent } = await generateImagesForArticle(bodyContent);

//         const slugBase = contentPlan.title.toLowerCase()
//           .replace(/[^a-z0-9]+/g, '-')
//           .replace(/^-+|-+$/g, '');

//         const timestamp = new Date().toISOString();
//         const safeTimestamp = timestamp.replace(/[^a-z0-9]+/gi, '-');

//         const fullSlug = `${slugBase}-${safeTimestamp}`;

//         // GraphQL мутация для создания черновика поста
//         const mutation = `
//           mutation CreateDraftPost($input: PostCreateInput!) {
//             createPost(data: $input) {
//               _id
//               title
//               slug { current }
//               publishedAt
//               status
//               bodyRaw
//             }
//           }
//         `;

//         const variables = {
//           input: {
//             _id: `drafts.${fullSlug}`,
//             title: contentPlan.title,
//             slug: { _type: "slug", current: fullSlug },
//             publishedAt: date,
//             body: modifiedBodyContent,
//             image: null,
//             status: "Unpublished"
//           }
//         };

//         const data = await sanityGraphQLRequest(mutation, variables);
//         const createdPost = data.createPost;

//         const postToStore: PostType = {
//           _id: createdPost._id,
//           title: createdPost.title,
//           slug: { current: createdPost.slug.current },
//           publishedAt: createdPost.publishedAt,
//           image: null,
//           body: createdPost.bodyRaw,
//           status: createdPost.status
//         };

//         dispatch(addPost(postToStore));

//         return postToStore;
//       } catch (error) {
//         console.error('❌ Error while generating article:', error);
//         return null;
//       } finally {
//         setLoadingStage('article-generation');
//       }
//     };

//     articlePromises.push(generateArticle());
//   }

//   await Promise.allSettled(articlePromises);

//   setLoading(false);
//   setLoadingStage('done');
// }
