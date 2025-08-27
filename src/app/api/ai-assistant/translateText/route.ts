import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { text, targetLang } = await req.json();

  if (!text || !targetLang) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  try {
    const prompt = `Translate the following text to ${targetLang} without changing formatting:\n\n${text}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    const translation = response.choices[0]?.message?.content;

    return NextResponse.json({ translation });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
