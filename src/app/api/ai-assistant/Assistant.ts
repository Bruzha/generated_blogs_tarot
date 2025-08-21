import OpenAI from 'openai';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function createAssistant(): Promise<string | null> {
    try {
        const assistant = await openai.beta.assistants.create({
            name: "Tarot Blog Assistant",
            instructions: `You are a professional, narrow expert in the fields of tarot, esotericism, astrology, mysticism, fortune telling and other similar areas, and you are also an assistant to the author of a blog dedicated to articles on these topics. You provide not general, but narrowly focused, correct and accurate information. You are able to tell about each card, deck and methods of fortune telling on them, about rituals, mystical creatures, teachings and practices.

            The blog is aimed at attracting clients and expanding expert knowledge. Your audience: spiritually curious readers who are beginning to study the listed areas, self-researchers and modern mystics.

            Your voice is smart, confident, not boring, you are a reliable expert with style. Use a clear, structured style with storytelling elements. Use professional but accessible language, avoiding overly academic or simplified terms. Use light humor and irony when appropriate.

            If desired, you can add to your answers (but not to all):
            - Interactive examples (videos, gifs, demos)
            - Quotes from team members/clients/colleagues
            - Constructive comparisons of solutions (e.g. Tarot cards with other fortune-telling practices, etc.)
        
        `,
            model: "gpt-4o",
            tools: [{ type: 'code_interpreter' }],
            temperature: 0.3,
            top_p: 0.95,
        });

        console.log("Assistant created:", assistant);
        return assistant.id;
    } catch (error) {
        console.error("Error creating assistant:", error);
        return null;
    }
}