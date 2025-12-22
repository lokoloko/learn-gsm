'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from './ChatMessage';
import { StarterPrompts } from './StarterPrompts';

interface ChatProps {
  className?: string;
}

// Helper to extract text content from UIMessage parts
function getMessageContent(message: UIMessage): string {
  if (!message.parts) return '';
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export function Chat({ className }: ChatProps) {
  const [input, setInput] = useState('');
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create transport with rate limit response handler
  const transport = useMemo(() => new DefaultChatTransport({
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

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl">🏠</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">STR Knowledge Assistant</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Ask me anything about short-term rentals. I have access to expert videos
              and industry news to help you succeed as a host.
            </p>
            <StarterPrompts onSelect={handleStarterPrompt} />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role as 'user' | 'assistant'}
                content={getMessageContent(message)}
                isStreaming={isLoading && message.id === messages[messages.length - 1]?.id && message.role === 'assistant'}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Rate Limit Warning */}
      {rateLimitExceeded && (
        <div className="mx-4 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm">
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
        <div className="mx-4 mb-2 text-xs text-muted-foreground text-center">
          {remainingMessages} free {remainingMessages === 1 ? 'message' : 'messages'} remaining today
        </div>
      )}

      {/* Error Display */}
      {error && !rateLimitExceeded && (
        <div className="mx-4 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error.message || 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={
              rateLimitExceeded
                ? 'Sign up to continue chatting...'
                : 'Ask about short-term rentals...'
            }
            disabled={isLoading || rateLimitExceeded}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim() || rateLimitExceeded}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
