export const getArticlePrompt = (title: string, keywords: string, topic: string) => `
You are a content planner for a tarot card reading blog. Your audience: spiritually curious readers, beginners learning tarot, self-explorers, and modern mystics.

Write an engaging, SEO-friendly article in **Sanity Portable Text format** (JSON array of blocks) using:

- **Title**: ${title}
- **Category/s**: ${topic}
- **Keywords**: ${keywords}

### Article structure:

1. Introduction
   - 2–3 short paragraphs
   - Hook the reader: story, fact, or scenario
   - Clearly introduce the topic's value

2. Main content
   - Use only styles, marks, and block types defined in this Sanity schema. Follow this schema strictly.
   - Use **H2** and **H3** as block styles
   - Add 1–3 content elements: lists, quotes, use cases, FAQ, pros/cons, action plans
   - Include 1 image as a block:
\`\`\`json
{
  "_type": "image",
  "alt": "Descriptive alt text",
  "dataImageDescription": "[IMAGE: detailed description about ${topic} and ${title}]",
  "_key": "unique-string"
}
\`\`\`

3. Conclusion
   - Summarize key takeaways or next steps
   - Optional CTA as a paragraph block

4. SEO (do not include inside Portable Text blocks)
   - Meta title (≤60 chars) and Meta description (≤160 chars)
   - Use keywords naturally

### Output format:
Return ONLY a valid JSON array of Portable Text blocks.
- Each block must follow the schema above
- Each text block:
\`\`\`json
{
  "_type": "block",
  "style": "normal" | "h2" | "h3" | "blockquote",
  "_key": "unique-string",
  "children": [
    { "_type": "span", "text": "Your text here", "marks": [] }
  ]
}
\`\`\`
- Lists:
\`\`\`json
{
  "_type": "list",
  "style": "bullet" | "number",
  "children": [ { "_type": "block", ... } ]
}
\`\`\`
- Images must have _type: "image", alt, dataImageDescription, and unique _key
- Do not include SEO fields or metadata inside Portable Text array
- Return nothing else
- JSON must be parseable by JSON.parse()
`;

