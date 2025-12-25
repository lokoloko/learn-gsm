import { Lock, UserPlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type LockType = 'signup' | 'upgrade' | 'market-limit';

interface LockedContentProps {
  type: LockType;
  featureLabel?: string;
  marketName?: string;
  className?: string;
}

const lockConfig: Record<
  LockType,
  {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
  }
> = {
  signup: {
    icon: UserPlus,
    title: 'Create a free account',
    description: 'Sign up to see full regulation details, fees, and official sources.',
    ctaText: 'Sign Up Free',
    ctaUrl: 'https://gostudiom.com/signup?ref=learn-regulations',
  },
  upgrade: {
    icon: Sparkles,
    title: 'Upgrade to Pro',
    description: 'Get step-by-step application guides and access to all 51+ markets.',
    ctaText: 'View Plans',
    ctaUrl: 'https://gostudiom.com/pricing?ref=learn-regulations',
  },
  'market-limit': {
    icon: Lock,
    title: 'Market limit reached',
    description:
      'Free accounts can view full details for one market. Upgrade to access all markets.',
    ctaText: 'Upgrade to Pro',
    ctaUrl: 'https://gostudiom.com/pricing?ref=learn-regulations',
  },
};

export function LockedContent({
  type,
  featureLabel,
  marketName,
  className,
}: LockedContentProps) {
  const config = lockConfig[type];
  const Icon = config.icon;

  // Customize description for market-limit with market name
  const description =
    type === 'market-limit' && marketName
      ? `You're viewing ${marketName}, but your free account is set to a different market. Upgrade to access all markets.`
      : config.description;

  return (
    <div
      className={cn(
        'relative rounded-lg border border-dashed border-border bg-muted/30 p-8',
        className
      )}
    >
      {/* Blur overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background rounded-lg pointer-events-none" />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>

        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>

        {featureLabel && (
          <p className="text-sm text-primary font-medium mb-2">
            Unlock: {featureLabel}
          </p>
        )}

        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>

        <a href={config.ctaUrl}>
          <Button className="gap-2">
            <Icon className="h-4 w-4" />
            {config.ctaText}
          </Button>
        </a>
      </div>
    </div>
  );
}

/**
 * Wrapper component that shows locked content with a blurred preview.
 */
interface LockedPreviewProps {
  type: LockType;
  featureLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function LockedPreview({
  type,
  featureLabel,
  children,
  className,
}: LockedPreviewProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Blurred preview of content */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Overlay with CTA */}
      <div className="absolute inset-0 flex items-center justify-center">
        <LockedContent type={type} featureLabel={featureLabel} />
      </div>
    </div>
  );
}
