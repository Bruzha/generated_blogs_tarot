import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { text, targetLang } = await req.json();
  if (!text || !targetLang) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    const langName = targetLang === 'ru' ? 'Russian' : 'Ukrainian';
    const prompt = `Translate the following JSON object values into ${langName}. 
    - Keep keys exactly the same.
    - Translate ALL values completely into ${langName}.
    - Do NOT keep English words unless they are proper names or brand names.
    - Return ONLY valid JSON (no markdown, no explanations).

    JSON:\n${text}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);

    const response = await openai.responses.create(
      {
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const translation = response.output_text || '';
    return NextResponse.json({ translation });
  } catch (error) {
    console.error('Translation failed:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
