// export const getArticlePrompt = (title: string, keywords: string, topic: string) => `
// You are a content planner for a tarot card reading blog. Your audience: spiritually curious readers, beginners learning tarot, self-explorers, and modern mystics.

// Write an engaging, SEO-friendly article in English using:

// - **Title**: ${title}
// - **Topic**: ${topic}
// - **Keywords**: ${keywords}

// ### Article structure:
 
// 1. **Introduction**
//    - 2–3 short paragraphs
//    - Hook the reader: story, fact, or scenario
//    - Clearly introduce the topic's value

// 2. **Main content**
//    - Use **H2** and **H3** subheadings
//    - Add 1–3 content elements (e.g.):
//      - lists, use cases, quotes, tables, mini-cases, FAQ, pros/cons, action plans, etc.
//    - Add any useful design elements (e.g. tables, bullet points, emoji, blocks)

//    - Add 1 image at the beginning of the article:
//      \`<img src="" data-image-description="[IMAGE: detailed description about ${topic} and ${title}]" alt="...">\`
//      - Be creative and specific: describe subject, features, background, mood, and image focus
//      - For faces, hands — ensure correct anatomy or positioning
//      - The description must not violate the rules of Flux generation
//      - If tarot cards are mentioned, it is necessary to indicate in detail where they are, how they are laid out (front or back of each card), how many there are, what they are specifically from the deck (list and name them, for example "The Fool"). Be as specific as possible with the cards. Card names must be in quotation marks.

// 3. **Conclusion**
//    - Summarize key takeaways or next step
//    - Optional CTA

// 4. **SEO**
//    - Use keywords in:
//      - Headings, first 100 words
//      - Alt text (≤125 chars)
//      - Meta title (≤60 chars)
//      - Meta description (≤160 chars)
//    - Ensure 95%+ uniqueness
//    - Write naturally (no keyword stuffing)

// 5. **Creativity**
//    - Feel free to vary structure across articles
//    - Light humor, analogies or mini-dialogues welcome if helpful

// Tone: confident, smart, lightly ironic — like sharing insights with peers.

// Use this basic **HTML formatting** (adapt if needed):

// <style>
//   body { font-family: sans-serif; line-height: 1.6; margin: 20px; }
//   h1, h2, h3 { color: #333; margin-top: 40px; font-weight: bold; }
//   h2 { font-size: 20px; margin-bottom: 40px; }
//   h3 { font-size: 18px; margin-bottom: 40px; }
//   img { max-width: 100%; height: auto; margin: 10px 0; display: block; }
//   .cta-button { background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px; text-decoration: none; }
//   .internal-link { color: #007bff; text-decoration: none; }
//   p { margin-bottom: 20px; }
// </style>

// Start output with \`<!DOCTYPE html>\`, end with \`</html>\`. Return only raw HTML.
// `;

export const getArticlePrompt = (title: string, keywords: string, topic: string) => `
You are a content planner for a tarot card reading blog. Your audience: spiritually curious readers, beginners learning tarot, self-explorers, and modern mystics.

Write an engaging, SEO-friendly article in **Sanity Portable Text format** (JSON array of blocks) using:

- **Title**: ${title}
- **Topic**: ${topic}
- **Keywords**: ${keywords}

### Article structure:

1. **Introduction**
   - 2–3 short paragraphs
   - Hook the reader: story, fact, or scenario
   - Clearly introduce the topic's value

2. **Main content**
   - Use **H2** and **H3** as block styles:
     - For H2: \`"style": "h2"\`
     - For H3: \`"style": "h3"\`
   - Add 1–3 content elements:
     - lists (\`"_type": "list"\`), use cases, quotes (\`"style": "blockquote"\`), FAQ, pros/cons, action plans, etc.
   - Add any useful design elements as Portable Text blocks

   - Add 1 image as a block:
     \`\`\`
     {
       "_type": "image",
       "alt": "...",
       "dataImageDescription": "[IMAGE: detailed description about ${topic} and ${title}]"
     }
     \`\`\`
     - Be creative and specific: describe subject, features, background, mood, and image focus
     - For faces, hands — ensure correct anatomy or positioning
     - The description must not violate the rules of Flux generation
     - If tarot cards are mentioned, include specific cards in quotation marks (e.g. "The Fool"), layout details (front/back, order). Similarly, work with constellations, zodiac signs, if any.

3. **Conclusion**
   - Summarize key takeaways or next step
   - Optional CTA as a paragraph block

4. **SEO**
   - Use keywords in:
     - Headings, first paragraph
     - Image alt text (≤125 chars)
     - Meta title (≤60 chars) and Meta description (≤160 chars) **as separate fields at the end**:
       \`\`\`
       {
         "seoTitle": "...",
         "seoDescription": "..."
       }
       \`\`\`
   - Ensure 95%+ uniqueness
   - Write naturally (no keyword stuffing)

5. **Creativity**
   - Feel free to vary structure across articles
   - Light humor, analogies, or mini-dialogues welcome if helpful

### **Output format:**
Return ONLY a valid JSON array of Portable Text blocks for Sanity.
- Each object must have:
  - "_type": "block" or "image"
  - "_key": unique string
  - "style": "normal" | "h2" | "h3" | "blockquote" (for text blocks)
  - "children": array of {_type: "span", "text": "...", "marks": []} (for text blocks)
  - "alt" (for image blocks)
Do NOT include any SEO fields or metadata in this array.
Return NOTHING else. The array must be valid JSON and parseable with JSON.parse(). Each text block:
\`\`\`json
{
  "_type": "block",
  "style": "normal" | "h2" | "h3" | "blockquote",
  "children": [
    {
      "_type": "span",
      "text": "Your text here",
      "marks": []
    }
  ]
}
\`\`\`
For lists:
\`\`\`json
{
  "_type": "list",
  "style": "bullet" | "number",
  "children": [ { "_type": "block", ... } ]
}
\`\`\`
For image:
\`\`\`json
{
  "_type": "image",
  "alt": "Alt text here",
  "dataImageDescription": "[IMAGE: ...]"
}
\`\`\`
At the end, add an object with meta info:
\`\`\`json
{
  "seoTitle": "SEO Title",
  "seoDescription": "SEO Description"
}
\`\`\`
`;
