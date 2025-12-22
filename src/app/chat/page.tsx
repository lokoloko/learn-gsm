import type { Metadata } from 'next';
import { Chat } from '@/components/chat';

export const metadata: Metadata = {
  title: 'Chat',
  description:
    'Ask our AI assistant anything about short-term rentals. Get instant answers from expert videos and industry news.',
};

interface ChatPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const { q: initialQuery } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Chat Container */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4">
        <Chat initialQuery={initialQuery} />
      </div>
    </div>
  );
}
