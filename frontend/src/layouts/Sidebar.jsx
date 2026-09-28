import React from 'react';
import { NavLink } from 'react-router-dom';
import { navItems } from '../routes/navConfig';
import { cn } from '../lib/clsx';
import { ShieldCheck, X } from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 lg:top-16 z-40 flex flex-col justify-between w-64 h-full lg:h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700/80 transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-4">
          <div className="flex items-center justify-between lg:hidden mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Navigation</span>
            <button onClick={onClose} className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700/60 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2 mb-1 text-gray-700 dark:text-gray-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Row-level Lock Active</span>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-400">
            Guarantees safe concurrent reservations without negative inventory.
          </p>
        </div>
      </aside>
    </>
  );
};
