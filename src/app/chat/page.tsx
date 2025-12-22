import type { Metadata } from 'next';
import { Chat } from '@/components/chat';

export const metadata: Metadata = {
  title: 'Chat',
  description:
    'Ask our AI assistant anything about short-term rentals. Get instant answers from expert videos and industry news.',
};

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-background">
        <div className="container">
          <h1 className="text-lg font-semibold">STR Knowledge Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Powered by expert videos and industry news
          </p>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 container max-w-3xl">
        <Chat className="h-full" />
      </div>
    </div>
  );
}
