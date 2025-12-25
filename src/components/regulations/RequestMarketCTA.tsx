import { Mail, MapPinPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RequestMarketCTAProps {
  className?: string;
}

export function RequestMarketCTA({ className }: RequestMarketCTAProps) {
  return (
    <div
      className={cn(
        'max-w-2xl mx-auto text-center p-8 rounded-lg border border-border bg-muted/30',
        className
      )}
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
        <MapPinPlus className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-2">Don&apos;t see your market?</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        We&apos;re constantly adding new markets. Let us know which city or county
        you&apos;d like us to research next.
      </p>
      <a href="mailto:hello@gostudiom.com?subject=Market%20Request%20-%20Learn%20STR">
        <Button variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          Request a Market
        </Button>
      </a>
    </div>
  );
}
