export const getContentPlanPrompt = (
  topics: string[],
  existingTitles: string[],
  exampleContentPlan: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  articleDates: any
) => `
You are a content planner for a tarot card reading blog. Generate unique blog post titles (not in the list of existing ones) and 10 relevant keywords in English for each of the following topics:

${topics.join(', ')}

Create exactly ${articleDates.length} entries. Titles must be **unique** and **non-repetitive**.

Avoid using these existing titles: ${existingTitles.slice(0, 30).join(', ')}${existingTitles.length > 30 ? ', ...' : ''}

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
