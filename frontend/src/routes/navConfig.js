import { Package, History, LayoutDashboard } from 'lucide-react';

export const navItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard
  },
  {
    title: 'Inventory',
    path: '/inventory',
    icon: Package
  },
  {
    title: 'Stock History',
    path: '/history',
    icon: History
  }
];
