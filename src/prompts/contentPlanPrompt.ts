export const getContentPlanPrompt = (
  topics: string[],
  existingTitles: string[],
  exampleContentPlan: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  articleDates: any
) => `
You are a content planner for a blog about tarot card reading. Create unique titles for posts (not from the list of existing ones) and add 10 relevant keywords in English, taking into account the categories for each article:

${topics.join(', ')}

Create exactly ${articleDates.length} entries. Titles must be unique and non-repetitive.

Output format:
\`\`\`json
[
  {
    "title": "Your unique title here",
    "keywords": "keyword1, keyword2, ..., keyword10"
  },
  ...
]
\`\`\`

If a unique title can't be generated, return:
\`\`\`json
{ "title": "Skipped", "keywords": "Skipped" }
\`\`\`

Example:
${exampleContentPlan}

Be creative and consistent.
`;
