import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getAllTarotCards } from "../getTarotCardsList";
import { getAllArticleTitles } from "../getAllArticleTitles";
import { getSanityContentSchema } from "../getSanityContentSchema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "getCurrentDate",
          description: "Returns today's date in YYYY-MM-DD format",
          parameters: { type: "object", properties: {} },
        },
      },
      {
        type: "function",
        function: {
          name: "getTarotCards",
          description: "Returns the list of tarot cards",
          parameters: { type: "object", properties: {} },
        },
      },
      {
        type: "function",
        function: {
          name: "getExistingArticleTitles",
          description: "Returns a list of existing article titles",
          parameters: { type: "object", properties: {} },
        },
      },
      {
        type: "function",
        function: {
          name: "getSanityContentSchema",
          description: "Returns the Sanity content schema",
          parameters: { type: "object", properties: {} },
        },
      },
    ];

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a professional, narrow specialist in the field of Tarot and layouts, esotericism and practices, astrology, numerology and teaching all of the above, as well as the author of a blog for kaelisai.com dedicated to articles on these topics. You provide not general, but narrowly focused, correct and accurate information. Do not be afraid to consider specific cases in answers, teach and explain specific practices, layouts, etc.

The blog is aimed at attracting clients and expanding expert knowledge, increasing cognitive ability and interest in the topics above. Your audience: spiritually inquisitive readers, professionals, practitioners and those beginning to study the listed areas and looking for answers to questions on them, self-researchers and modern mystics.

Your voice is smart, confident, interesting, friendly, you are a reliable expert with style. Use a clear, structured style with elements of storytelling. Use professional but accessible language, avoiding overly academic or simplified terms. Use light humor and irony when appropriate. If desired, you can add to your answers:
- Quotes from team members/clients/colleagues
- Stories and case studies as examples
- Consideration of specific cases
- Educational elements, rare facts, analysis of controversial topics
- Constructive comparisons of solutions (e.g., Tarot cards with other divination practices, etc.)

Answers should be useful, not just general information, can be used for training and learning for beginners, answer both frequent and rare questions in the specified areas.`,
      },
      { role: "user", content: prompt },
    ];

    let hasMoreToolCalls = true;
    let finalResponse = "";

    while (hasMoreToolCalls) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        tools,
        tool_choice: "auto",
        temperature: 0.4,
        top_p: 0.95,
      });

      const message = completion.choices[0].message;
      const toolCalls = message.tool_calls || [];

      if (toolCalls.length > 0) {
        messages.push(message);

        const toolResponses: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

        for (const toolCall of toolCalls) {
          if (toolCall.type === "function") {
            const { name } = toolCall.function;
            let result: unknown = {};

            if (name === "getCurrentDate") {
              result = { date: new Date().toISOString().split("T")[0] };
            } else if (name === "getExistingArticleTitles") {
              result = { titles: await getAllArticleTitles() };
            } else if (name === "getTarotCards") {
              result = { titles: await getAllTarotCards() };
            } else if (name === "getSanityContentSchema") {
              result = { schema: await getSanityContentSchema() };
            } else {
              result = { error: "Unknown function" };
            }

            toolResponses.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            });
          }
        }

        // ✅ Теперь добавляем tool-ответы
        messages.push(...toolResponses);
      } else {
        finalResponse = message.content || "";
        hasMoreToolCalls = false;
      }
    }

    return NextResponse.json({ result: { text: finalResponse } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Error in AI route:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
