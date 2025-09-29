// src/prompts/contentPlanPrompt.ts
export const getContentPlanPrompt = (
  topics: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  articleDates: any,
  keywordPool: { word: string; weight: number }[]
) => {const formattedKeywords = keywordPool
    .map(k => `${k.word} (${k.weight.toFixed(2)})`)
    .join(", ");

  return `
You are a content planner for a blog about tarot card reading.  You are given a list of categories and a pool of keywords, each with an importance weight:
${formattedKeywords}


Your task is to generate unique titles and descriptions for each article depending on its category and keywords in English. You should:
- DO NOT generate keywords, use only those passed in as input.
- Select keywords (1 main and 4-5 additional) from the provided set that are suitable for each article and its category.
- Prefer keywords with higher weight, especially as the main keyword in the title.
- Make sure that articles do not have completely identical sets of keywords.
- Include the main keyword (most important) in the title.
- Include the main and additional keywords (not necessarily all) in a natural way in the description.
- Create unique, engaging titles.
- Where possible, phrase titles or/and descriptions as answers to common AI user queries (e.g. "What does The Fool card mean in career? [Answer]").
- Use questions/answers that match typical user intent for AI tools (how, why, best practices, comparisons).
- Avoid duplicate patterns: vary between case studies, trend reports, practical guides, and FAQ-style posts.
- Generate exactly ${articleDates.length} articles in this order: ${topics.join(', ')}.

Output format:
\`\`\`json
[
  {
    "title": "Your unique title here",
    "description": "Your unique description here",
    "keywords": "keyword1, keyword2, ..., keyword5"
  }, 
  ...
]
\`\`\`

If a unique title can't be generated, return:
\`\`\`json
{ "title": "Skipped", "description": "Skipped", "keywords": "Skipped" }
\`\`\`

Be creative, fact-based, consistent, and optimized both for SEO and Generative Engine Optimization.
`;
};