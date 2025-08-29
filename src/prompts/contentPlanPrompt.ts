export const getContentPlanPrompt = (
  topics: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  articleDates: any
) => `
You are a content planner for a blog about tarot card reading. Create unique titles for posts (not from the list of existing ones) and add a description (one sentence, each word with a capital letter, example: "Analyzing How The Lunar Phases Influence Human Behavior And How To Use This Energy To Achieve Goals") and 10 relevant keywords in English, taking into account the categories for each article:

${topics.join(', ')}

Create exactly ${articleDates.length} entries. Titles must be unique and non-repetitive.

Output format:
\`\`\`json
[
  {
    "title": "Your unique title here",
    "description": "Your unique description here",
    "keywords": "keyword1, keyword2, ..., keyword10"
  },
  ...
]
\`\`\`

If a unique title can't be generated, return:
\`\`\`json
{ "title": "Skipped", "description": "Skipped", "keywords": "Skipped" }
\`\`\`

Be creative and consistent.
`;
