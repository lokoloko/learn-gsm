import { cn } from '@/lib/utils';
import { type StrictnessLevel, STRICTNESS_META } from '@/lib/utils/regulations';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface StrictnessBadgeProps {
  level: StrictnessLevel;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'icon-only';
  className?: string;
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const StrictnessIcon = ({
  level,
  className,
}: {
  level: StrictnessLevel;
  className?: string;
}) => {
  switch (level) {
    case 'strict':
      return <AlertTriangle className={className} />;
    case 'moderate':
      return <Shield className={className} />;
    case 'permissive':
      return <CheckCircle className={className} />;
  }
};

export function StrictnessBadge({
  level,
  showIcon = true,
  showLabel = true,
  size = 'md',
  variant = 'badge',
  className,
}: StrictnessBadgeProps) {
  const meta = STRICTNESS_META[level];

  // Icon-only variant: just the colored icon, no background
  if (variant === 'icon-only') {
    return (
      <span className={cn(meta.color, className)} title={meta.description}>
        <StrictnessIcon level={level} className={iconSizes[size]} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        meta.bgColor,
        meta.color,
        className
      )}
      title={meta.description}
    >
      {showIcon && <StrictnessIcon level={level} className={iconSizes[size]} />}
      {showLabel && <span>{meta.label}</span>}
    </span>
  );
}
