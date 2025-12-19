import { NextResponse } from 'next/server';
import { Index } from '@upstash/vector';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 30; // requests per window
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const MAX_QUESTION_LENGTH = 500; // characters

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { question, centre } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Input length validation
    if (typeof question !== 'string' || question.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json(
        { error: `Question must be a string with maximum ${MAX_QUESTION_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Query vector database
    const results = await index.query({
      data: question,
      topK: 10,
      includeMetadata: true,
    });

    console.log('All results count:', results?.length || 0);

    // Filter results by centre on the client side since GLOB doesn't work
    // Include both centre-specific AND general information
    let filteredResults = results;
    if (centre && centre !== 'all') {
      console.log('First 5 result IDs:', results.slice(0, 5).map((r: any) => r.id));
      filteredResults = results.filter((r: any) =>
        r.id?.startsWith(`${centre}-`) || r.id?.startsWith('general-')
      );
      console.log(`Filtered to ${filteredResults.length} results for ${centre} (including general info)`);
    }

    // Take top 3 after filtering
    filteredResults = filteredResults.slice(0, 3);

    if (!filteredResults || filteredResults.length === 0) {
      return NextResponse.json({
        answer: centre && centre !== 'all'
          ? `I don't have specific information about that for ${centre}.`
          : "I don't have specific information about that topic.",
      });
    }

    // Extract relevant content
    const context = filteredResults
      .map((result: any) => {
        const metadata = result.metadata || {};
        const title = metadata.title || 'Information';
        const content = metadata.content || '';
        return `${title}: ${content}`;
      })
      .join('\n\n');

    // Generate response with Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a helpful leisure centre assistant. Answer questions about facilities, memberships, classes, and policies in a friendly, professional manner. Use the provided context to give accurate, specific answers.

FORMATTING RULES - VERY IMPORTANT:
- When listing multiple items (classes, pools, facilities, etc.), put each item on its own line
- DO NOT use bullet points, dashes, asterisks, or numbers
- DO NOT write lists in paragraph form (e.g., "we have a 50m pool, 25m pool, and leisure pool")
- Instead, put each item on a separate line with proper spacing
- Keep text natural and conversational

EXAMPLE - CORRECT FORMATTING:

Q: What group fitness classes do you offer?
A: Whitlam Leisure Centre offers a wide range of group fitness classes to cater to different fitness levels and interests. Our group exercise studios feature programs from Les Mills, including

GRIT
SHAPES
BODYCOMBAT
CORE
BODYATTACK
BODYPUMP
BODYBALANCE

Additionally, we have a dedicated HIIT Zone with qualified Personal Trainer-led classes. Our Wellness Studio is specifically designed for yoga and pilates classes.

Please check our timetable for the full schedule and to book your spot in the class of your choice.

Q: Tell me about the pools
A: Auburn Ruth has three pools available:

50m Pool
Temperature: 26-27°C

25m Pool
Temperature: 28-29°C

Leisure Pool
Temperature: 28-29°C
Features beach entry

All pools are perfect for lap swimming, lessons, and recreational swimming.

Q: What are the opening hours?
A: [Centre Name] is open:
Monday to Friday: 5:00 AM - 9:30 PM
Saturday and Sunday: 7:00 AM - 6:30 PM

Note: Pool areas close 15 minutes before facility closing time.`,
        },
        {
          role: 'user',
          content: `Based on the following information from our leisure centre knowledge base, answer the question.\n\nKnowledge Base Information:\n${context}\n\nQuestion: ${question}\n\nProvide a helpful, professional response:`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      answer,
      sources: filteredResults.map((r: any) => r.metadata?.title).filter(Boolean),
    });
  } catch (error) {
    console.error('Error processing query:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}