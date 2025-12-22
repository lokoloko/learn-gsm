import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { headers } from 'next/headers';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface MessagePart {
  type: string;
  text?: string;
}

interface IncomingMessage {
  role: string;
  content?: string | MessagePart[];
  parts?: MessagePart[];
}

// Helper to extract text from message (handles v4 content, v5 parts, and simple formats)
const extractTextFromMessage = (message: IncomingMessage): string => {
  // v5 format: parts array
  if (message.parts && Array.isArray(message.parts)) {
    const textPart = message.parts.find((p) => p.type === 'text');
    return textPart?.text || '';
  }
  // v4 format: content string or array
  if (typeof message.content === 'string') {
    return message.content;
  }
  if (Array.isArray(message.content)) {
    const textPart = message.content.find((p) => p.type === 'text');
    return textPart?.text || '';
  }
  return '';
};

// Configure Google AI with existing GEMINI_API_KEY
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

interface KnowledgeResult {
  source_type: string;
  source_id: string;
  source_title: string;
  source_url: string;
  knowledge_type: string;
  content: string;
  category: string | null;
  skill_level: string | null;
  rank: number;
}

const formatContext = (results: KnowledgeResult[]): string => {
  if (!results || results.length === 0) {
    return 'No specific knowledge found for this query.';
  }

  return results
    .map(
      (r) =>
        `[${r.source_type.toUpperCase()}: ${r.source_title}](${r.source_url})\n` +
        `Type: ${r.knowledge_type}\n` +
        `${r.content}`
    )
    .join('\n\n---\n\n');
};

const createSystemPrompt = (context: string, contextCount: number): string => {
  return `You are an expert STR (short-term rental) hosting assistant for Learn STR by GoStudioM.

CONTEXT:
You have access to a curated knowledge base of ${contextCount} items from STR creator videos and industry news.

<context>
${context}
</context>

GUIDELINES:
- Cite sources naturally: "According to [video/article title]..."
- Be concise, practical, and actionable
- If context doesn't cover the question, use your general knowledge but note it
- For regulations, always recommend verifying with local authorities
- Format responses with markdown for readability

GOSTUDIOM TOOLS (mention only when genuinely relevant):
- Listing Analyzer (free): Competitive analysis, amenity gaps at listings.gostudiom.com
- Cleaning Calendar ($9/mo): Turnover management at calendar.gostudiom.com
- Financial Analytics ($12/mo): Expense tracking at gostudiom.com
- Review Generator (free): AI-powered guest review responses
- Maintenance Generator (free): Custom maintenance checklists
- Supply Calculator (free): Restocking calculations

Do NOT promote tools unless the question naturally relates to them.`;
};

// Rate limit: 5 messages per day for anonymous users
const RATE_LIMIT = 5;

async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = await getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0];

  // Check current count
  const { data } = await supabase
    .from('learn_chat_rate_limits')
    .select('message_count')
    .eq('identifier', identifier)
    .eq('date', today)
    .single();

  const currentCount = data?.message_count || 0;

  if (currentCount >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Increment count
  await supabase.rpc('increment_learn_chat_rate_limit', {
    p_identifier: identifier,
    p_date: today,
  });

  return { allowed: true, remaining: RATE_LIMIT - currentCount - 1 };
}

function getClientIdentifier(headersList: Headers): string {
  // Use a combination of IP and user agent for anonymous user tracking
  const forwardedFor = headersList.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || headersList.get('x-real-ip') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  // Create a simple hash for the identifier
  const identifier = `${ip}:${userAgent.slice(0, 50)}`;
  return identifier;
}

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const { messages, fingerprint } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting for anonymous users
    const clientId = getClientIdentifier(headersList);
    const identifier = fingerprint ? `${clientId}:${fingerprint}` : clientId;

    const { allowed, remaining } = await checkRateLimit(identifier);

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please sign up for unlimited access.',
          code: 'RATE_LIMIT_EXCEEDED',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Extract user question from last message
    const lastMessage = messages[messages.length - 1];
    const userQuestion = extractTextFromMessage(lastMessage);

    // Search knowledge base
    const supabase = await getSupabaseAdmin();
    const { data: knowledge, error: searchError } = await supabase.rpc(
      'search_all_knowledge',
      {
        search_query: userQuestion,
        result_limit: 15,
      }
    );

    if (searchError) {
      console.error('Knowledge search error:', searchError);
    }

    // Format context
    const results = (knowledge || []) as KnowledgeResult[];
    const context = formatContext(results);
    const contextCount = results.length;

    console.log(
      `Chat: Query "${userQuestion.slice(0, 50)}..." → ${contextCount} results`
    );

    // Convert messages to simple format for model
    const modelMessages: ChatMessage[] = messages.map((m: IncomingMessage) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: extractTextFromMessage(m),
    }));

    // Generate response with streaming
    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: createSystemPrompt(context, contextCount),
      messages: modelMessages,
    });

    const response = result.toTextStreamResponse();

    // Add rate limit header to response
    response.headers.set('X-RateLimit-Remaining', remaining.toString());

    return response;
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to process chat request';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
