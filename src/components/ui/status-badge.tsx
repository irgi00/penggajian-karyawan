import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/**
 * StatusBadge component maps employment status to a colored badge.
 * - ACTIVE => primary (blue)
 * - anything else => secondary (slate)
 */
export const StatusBadge: React.FC<{ status: string; className?: string }> = ({
  status,
  className,
}) => {
  const variant = status === 'ACTIVE' ? 'default' : 'secondary';
  return (
    <Badge variant={variant} className={cn(className)}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
