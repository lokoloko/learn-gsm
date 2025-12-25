'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ApplicationStep } from '@/types/database';

interface ApplicationStepsProps {
  steps: ApplicationStep[];
  marketName: string;
  className?: string;
}

export function ApplicationSteps({
  steps,
  marketName,
  className,
}: ApplicationStepsProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(
    new Set(steps.map((s) => s.step))
  );

  if (!steps || steps.length === 0) {
    return null;
  }

  const sortedSteps = [...steps].sort((a, b) => a.step - b.step);

  const toggleComplete = (stepNum: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) {
        next.delete(stepNum);
      } else {
        next.add(stepNum);
      }
      return next;
    });
  };

  const toggleExpanded = (stepNum: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) {
        next.delete(stepNum);
      } else {
        next.add(stepNum);
      }
      return next;
    });
  };

  const completedCount = completedSteps.size;
  const totalSteps = sortedSteps.length;
  const progressPercent = (completedCount / totalSteps) * 100;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">How to Get Permitted</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Step-by-step guide for {marketName}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {completedCount}/{totalSteps}
          </div>
          <div className="text-xs text-muted-foreground">steps completed</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {sortedSteps.map((step) => {
          const isCompleted = completedSteps.has(step.step);
          const isExpanded = expandedSteps.has(step.step);

          return (
            <div
              key={step.step}
              className={cn(
                'border rounded-lg transition-colors',
                isCompleted
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-card'
              )}
            >
              {/* Step header */}
              <div className="flex items-start gap-4 p-4">
                {/* Completion toggle */}
                <button
                  onClick={() => toggleComplete(step.step)}
                  className="flex-shrink-0 mt-0.5"
                  aria-label={
                    isCompleted ? 'Mark as incomplete' : 'Mark as complete'
                  }
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Step {step.step}
                    </span>
                  </div>
                  <h3
                    className={cn(
                      'font-semibold mt-1',
                      isCompleted && 'line-through text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </h3>

                  {/* Collapsed preview */}
                  {!isExpanded && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {step.description}
                    </p>
                  )}

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-3 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        {step.estimated_time && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{step.estimated_time}</span>
                          </div>
                        )}
                        {step.cost !== null && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              {step.cost === 0
                                ? 'Free'
                                : `$${step.cost.toLocaleString()}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Documents needed */}
                      {step.documents_needed &&
                        step.documents_needed.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                              <FileText className="h-4 w-4" />
                              <span>Documents Needed</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-5">
                              {step.documents_needed.map((doc, idx) => (
                                <li key={idx} className="list-disc">
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* Link */}
                      {step.url && (
                        <a
                          href={step.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Official Resource</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Expand/collapse toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(step.step)}
                  className="flex-shrink-0"
                  aria-label={isExpanded ? 'Collapse step' : 'Expand step'}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {completedCount === totalSteps && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
          <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="font-medium text-primary">
            All steps completed! You&apos;re ready to host in {marketName}.
          </p>
        </div>
      )}
    </div>
  );
}
