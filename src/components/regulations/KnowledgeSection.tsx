import {
  FileCheck,
  ShieldOff,
  DollarSign,
  Ban,
  AlertTriangle,
  ListTodo,
  ClipboardList,
  Shield,
  Percent,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RegulationKnowledge, RegulationKnowledgeType } from '@/types/database';
import { cn } from '@/lib/utils';

interface KnowledgeSectionProps {
  items: RegulationKnowledge[];
  className?: string;
}

const typeConfig: Record<
  RegulationKnowledgeType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  eligibility: {
    label: 'Eligibility',
    icon: FileCheck,
    color: 'text-green-500',
  },
  exemption: {
    label: 'Exemptions',
    icon: ShieldOff,
    color: 'text-blue-500',
  },
  fee: {
    label: 'Fees & Costs',
    icon: DollarSign,
    color: 'text-amber-500',
  },
  limit: {
    label: 'Limits & Restrictions',
    icon: Ban,
    color: 'text-orange-500',
  },
  penalty: {
    label: 'Penalties',
    icon: AlertTriangle,
    color: 'text-red-500',
  },
  process: {
    label: 'Application Process',
    icon: ListTodo,
    color: 'text-purple-500',
  },
  requirement: {
    label: 'Requirements',
    icon: ClipboardList,
    color: 'text-cyan-500',
  },
  safety: {
    label: 'Safety Requirements',
    icon: Shield,
    color: 'text-emerald-500',
  },
  tax: {
    label: 'Taxes',
    icon: Percent,
    color: 'text-indigo-500',
  },
};

function KnowledgeGroup({
  type,
  items,
}: {
  type: RegulationKnowledgeType;
  items: RegulationKnowledge[];
}) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={cn('h-5 w-5', config.color)} />
          {config.label}
          <span className="text-xs text-muted-foreground font-normal">
            ({items.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 text-sm">
              <span className={cn('mt-1', config.color)}>•</span>
              <span className="text-muted-foreground">{item.content}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function KnowledgeSection({ items, className }: KnowledgeSectionProps) {
  if (items.length === 0) {
    return null;
  }

  // Group items by type
  const grouped = items.reduce(
    (acc, item) => {
      const type = item.knowledge_type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(item);
      return acc;
    },
    {} as Record<RegulationKnowledgeType, RegulationKnowledge[]>
  );

  // Sort types by display order
  const displayOrder: RegulationKnowledgeType[] = [
    'eligibility',
    'requirement',
    'process',
    'fee',
    'tax',
    'limit',
    'safety',
    'penalty',
    'exemption',
  ];

  const sortedTypes = displayOrder.filter((type) => grouped[type]?.length > 0);

  return (
    <div className={cn('space-y-6', className)}>
      <h2 className="text-xl font-bold">Regulation Details</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {sortedTypes.map((type) => (
          <KnowledgeGroup key={type} type={type} items={grouped[type]} />
        ))}
      </div>
    </div>
  );
}
