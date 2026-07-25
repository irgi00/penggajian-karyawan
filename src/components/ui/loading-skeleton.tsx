import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Simple loading skeleton.
 * Renders a gray animated block that can be sized via `className`.
 * Example usage: <LoadingSkeleton className="h-8 w-32" />
 */
export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
};

export default LoadingSkeleton;
