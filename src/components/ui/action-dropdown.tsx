import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

/**
 * ActionDropdown component for row actions.
 * Props:
 * - editHref: URL to navigate to when "Edit" is clicked.
 * - onDelete: callback invoked when "Delete" is selected.
 */
export const ActionDropdown: React.FC<{
  editHref: string;
  onDelete: () => void;
  className?: string;
}> = ({ editHref, onDelete, className }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-md p-2 hover:bg-muted',
            className,
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href={editHref}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionDropdown;
