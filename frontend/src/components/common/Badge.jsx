import React from 'react';
import { cn } from '../../lib/clsx';
import { STATUS_COLORS, ACTION_COLORS } from '../../utils/constant';

export const Badge = ({ children, status, action, className }) => {
  let colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

  if (status && STATUS_COLORS[status]) {
    colorClass = STATUS_COLORS[status];
  } else if (action && ACTION_COLORS[action]) {
    colorClass = ACTION_COLORS[action];
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all',
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
};
