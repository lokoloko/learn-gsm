'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from './ChatMessage';
import { StarterPrompts } from './StarterPrompts';

interface ChatProps {
  className?: string;
  initialQuery?: string;
}

// Helper to extract text content from UIMessage parts
function getMessageContent(message: UIMessage): string {
  if (!message.parts) return '';
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export function Chat({ className, initialQuery }: ChatProps) {
  const [input, setInput] = useState('');
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const [hasProcessedInitialQuery, setHasProcessedInitialQuery] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create transport with rate limit response handler
  const transport = useMemo(() => new TextStreamChatTransport({
    api: '/api/chat',
  }), []);

  const {
    messages,
    sendMessage,
    status,
    error,
  } = useChat({
    transport,
    onError: (err) => {
      if (err.message.includes('RATE_LIMIT_EXCEEDED') || err.message.includes('429')) {
        setRateLimitExceeded(true);
      }
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  const hasMessages = messages.length > 0;

  // Auto-send initial query from URL
  useEffect(() => {
    if (initialQuery && !hasProcessedInitialQuery && !isLoading) {
      setHasProcessedInitialQuery(true);
      sendMessage({ text: initialQuery });
    }
  }, [initialQuery, hasProcessedInitialQuery, isLoading, sendMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStarterPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimitExceeded || !input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage({ text: message });
  };

  // Empty state - centered welcome with input
  if (!hasMessages) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[60vh] py-12 ${className || ''}`}>
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <span className="text-3xl">🏠</span>
        </div>
        <h1 className="text-2xl font-semibold mb-2">STR Knowledge Assistant</h1>
        <p className="text-muted-foreground mb-8 max-w-md text-center">
          Ask me anything about short-term rentals. I have access to expert videos
          and industry news to help you succeed as a host.
        </p>

        {/* Input */}
        <div className="w-full max-w-2xl mb-6">
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about short-term rentals..."
              disabled={isLoading || rateLimitExceeded}
              className="flex-1 h-12 text-base"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || rateLimitExceeded}
              size="lg"
              className="h-12 px-6"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>

        <StarterPrompts onSelect={handleStarterPrompt} />
      </div>
    );
  }

  // Chat view with messages
  return (
    <div className={`flex flex-col min-h-[60vh] py-8 ${className || ''}`}>
      {/* Messages */}
      <div className="flex-1 space-y-6 mb-8">
        {messages.map((message, index) => (
          <ChatMessage
            key={`${message.id}-${index}`}
            role={message.role as 'user' | 'assistant'}
            content={getMessageContent(message)}
            isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
          />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🏠</span>
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Rate Limit Warning */}
      {rateLimitExceeded && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <span>
            You&apos;ve reached the daily limit for free chats.{' '}
            <a href="https://gostudiom.com/signup" className="text-primary hover:underline font-medium">
              Sign up
            </a>{' '}
            for unlimited access.
          </span>
        </div>
      )}

      {/* Remaining Messages Indicator */}
      {remainingMessages !== null && remainingMessages <= 2 && !rateLimitExceeded && (
        <div className="mb-2 text-xs text-muted-foreground text-center">
          {remainingMessages} free {remainingMessages === 1 ? 'message' : 'messages'} remaining today
        </div>
      )}

      {/* Error Display */}
      {error && !rateLimitExceeded && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error.message || 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* Input Area - sticky at bottom */}
      <div className="sticky bottom-0 bg-background pt-4 pb-2">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={
              rateLimitExceeded
                ? 'Sign up to continue chatting...'
                : 'Ask a follow-up question...'
            }
            disabled={isLoading || rateLimitExceeded}
            className="flex-1 h-12 text-base"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim() || rateLimitExceeded}
            size="lg"
            className="h-12 px-6"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Powered by expert videos and industry news
        </p>
      </div>
    </div>
  );
}
