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
    <div className="fixed inset-0 top-16 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-lg font-semibold">STR Knowledge Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Powered by expert videos and industry news
          </p>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden max-w-3xl mx-auto w-full">
        <Chat className="h-full" initialQuery={initialQuery} />
      </div>
    </div>
  );
}
