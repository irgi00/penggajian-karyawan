import * as React from 'react';
import { FileSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Empty state component with optional icon.
 * Usage: <EmptyState message="No data found" />
 */
export const EmptyState: React.FC<{
  title?: string;
  description?: string;
  message?: string;
  className?: string;
}> = ({
  title,
  description,
  message,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
      {title ? (
        <>
          <h2 className="text-lg font-medium text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground text-base mb-4">{description}</p>
        </>
      ) : (
        <p className="text-muted-foreground text-base">{message}</p>
      )}
    </div>
  );
};

export default EmptyState;
