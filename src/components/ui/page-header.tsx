import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: React.ReactNode;
}

/** Simple header used at the top of each admin page */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, breadcrumb }) => {
  return (
    <div className="space-y-2">
      {breadcrumb && <nav className="text-sm text-muted-foreground mb-1">{breadcrumb}</nav>}
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      {description && (
        <p className="text-muted-foreground text-base">{description}</p>
      )}
    </div>
  );
};

export default PageHeader;
