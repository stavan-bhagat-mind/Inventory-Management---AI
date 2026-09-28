import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PrivateRouteValidate } from './PrivateRouteValidate';
import { privateRoutes } from './PrivateRouteConfig';

export const router = createBrowserRouter([
  {
    element: <PrivateRouteValidate />,
    children: privateRoutes
  }
]);
