import React from 'react';
import { Link } from 'react-router-dom';
import { ReactHelmet } from '../components/common/ReactHelmet';
import { Button } from '../components/common/Button';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <ReactHelmet title="404 Not Found" />
      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-full mb-4">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Page Not Found</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        The requested URL was not found on this inventory management server.
      </p>
      <div className="mt-6">
        <Link to="/inventory">
          <Button variant="primary">
            <Home className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>
      </div>
    </div>
  );
};
