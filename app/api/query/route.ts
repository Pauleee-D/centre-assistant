import { NextResponse } from 'next/server';
import { Index } from '@upstash/vector';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    // Generate response with Gemini
    const prompt = `You are a helpful leisure centre assistant. Answer questions about facilities, memberships, classes, and policies in a friendly, professional manner.

Based on the following information from our leisure centre knowledge base, answer the question.

Knowledge Base Information:
${context}

Question: ${question}

Provide a helpful, professional response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text() || 'No response generated';

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