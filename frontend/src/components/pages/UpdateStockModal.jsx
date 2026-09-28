import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { inventoryService } from '../../services/inventoryService';
import { VARIANT_STATUS, MESSAGES } from '../../utils/constant';

export const UpdateStockModal = ({ variant, isOpen, onClose, onSuccess }) => {
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [status, setStatus] = useState(VARIANT_STATUS.ACTIVE);
  const [reason, setReason] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (variant) {
      setAvailableQuantity(variant.availableQuantity ?? variant.available_quantity ?? 0);
      setPrice(variant.price ?? 0);
      setReorderLevel(variant.reorderLevel ?? variant.reorder_level ?? 10);
      setStatus(variant.status || VARIANT_STATUS.ACTIVE);
      setReason('');
      setReferenceId('');
      setError('');
    }
  }, [variant, isOpen]);

  if (!variant) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = Number(availableQuantity);
    const prc = Number(price);
    const rLvl = Number(reorderLevel);

    if (qty < 0 || !Number.isInteger(qty)) {
      setError('Available quantity must be an integer >= 0.');
      return;
    }

    if (prc < 0 || isNaN(prc)) {
      setError('Price must be a valid number >= 0.');
      return;
    }

    if (rLvl < 0 || !Number.isInteger(rLvl)) {
      setError('Reorder level must be an integer >= 0.');
      return;
    }

    setIsLoading(true);
    try {
      await inventoryService.updateStock(variant.id, {
        available_quantity: qty,
        price: prc,
        reorder_level: rLvl,
        status,
        reason: reason.trim() || 'Manual stock update',
        reference_id: referenceId.trim() || undefined
      });
      onSuccess(MESSAGES.INVENTORY_UPDATED);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update stock.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Stock & Variant"
      description={`Adjust inventory attributes for SKU: ${variant.sku}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Available Quantity
            </label>
            <input
              type="number"
              min="0"
              value={availableQuantity}
              onChange={(e) => setAvailableQuantity(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Reorder Level
            </label>
            <input
              type="number"
              min="0"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {Object.values(VARIANT_STATUS).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Reason for Adjustment
          </label>
          <input
            type="text"
            placeholder="e.g. Physical inventory count correction"
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
            placeholder="e.g. PO-2026-09"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
