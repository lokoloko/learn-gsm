import {
  FileCheck,
  Moon,
  Home,
  Percent,
  DollarSign,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  isPermitRequired,
  hasNightCap,
  isPrimaryResidenceRequired,
  getTotalTaxRate,
  formatTaxRate,
  extractFee,
  formatCurrency,
  extractMaxFine,
  getProcessingTime,
} from '@/lib/utils/regulations';
import type { Regulation } from '@/types/database';
import { cn } from '@/lib/utils';

interface AtAGlanceProps {
  regulation: Regulation;
  className?: string;
}

interface FactItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | React.ReactNode;
  highlight?: boolean;
}

function FactItem({ icon: Icon, label, value, highlight }: FactItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      <div
        className={cn(
          'p-2 rounded-lg',
          highlight ? 'bg-primary/10 text-primary' : 'bg-background'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

export function AtAGlance({ regulation, className }: AtAGlanceProps) {
  const permitRequired = isPermitRequired(regulation.registration);
  const nightCap = hasNightCap(regulation.limits);
  const primaryResidence = isPrimaryResidenceRequired(
    regulation.eligibility,
    regulation.registration
  );
  const totalTax = getTotalTaxRate(regulation.taxes);
  const permitFee = extractFee(regulation.registration);
  const maxFine = extractMaxFine(regulation.penalties);
  const processingTime = getProcessingTime(regulation.registration);

  // Get night cap value if exists
  const nightCapValue =
    regulation.limits?.city?.nights_per_year ||
    regulation.limits?.county?.nights_per_year;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">At a Glance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <FactItem
            icon={FileCheck}
            label="Permit Required"
            value={permitRequired ? 'Yes' : 'No'}
            highlight={permitRequired}
          />
          <FactItem
            icon={Moon}
            label="Night Limit"
            value={nightCap ? `${nightCapValue}/year` : 'None'}
            highlight={nightCap}
          />
          <FactItem
            icon={Home}
            label="Primary Residence"
            value={primaryResidence ? 'Required' : 'Not Required'}
            highlight={primaryResidence}
          />
          <FactItem
            icon={Percent}
            label="Total Tax Rate"
            value={formatTaxRate(totalTax) || 'Varies'}
          />
          {permitFee != null && (
            <FactItem
              icon={DollarSign}
              label="Permit Fee"
              value={formatCurrency(permitFee) || 'Contact city'}
            />
          )}
          {processingTime && (
            <FactItem
              icon={Clock}
              label="Processing Time"
              value={processingTime}
            />
          )}
          {maxFine != null && (
            <FactItem
              icon={AlertTriangle}
              label="Max Fine"
              value={formatCurrency(maxFine) || 'Varies'}
              highlight={maxFine >= 10000}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
