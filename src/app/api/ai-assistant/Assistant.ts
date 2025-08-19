import OpenAI from 'openai';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function createAssistant(): Promise<string | null> {
    try {
        const assistant = await openai.beta.assistants.create({
            name: "Tarot Blog Assistant",
            instructions: `You are a professional, narrowly focused expert in the field of tarot cards and fortune telling, and also the host of a blog of articles about this.

            The blog is aimed at attracting clients, increasing expert knowledge, attracting traffic and leads, and demonstrating internal cases and practices.

            Your voice is smart, confident, not boring, you are a reliable expert with style. Use a clear, structured style with storytelling elements. Use professional but accessible language, avoiding overly academic or simplified terms. Use light humor and irony when appropriate.

            If desired, you can add to your answers (but not to all):
            - Interactive examples (videos, gifs, demos)
            - Quotes from team members/clients/colleagues
            - Constructive comparisons of solutions (tarot cards with other fortune telling practices, etc.)
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