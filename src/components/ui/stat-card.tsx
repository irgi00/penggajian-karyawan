import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Title of the statistic */
  title: string;
  /** Primary value */
  value: string | number;
  /** Optional description under the value */
  description?: string;
  /** Optional badge text (e.g., +5% ) */
  badge?: string;
  /** Optional badge variant */
  badgeVariant?: 'default' | 'success' | 'warning' | 'destructive';
}

/**
 * StatCard – a compact card showing an icon, title, value and optional description/badge.
 * Uses the design‑system tokens for spacing, colors and typography.
 */
export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  description,
  badge,
  badgeVariant = 'default',
}) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </div>
        {badge && (
          <Badge variant={badgeVariant} className="ml-auto">
            {badge}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
