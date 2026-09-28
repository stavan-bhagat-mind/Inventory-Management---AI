import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { ThemeProvider } from './contexts/ThemeContext';
import { SWRProvider } from './contexts/SWRProvider';
import { ErrorBoundary } from './ErrorBoundary';

export const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SWRProvider>
          <RouterProvider router={router} />
        </SWRProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
