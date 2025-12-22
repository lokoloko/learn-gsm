'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function HeroChatInput() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/chat?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/chat');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
      <div className="relative flex-1">
        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about STR hosting..."
          className="pl-10 h-12"
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Ask AI
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
