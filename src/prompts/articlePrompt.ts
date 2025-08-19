// export const getArticlePrompt = (title: string, keywords: string, topic: string) => `
// You are a professional blog article writer for the CROCODE Lab blog, targeting an audience of D2C brands, Shopify users, and tech-savvy marketers in the EU.

// Your task is to write an informative, SEO-friendly, **engaging** article in English based on:

// - **Title**: ${title}
// - **Topic**: ${topic}
// - **Target Keywords**: ${keywords}

// ### Article Requirements (use creatively, not rigidly):

// 1. **Introduction**  
//    - 2–3 short paragraphs  
//    - Grab attention with a story, surprising fact, or real-world scenario related to the topic  
//    - Clearly introduce the problem or opportunity

// 2. **Main Content**  
//    - Use clear **H2** and **H3** subheadings  

//    - Include elements that naturally fit into the topic (choose 1-3 of the following options, you can add your own): 
//     - lists
//     - use cases
//     - internal quotes
//     - infographics
//     - mini-cases
//     - FAQ
//     - comparative tables
//     - mini-interview (can be with a fictitious specialist, but it should look natural)
//     - problem → reason → solution
//     - advantages/disadvantages (can also be in tabular form)
//     - common user problems
//     - action plan
//     - etc. 
//     Feel free to experiment with content elements, add your own

//   - Additional design that may be useful to choose from: tables, numbered and/or bullet lists, icons and  emoji (for example: ❌, ✅, ✔️, ❗, ❓, ❕, ❔, 🏷️, etc.), color blocks, dividers, frames, etc.

//    - Add (anywhere in the article) one image using:
//     \`<img src="" data-image-description="[IMAGE: detailed description related to ${topic} and ${title}]" alt="alt text">\`
//     It is desirable that the image description also contain the following parts:
//     - the main subject of the image, it can be a person, animal, object, room, interior, laptop screen, etc.
//     - key features of the main subject
//     - background and environment
//     - color and mood
//     - emphasis - what should be focused on in the image
//     For example: "a young male programmer with glasses, short dark hair, blue eyes, light stubble and a knitted yellow sweater sits at a table with a black laptop, half sideways to the viewer. He is in a productive, inspired atmosphere and a positive mood. He is relaxed and with a joyful smile on his face, typing on the laptop." Be original and creative when describing, don't repeat yourself.
//     If you are describing a person or object with important anatomy/device (hands, face, laptop screen), it is better to explicitly state:
//       - "highly detailed realistic human face, natural hand position, correct anatomy, normal proportions"
//       - "laptop screen turned away from the viewer"
//       - "hands with five fingers, realistic joint position"
//     If the description mentions a laptop or computer, then you need to describe its position in relation to the viewer (for example, "the laptop is turned away from the viewer, its back side is black with the Apple logo")

// 3. **Conclusion**  
//    - Summarize main takeaways or offer a practical next step  
//    - Optionally include a CTA (e.g., contact CROCODE, explore a related service)

// 4. **SEO Blocks**  
//    - Use the target keywords in:
//      - Headings (H1–H3)
//      - The first 100 words
//      - Alt tags for images: SEO-optimized alternative text that accurately describes the image based on ${topic}, ${keywords}, and ${title} up to 125 characters long, helps search engines and ensures accessibility. Example: "alt="Apple MacBook laptop on a wooden table by the window - home office for freelance"" (Keywords: laptop, Apple MacBook, home office, freelance. Specifics (where it is, what context. Up to 125 characters)
//      - Meta title (max 60 chars)
//      - Meta description (max 160 chars)
//      - Internal links (2–4) to relevant CROCODE blog pages

//    - Text uniqueness ≥ 95%
//    - Avoid over-optimization (write naturally)

// 5. **Optional creativity**
//    - Feel free to slightly vary the structure across articles
//    - Use analogies, light humor, or original formatting elements (e.g. code snippets, short dialogues) if it adds clarity or engagement

// You may optionally reference or link to relevant CROCODE pages (0–2 links total), if it fits naturally:
// - https://crocodelab.com/
// - https://crocodelab.com/shopify-development/
// - https://crocodelab.com/blog/
// - https://crocodelab.com/our-services/
// - https://crocodelab.com/cases/
// - https://crocodelab.com/contact-us/
// ... (etc.)

// Avoid sounding like an ad. Your tone is confident, smart, lightly ironic when appropriate — like an expert sharing insights at a professional meetup.

// Use this example **HTML formatting style** (but adapt it where useful):

// <style>
//   body {
//     font-family: sans-serif;
//     line-height: 1.6;
//     margin: 20px;
//   }
//   h1, h2, h3 {
//     color: #333;
//     margin-top: 40px;
//     font-weight: bold;
//   }
//   h2, h3 {
//     margin-bottom: 40px;
//   }
//   h2 { font-size: 20px; }
//   h3 { font-size: 18px; }
//   img {
//     max-width: 100%;
//     height: auto;
//     display: block;
//     margin: 10px 0;
//   }
//   .cta-button {
//     background-color: #007bff;
//     color: white;
//     padding: 10px 20px;
//     text-decoration: none;
//     border-radius: 5px;
//     display: inline-block;
//     margin-top: 10px;
//   }
//   .internal-link {
//     color: #007bff;
//     text-decoration: none;
//   }
//   p { margin-bottom: 20px; }
// </style>

// Do **not** start with the article title. Begin with the intro.

// Your output must start with \`<!DOCTYPE html>\` and end with \`</html>\`, with no other content before or after. Respond in HTML-only text.
// `;

export const getArticlePrompt = (title: string, keywords: string, topic: string) => `
You are a professional blog article writer for the CROCODE Lab blog. Your audience: D2C brands, Shopify users, and tech-savvy marketers in the EU.

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

   - Include 1 image:
     \`<img src="" data-image-description="[IMAGE: detailed description about ${topic} and ${title}]" alt="...">\`
     - Be creative and specific: describe subject, features, background, mood, and image focus
     - For faces, hands, screens — ensure correct anatomy or positioning

3. **Conclusion**
   - Summarize key takeaways or next step
   - Optional CTA (e.g., contact CROCODE)

4. **SEO**
   - Use keywords in:
     - Headings, first 100 words
     - Alt text (≤125 chars)
     - Meta title (≤60 chars)
     - Meta description (≤160 chars)
     - Internal links to CROCODE pages (2–4 max)
   - Ensure 95%+ uniqueness
   - Write naturally (no keyword stuffing)

5. **Creativity**
   - Feel free to vary structure across articles
   - Light humor, analogies, code snippets, or mini-dialogues welcome if helpful

Reference links (0–2 if natural):
- https://crocodelab.com/
- https://crocodelab.com/shopify-development/
- https://crocodelab.com/blog/
- https://crocodelab.com/our-services/
- https://crocodelab.com/cases/
- https://crocodelab.com/contact-us/

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
