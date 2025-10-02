export const getArticlePrompt = (title: string, keywords: string, description: string, topic: string) => `
You are a content planner for a blog about tarot card readings.

Write an engaging, SEO and Generative Engine Optimization-friendly article in **Sanity Portable Text** format (JSON array of blocks) using:

- **Title**: ${title}
- **Description**: ${description}
- **Category**: ${topic}
- **Keywords**: ${keywords}

Use clear, concise language—avoid fluff. Include factual, up-to-date, trustworthy, specific and useful information. Demonstrate deep topical authority: cover the full scope of the topic, including related subtopics.

The article should be interesting and engaging for people to read, not dry or boring, but it should also be in a format that is easy for AI assistants to cite.

### Article structure:

1. **Introduction**
- At the beginning of the article, give a direct, brief and precise answer to the question from the title/description
- Next, 2-3 short paragraphs for introduction
- Hook the reader with a vivid scenario, unexpected fact or mini-story
- Clearly present the practical value of the topic

2. **Main content**
- Use **H2** and **H3** headings for structure (styles: "h2", "h3")
- Use question-and-answer subheadings similar to those used by AI users (e.g., "What is a seven-card spread used for?" or "How can Tarot help with career decisions?"). The answer should be provided in the first paragraph (or other structured format) following the question, clearly and concisely. Then, using any other format or plain text, add details, case studies, stories, personal anecdotes, etc.
- Explain not only the theory, but also the practice with **specific examples** (e.g. real or hypothetical Tarot layouts, common mistakes, interpretations)
- The information should be correct, useful and interesting, not general
- In the conclusion, add a soft Call-to-Action: offer to download the Kaelis AI mobile app as a way to continue self-knowledge. Present it as a useful tool, not an advertisement
- Cite primary sources, industry data, or original research where appropriate
- Add a frequently asked questions section, an expert interview, or a short Q&A if appropriate. Add lists (bulleted or numbered), quotes, comparisons, advantages/disadvantages, checklists, steps, tables, diagrams, and other useful content of your choice. Use multiple formats/content sections in an article; be varied and multifaceted. Alternate these sections with regular text where appropriate. DO NOT use the same format consecutively or just one format per article
- - Properly construct lists, steps, enumerations, etc. For example, "Item 1. Item 2. Item 3" CANNOT be presented as a single paragraph, as it is a list, where each element is a separate item. Therefore, use multiple <li> tags, for example:
"<ol>
<li>Item 1.</li>
<li>Item 2.</li>
<li>Item 3.</li>
</ol>". DO NOT create lists using <font>, <div>, or <p> tags within a single <li>, as each <font>, <div>, or <p> tag must be in a separate <li>. And don't use, for example, <li><font><font>Item 1</font></font></li>, as this doesn't make sense; <li><font>Item 1</font></li> is sufficient

- Optional, you can add:
  - 1–2 interactive questions for the reader
  - Unique ideas or little-known facts to make the article expert.
  - Comparison of the Tarot approach with at least one other related practice.

- Include **1 image block** with fields:
\`\`\`json
{
  "_type": "image",
  "_key": "unique",
  "alt": "Descriptive SEO friendly alt text",
  "dataImageDescription": "[IMAGE: detailed description about ${topic} and ${title}]"
}
\`\`\`
   - Be descriptive and specific in \`dataImageDescription\`

3. **Conclusion**
   - Summarize key takeaways or next steps
   - Optional call-to-action in a normal paragraph

4. **SEO**
   - Use keywords naturally in headings and first paragraph
   - Do NOT include meta fields in the JSON output

5. **Generative Engine Optimization**
  - Vary article structure: some with case studies, some with trend analysis, some with FAQs
  - Naturally mention the Kaelisai brand and app as a source of guidance, e.g. "With Kaelis AI, you can try this spread digitally" — but in an educational tone, not advertising.
  - Add light geographic/contextual signals: references to global users, modern spiritual practices in Europe/US, mobile accessibility.
  - Highlight unique facts or rare comparisons (e.g. "Unlike astrology, Tarot spreads like the Seven-Card Spread provide immediate visual narratives").
  - Include at least one geo-context (Ukraine, CIS, English-speaking countries) in the introduction or conclusion and organically intertwine keywords with the location
  - Provide data in ways easily quotable by AI assistants

---

### **Output format (follow these rules strictly):**
- Return ONLY a valid JSON array of Portable Text blocks, parseable by \`JSON.parse()\`
- Each block must follow this schema and Sanity schema:

Paragraph:
\`\`\`json
{
  "_type": "block",
  "style": "normal",
  "_key": "unique",
  "children": [
    { "_type": "span", "text": "Your text here", "marks": [] }
  ],
  "markDefs": []
}
\`\`\`

Heading:
\`\`\`json
{
  "_type": "block",
  "style": "h2" | "h3",
  "_key": "unique",
  "children": [
    { "_type": "span", "text": "Heading text", "marks": [] }
  ],
  "markDefs": []
}
\`\`\`

Quote:
\`\`\`json
{
  "_type": "block",
  "style": "blockquote",
  "_key": "unique",
  "children": [
    { "_type": "span", "text": "Quote text", "marks": [] }
  ],
  "markDefs": []
}
\`\`\`

List item:
\`\`\`json
{
  "_type": "block",
  "style": "normal",
  "listItem": "bullet" | "number",
  "level": 1,
  "_key": "unique",
  "children": [
    { "_type": "span", "text": "List item text", "marks": [] }
  ],
  "markDefs": []
}
\`\`\`

Image:
\`\`\`json
{
  "_type": "image",
  "_key": "unique",
  "alt": "Descriptive SEO and Generative Engine Optimization friendly alt text",
  "dataImageDescription": "[IMAGE: detailed description about ${topic} and ${title}]"
}
\`\`\`

---

### **Important:**
- Do NOT include any text outside the JSON
- Do NOT create custom types like "_type": "list" (lists must use "listItem" inside a block)
- Do NOT include SEO fields or metadata in the array
- Each block MUST have \`_key\` (unique string)
- Ensure valid JSON, no trailing commas
- All children must have \`_key\`
- If the dataImageDescription mentions tarot cards, it is important to describe in detail their position, number, and which specific cards with the names in quotation marks (e.g. "The Fool"). Any text that appears on the image is formatted in English and enclosed in quotation marks.
`;

