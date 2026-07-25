import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * FilterBar renders a container for arbitrary filter controls.
 * Pass an array of React nodes via the `filters` prop – the component will layout them
 * with reasonable spacing and ensure they are responsive.
 */
export const FilterBar: React.FC<{ filters: React.ReactNode[]; className?: string }> = ({
  filters,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((filter, idx) => (
        <div key={idx}>{filter}</div>
      ))}
    </div>
  );
};

export default FilterBar;
