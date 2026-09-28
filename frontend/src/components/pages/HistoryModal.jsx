import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { inventoryService } from '../../services/inventoryService';
import { formatDate } from '../../utils/helper';
import { Loader2, ArrowRight } from 'lucide-react';

export const HistoryModal = ({ variant, isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (variant && isOpen) {
      fetchHistory(1);
    }
  }, [variant, isOpen]);

  const fetchHistory = async (targetPage = 1) => {
    if (!variant) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await inventoryService.getHistory(variant.id, {
        page: targetPage,
        limit: 10
      });
      setHistory(res.data || []);
      setMeta(res.meta || null);
      setPage(targetPage);
    } catch (err) {
      setError(err.message || 'Failed to load stock history.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!variant) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Movement History"
      description={`Audit history for SKU: ${variant.sku}`}
      maxWidth="max-w-3xl"
    >
      {error && (
        <div className="p-3 mb-4 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
          <span className="text-xs">Loading audit records...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          No stock history recorded yet for this item.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Action</th>
                  <th className="px-3 py-2.5 font-semibold">Change</th>
                  <th className="px-3 py-2.5 font-semibold">Available Stock</th>
                  <th className="px-3 py-2.5 font-semibold">Reserved Stock</th>
                  <th className="px-3 py-2.5 font-semibold">Reason / Ref</th>
                  <th className="px-3 py-2.5 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-3 py-2.5">
                      <Badge action={item.actionType || item.action_type}>
                        {item.actionType || item.action_type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 font-bold">
                      <span
                        className={
                          (item.quantityChange ?? item.quantity_change ?? 0) > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : (item.quantityChange ?? item.quantity_change ?? 0) < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-gray-600'
                        }
                      >
                        {(item.quantityChange ?? item.quantity_change ?? 0) > 0 ? '+' : ''}
                        {item.quantityChange ?? item.quantity_change ?? 0}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <span>{item.previousAvailable ?? item.previous_available}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {item.newAvailable ?? item.new_available}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <span>{item.previousReserved ?? item.previous_reserved}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {item.newReserved ?? item.new_reserved}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 max-w-xs truncate text-gray-600 dark:text-gray-300">
                      <div>{item.reason || '-'}</div>
                      {(item.referenceId || item.reference_id) && (
                        <div className="text-[10px] text-gray-400 font-mono">
                          Ref: {item.referenceId || item.reference_id}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">
                      {formatDate(item.createdAt || item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
              <span>
                Page {page} of {meta.totalPages} ({meta.totalItems} entries)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!meta.hasPrevPage}
                  onClick={() => fetchHistory(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!meta.hasNextPage}
                  onClick={() => fetchHistory(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
