import React from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { InventoryPage } from '../pages/InventoryPage';
import { HistoryPage } from '../pages/HistoryPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const privateRoutes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/inventory" replace />
      },
      {
        path: 'inventory',
        element: <InventoryPage />
      },
      {
        path: 'history',
        element: <HistoryPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
];
