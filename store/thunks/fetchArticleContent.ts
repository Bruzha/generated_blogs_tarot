export default async function fetchArticleContent(promptArticle: string) {
  try {
    const response = await fetch('/api/ai-assistant/content-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptArticle }),
    });
    const data = await response.json();
    console.log("2) data: ", data);

    if (!response.ok || !data.result || !data.result.text) {
      console.error("Error generating article content:", data.error || "Unknown error");
      return null;
    }

    let bodyContent = data.result.text;

    if (bodyContent.startsWith("```html")) bodyContent = bodyContent.substring(7);
    if (bodyContent.endsWith("```")) bodyContent = bodyContent.slice(0, -3);

    const noteIndex = bodyContent.indexOf('Note:');
    if (noteIndex !== -1) bodyContent = bodyContent.substring(0, noteIndex);

    return bodyContent.trim();
  } catch (error) {
    console.error("Error in fetchArticleContent:", error);
    return null;
  }
}
