import React from 'react';
import { SWRConfig } from 'swr';
import api from '../services/api';

const defaultFetcher = (url) => api.get(url);

export const SWRProvider = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fetcher: defaultFetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        dedupingInterval: 3000
      }}
    >
      {children}
    </SWRConfig>
  );
};
