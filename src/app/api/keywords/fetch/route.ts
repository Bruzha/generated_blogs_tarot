import { NextRequest, NextResponse } from 'next/server';
import fetchKeywordsDataForSEO, { Keyword } from '@/utils/fetchKeywordsForCategory';

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query) return NextResponse.json({ error: 'No query provided' }, { status: 400 });

  try {
    const keywords: Keyword[] = await fetchKeywordsDataForSEO(query);
    return NextResponse.json({ keywords });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
