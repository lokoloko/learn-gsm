'use client';

import { Button } from '@/components/ui/button';

interface StarterPromptsProps {
  onSelect: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  {
    label: 'Getting Started',
    prompt: 'What are the essential steps to start my first Airbnb rental?',
  },
  {
    label: 'Pricing Strategy',
    prompt: 'How should I price my short-term rental to maximize bookings and revenue?',
  },
  {
    label: 'Guest Communication',
    prompt: 'What are best practices for guest communication before, during, and after their stay?',
  },
  {
    label: 'Legal Requirements',
    prompt: 'What permits and licenses do I need to legally operate a short-term rental?',
  },
];

export function StarterPrompts({ onSelect }: StarterPromptsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        Try asking about:
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {STARTER_PROMPTS.map((item) => (
          <Button
            key={item.label}
            variant="outline"
            size="sm"
            onClick={() => onSelect(item.prompt)}
            className="text-xs"
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
