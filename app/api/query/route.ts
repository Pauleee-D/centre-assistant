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

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Query vector database
    const results = await index.query({
      data: question,
      topK: 3,
      includeMetadata: true,
    });

    if (!results || results.length === 0) {
      return NextResponse.json({
        answer: "I don't have specific information about that topic.",
      });
    }

    // Extract relevant content
    const context = results
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
          content:
            'You are a helpful leisure centre assistant. Answer questions about facilities, memberships, classes, and policies in a friendly, professional manner.',
        },
        {
          role: 'user',
          content: `Based on the following information from our leisure centre knowledge base, answer the question.

Knowledge Base Information:
${context}

Question: ${question}

Provide a helpful, professional response:`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      answer,
      sources: results.map((r: any) => r.metadata?.title).filter(Boolean),
    });
  } catch (error) {
    console.error('Error processing query:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}