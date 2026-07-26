import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

/**
 * ActionDropdown component for row actions.
 * Props:
 * - onEdit: callback invoked when "Edit" is selected.
 * - onDelete: callback invoked when "Delete" is selected.
 */
export const ActionDropdown: React.FC<{
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}> = ({ onEdit, onDelete, className }) => {
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
        <DropdownMenuItem onSelect={() => onEdit()}>Edit</DropdownMenuItem>
        <DropdownMenuItem onSelect={onDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionDropdown;
