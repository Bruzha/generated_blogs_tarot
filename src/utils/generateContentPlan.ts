import { getTuesdaysAndFridaysForNextMonth } from "./dateUtils";
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
import { nanoid } from 'nanoid';

export async function generateContentPlan(
  posts: PostType[],
  dispatch: AppDispatch,
  setLoading: (val: boolean) => void,
  setLoadingStage: (stage: LoadingStage) => void
) {
  setLoading(true);
  setLoadingStage('content-plan');

  const articleDates = getTuesdaysAndFridaysForNextMonth();

  const selectedCategories = await selectCategoriesForDates(articleDates);

  if (!selectedCategories || Object.keys(selectedCategories).length === 0) {
    setLoading(false);
    setLoadingStage('initial');
    return;
  }

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

  console.log("categoriesForPrompt: ", categoriesForPrompt);
  const combinedPromptContentPlan = getContentPlanPrompt(categoriesForPrompt, articleDates);

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
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (!contentPlan) continue;

    const generateArticle = async () => {
      try {
        const promptArticle = getArticlePrompt(
          contentPlan.title,
          contentPlan.keywords,
          contentPlan.description,
          categoriesForPrompt[i]
        );

        const bodyContent = await fetchArticleContent(promptArticle);
        if (!bodyContent) return null;
        setLoadingStage('image-generation');

        const { modifiedBodyContent, images } = await generateImagesForArticle(bodyContent);

        const slugBase = contentPlan.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const cover = images.length > 0 ? { image: images[0].image, altText: images[0].altText } : undefined;

        const dateKey = d.toISOString().split('T')[0];
        const categoriesForDate = selectedCategories[dateKey] || [];

        const shortenTitle = (title: string) => (title.length > 60 ? title.substring(0, 57) + '...' : title);

        const breadcrumbsEN = [
          { _key: 'home', _type: 'linkBreadcrumb', label: 'Home', url: '/' },
          { _key: 'articles', _type: 'linkBreadcrumb', label: 'Articles', url: '/articles' },
          { _key: 'article', _type: 'linkBreadcrumb', label: shortenTitle(contentPlan.title), url: `/${slugBase}` }
        ];

        const seoObj = {
          _key: nanoid(),
          _type: 'seo',
          titleTemplate: false,
          title: contentPlan.title,
          description: contentPlan.description,
          keywords: contentPlan.keywords,
          ogType: 'article',
          twitterCard: 'summary_large_image',
          ...(cover ? { image: cover } : {}),
        };


        const enArticle = {
          _type: 'articlesItem',
          _id: `article-${nanoid()}`,
          title: contentPlan.title,
          desc: contentPlan.description,
          slug: { _type: 'slug', current: `/${slugBase}` },
          date,
          ...(cover ? { coverImage: cover } : {}),
          i18n_lang: 'en',
          content: modifiedBodyContent,
          category: categoriesForDate.map((catId: string) => ({
            _key: nanoid(),
            _type: 'reference',
            _ref: catId,
          })),
          seo: seoObj,
          breadcrumbs: breadcrumbsEN
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
              return { _key: nanoid(), _type: 'reference', _ref: cat._id };
            }
            const match = cat.refs?.find(r => r.i18n_lang === lang);
            return { _key: nanoid(), _type: 'reference', _ref: match ? match._id : cat._id };
          });
        };

        const breadcrumbsLabels = {
          ru: { home: 'Главная', articles: 'Статьи' },
          uk: { home: 'Головна', articles: 'Статті' }
        };

        setLoadingStage('create-other-version');
        const languages: ('ru' | 'uk')[] = ['ru', 'uk'];
        const translatedDocs = [];

        for (const lang of languages) {
          const localizedCategories = getLocalizedCategories(lang);

          const translatedData = await translateArticle(
            {
              title: createdEn.title,
              desc: createdEn.desc,
              contentRaw: createdEn.content,
              seo: createdEn.seo,
              coverImage: createdEn.coverImage,
            },
            lang
          );

          const localizedBreadcrumbs = [
            { _key: 'home', _type: 'linkBreadcrumb', label: breadcrumbsLabels[lang].home, url: '/' },
            { _key: 'articles', _type: 'linkBreadcrumb', label: breadcrumbsLabels[lang].articles, url: '/articles' },
            { _key: 'article', _type: 'linkBreadcrumb', label: shortenTitle(translatedData.title), url: `/${slugBase}-${lang}` }
          ];

          const doc = {
            _id: `${createdEn._id}__i18n_${lang}`,
            _type: 'articlesItem',
            title: translatedData.title,
            desc: translatedData.desc,
            slug: { _type: 'slug', current: `/${slugBase}-${lang}` },
            date: createdEn.date,
            content: translatedData.contentRaw,
            coverImage: translatedData.coverImage,
            seo: translatedData.seo,
            i18n_lang: lang,
            i18n_base: { _type: 'reference', _ref: createdEn._id },
            category: localizedCategories,
            breadcrumbs: localizedBreadcrumbs
          };

          const createdDoc = await client.create(doc);
          translatedDocs.push(createdDoc);
        }

        const allRefs = [createdEn, ...translatedDocs].map(d => ({ _type: 'reference', _ref: d._id }));

        await client.patch(createdEn._id).set({ i18n_refs: allRefs }).commit();
        for (const doc of translatedDocs) {
          await client.patch(doc._id).set({ i18n_refs: allRefs }).commit();
        }

        const postToStore: PostType = {
          _id: createdEn._id,
          title: createdEn.title,
          desc: createdEn.desc,
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


