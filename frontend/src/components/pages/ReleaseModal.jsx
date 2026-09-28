import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { inventoryService } from '../../services/inventoryService';
import { MESSAGES } from '../../utils/constant';

export const ReleaseModal = ({ variant, isOpen, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!variant) return null;

  const maxReleasable = variant.reservedQuantity ?? variant.reserved_quantity ?? 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      setError('Quantity must be an integer greater than zero.');
      return;
    }

    if (qty > maxReleasable) {
      setError(`Cannot release more than reserved stock (${maxReleasable}).`);
      return;
    }

    setIsLoading(true);
    try {
      await inventoryService.releaseStock(variant.id, {
        quantity: qty,
        reason: reason.trim() || undefined,
        reference_id: referenceId.trim() || undefined
      });
      onSuccess(MESSAGES.STOCK_RELEASED);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to release reserved stock.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Release Reserved Stock"
      description={`Release reserved stock back to available pool for SKU: ${variant.sku}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-xs flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Currently Reserved:</span>
          <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
            {maxReleasable} units
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Release Quantity <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max={maxReleasable}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Reason / Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Order cancelled or expired hold"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Reference ID
          </label>
          <input
            type="text"
            placeholder="e.g. ORD-9821"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={maxReleasable <= 0}>
            Confirm Release
          </Button>
        </div>
      </form>
    </Modal>
  );
};
