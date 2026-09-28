import React, { useState } from 'react';
import useSWR from 'swr';
import { ReactHelmet } from '../components/common/ReactHelmet';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { formatDate } from '../utils/helper';
import { ACTION_TYPES } from '../utils/constant';
import { RotateCw, History, ArrowRight, Layers } from 'lucide-react';

export const HistoryPage = () => {
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  // Fetch all variants for the selector
  const { data: variantsData } = useSWR('/inventory?limit=100');
  const variants = variantsData?.data || [];

  // Default to first variant if none selected
  const activeVariantId = selectedVariantId || (variants[0]?.id || '');

  // Fetch history for selected variant
  const historyKey = activeVariantId
    ? `/inventory/${activeVariantId}/history?page=${page}&limit=15${actionTypeFilter ? `&action_type=${actionTypeFilter}` : ''}`
    : null;

  const { data: historyData, error, isLoading, mutate } = useSWR(historyKey);
  const historyList = historyData?.data || [];
  const meta = historyData?.meta || { totalPages: 1, totalItems: 0, currentPage: 1 };

  return (
    <div className="space-y-6">
      <ReactHelmet title="Stock Movement History" description="Audit trail of all inventory modifications" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Stock History Trail
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Immutable database records tracking all manual updates, reservations, and releases.
          </p>
        </div>
        <div>
          <Button variant="outline" size="sm" onClick={() => mutate()} isLoading={isLoading}>
            <RotateCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Selectors and Filters */}
      <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Select Product Variant
          </label>
          <select
            value={activeVariantId}
            onChange={(e) => {
              setSelectedVariantId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.sku} — {v.product?.name || 'Product'} (Avail: {v.availableQuantity ?? v.available_quantity})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Filter by Action Type
          </label>
          <select
            value={actionTypeFilter}
            onChange={(e) => {
              setActionTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">All Action Types</option>
            {Object.values(ACTION_TYPES).map((at) => (
              <option key={at} value={at}>
                {at}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-xs overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-rose-500">
            <p className="text-sm font-semibold">Failed to fetch stock history.</p>
            <p className="text-xs text-gray-400 mt-1">{error.message}</p>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <RotateCw className="w-8 h-8 mx-auto animate-spin text-emerald-500" />
            <p className="text-sm">Loading audit records...</p>
          </div>
        ) : historyList.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <History className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No history records found</p>
            <p className="text-xs text-gray-400">Perform stock adjustments or reservations to create audit records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/80 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Delta</th>
                  <th className="px-4 py-3.5">Available (Before → After)</th>
                  <th className="px-4 py-3.5">Reserved (Before → After)</th>
                  <th className="px-4 py-3.5">Reason & Reference</th>
                  <th className="px-4 py-3.5">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {historyList.map((item) => {
                  const chg = item.quantityChange ?? item.quantity_change ?? 0;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60">
                      <td className="px-4 py-3.5">
                        <Badge action={item.actionType || item.action_type}>
                          {item.actionType || item.action_type}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 font-bold font-mono">
                        <span className={chg > 0 ? 'text-emerald-600' : chg < 0 ? 'text-rose-600' : 'text-gray-600'}>
                          {chg > 0 ? `+${chg}` : chg}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span>{item.previousAvailable ?? item.previous_available}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.newAvailable ?? item.new_available}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span>{item.previousReserved ?? item.previous_reserved}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.newReserved ?? item.new_reserved}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="text-gray-800 dark:text-gray-200">{item.reason || '-'}</div>
                        {(item.referenceId || item.reference_id) && (
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                            Ref: {item.referenceId || item.reference_id}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(item.createdAt || item.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
            <span>
              Page {meta.currentPage} of {meta.totalPages} ({meta.totalItems} entries)
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={!meta.hasPrevPage}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
