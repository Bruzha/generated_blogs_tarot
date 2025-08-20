export const getArticlePrompt = (title: string, keywords: string, topic: string) => `
You are a content planner for a tarot card reading blog. Your audience: spiritually curious readers, beginners learning tarot, self-explorers, and modern mystics.

Write an engaging, SEO-friendly article in English using:

- **Title**: ${title}
- **Topic**: ${topic}
- **Keywords**: ${keywords}

### Article structure:

1. **Introduction**
   - 2–3 short paragraphs
   - Hook the reader: story, fact, or scenario
   - Clearly introduce the topic's value

2. **Main content**
   - Use **H2** and **H3** subheadings
   - Add 1–3 content elements (e.g.):
     - lists, use cases, quotes, tables, mini-cases, FAQ, pros/cons, action plans, etc.
   - Add any useful design elements (e.g. tables, bullet points, emoji, blocks)

   - Add 1 image at the beginning of the article:
     \`<img src="" data-image-description="[IMAGE: detailed description about ${topic} and ${title}]" alt="...">\`
     - Be creative and specific: describe subject, features, background, mood, and image focus
     - For faces, hands — ensure correct anatomy or positioning
     - The description must not violate the rules of Flux generation

3. **Conclusion**
   - Summarize key takeaways or next step
   - Optional CTA

4. **SEO**
   - Use keywords in:
     - Headings, first 100 words
     - Alt text (≤125 chars)
     - Meta title (≤60 chars)
     - Meta description (≤160 chars)
   - Ensure 95%+ uniqueness
   - Write naturally (no keyword stuffing)

5. **Creativity**
   - Feel free to vary structure across articles
   - Light humor, analogies, code snippets, or mini-dialogues welcome if helpful

Tone: confident, smart, lightly ironic — like sharing insights with peers.

Use this basic **HTML formatting** (adapt if needed):

<style>
  body { font-family: sans-serif; line-height: 1.6; margin: 20px; }
  h1, h2, h3 { color: #333; margin-top: 40px; font-weight: bold; }
  h2 { font-size: 20px; margin-bottom: 40px; }
  h3 { font-size: 18px; margin-bottom: 40px; }
  img { max-width: 100%; height: auto; margin: 10px 0; display: block; }
  .cta-button { background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px; text-decoration: none; }
  .internal-link { color: #007bff; text-decoration: none; }
  p { margin-bottom: 20px; }
</style>

Start output with \`<!DOCTYPE html>\`, end with \`</html>\`. Return only raw HTML.
`;
