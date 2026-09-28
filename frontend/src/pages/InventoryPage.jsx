import React, { useState } from 'react';
import useSWR from 'swr';
import { ReactHelmet } from '../components/common/ReactHelmet';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ReserveModal } from '../components/pages/ReserveModal';
import { ReleaseModal } from '../components/pages/ReleaseModal';
import { UpdateStockModal } from '../components/pages/UpdateStockModal';
import { HistoryModal } from '../components/pages/HistoryModal';
import { formatCurrency } from '../utils/helper';
import { VARIANT_STATUS } from '../utils/constant';
import {
  Search,
  Filter,
  AlertTriangle,
  RotateCw,
  PlusCircle,
  MinusCircle,
  Edit,
  History,
  Boxes,
  Lock,
  Layers,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const InventoryPage = () => {
  // Query States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Modal States
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'reserve' | 'release' | 'update' | 'history'

  // Toast / Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Build SWR Query URL
  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);
  if (statusFilter) queryParams.set('status', statusFilter);
  if (lowStockFilter) queryParams.set('low_stock', 'true');
  queryParams.set('page', page);
  queryParams.set('limit', limit);
  queryParams.set('sort_by', sortBy);
  queryParams.set('sort_order', sortOrder);

  const swrKey = `/inventory?${queryParams.toString()}`;
  const { data: resData, error, isLoading, mutate } = useSWR(swrKey);

  const variants = resData?.data || [];
  const meta = resData?.meta || { totalPages: 1, totalItems: 0, currentPage: 1 };

  // Calculate summary metrics
  const totalAvailable = variants.reduce((acc, v) => acc + (v.availableQuantity ?? v.available_quantity ?? 0), 0);
  const totalReserved = variants.reduce((acc, v) => acc + (v.reservedQuantity ?? v.reserved_quantity ?? 0), 0);
  const lowStockCount = variants.filter(
    (v) => (v.availableQuantity ?? v.available_quantity ?? 0) <= (v.reorderLevel ?? v.reorder_level ?? 10)
  ).length;

  const handleActionSuccess = (msg) => {
    mutate();
    showToast(msg, 'success');
  };

  return (
    <div className="space-y-6">
      <ReactHelmet title="Inventory Catalog" description="Manage, reserve, and track stock across product variants" />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm transition-all animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Inventory Management
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time multi-variant stock control with concurrency protection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            isLoading={isLoading}
          >
            <RotateCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Variants</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{meta.totalItems}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Tracked in database</div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Available Stock</span>
            <Boxes className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalAvailable}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Ready for checkout</div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Reserved Stock</span>
            <Lock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">{totalReserved}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Locked allocations</div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{lowStockCount}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">At or below reorder level</div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU or Product..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              {Object.values(VARIANT_STATUS).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [fld, ord] = e.target.value.split(':');
                setSortBy(fld);
                setSortOrder(ord);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="created_at:DESC">Newest First</option>
              <option value="created_at:ASC">Oldest First</option>
              <option value="available_quantity:ASC">Available: Low to High</option>
              <option value="available_quantity:DESC">Available: High to Low</option>
              <option value="price:ASC">Price: Low to High</option>
              <option value="price:DESC">Price: High to Low</option>
              <option value="sku:ASC">SKU (A-Z)</option>
            </select>
          </div>

          {/* Low Stock Toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => {
                  setLowStockFilter(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 text-emerald-600 rounded-sm border-gray-300 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Low Stock Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-xs overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-rose-500 space-y-2">
            <XCircle className="w-8 h-8 mx-auto" />
            <p className="text-sm font-semibold">Failed to fetch inventory from server.</p>
            <p className="text-xs text-gray-500">{error.message}</p>
            <Button size="sm" variant="secondary" onClick={() => mutate()} className="mt-2">
              Retry Connection
            </Button>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <RotateCw className="w-8 h-8 mx-auto animate-spin text-emerald-500" />
            <p className="text-sm">Loading inventory database...</p>
          </div>
        ) : variants.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <Filter className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">No inventory variants found</p>
            <p className="text-xs text-gray-400">Try adjusting your search keywords or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/80 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3.5">SKU & Product</th>
                  <th className="px-4 py-3.5">Attributes</th>
                  <th className="px-4 py-3.5 text-right">Price</th>
                  <th className="px-4 py-3.5 text-center">Available</th>
                  <th className="px-4 py-3.5 text-center">Reserved</th>
                  <th className="px-4 py-3.5 text-center">Reorder Level</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {variants.map((v) => {
                  const avail = v.availableQuantity ?? v.available_quantity ?? 0;
                  const resv = v.reservedQuantity ?? v.reserved_quantity ?? 0;
                  const rLvl = v.reorderLevel ?? v.reorder_level ?? 10;
                  const isLow = avail <= rLvl;

                  let attrs = {};
                  try {
                    attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : (v.attributes || {});
                  } catch {
                    attrs = {};
                  }

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-gray-900 dark:text-white font-mono">{v.sku}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {v.product?.name || 'Product'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(attrs).map(([key, val]) => (
                            <span
                              key={key}
                              className="px-2 py-0.5 rounded text-[11px] bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300"
                            >
                              {key}: <strong className="font-semibold">{val}</strong>
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(v.price)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-bold text-xs ${
                            isLow
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-800'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}
                        >
                          {avail}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full font-medium text-xs bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                          {resv}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center text-xs text-gray-500 dark:text-gray-400">
                        {rLvl}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <Badge status={v.status}>{v.status}</Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Reserve Stock"
                            disabled={avail <= 0 || v.status === VARIANT_STATUS.INACTIVE}
                            onClick={() => {
                              setSelectedVariant(v);
                              setActiveModal('reserve');
                            }}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>

                          <button
                            title="Release Stock"
                            disabled={resv <= 0}
                            onClick={() => {
                              setSelectedVariant(v);
                              setActiveModal('release');
                            }}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>

                          <button
                            title="Edit Stock / Details"
                            onClick={() => {
                              setSelectedVariant(v);
                              setActiveModal('update');
                            }}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            title="View History Trail"
                            onClick={() => {
                              setSelectedVariant(v);
                              setActiveModal('history');
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>
              Showing {variants.length} of {meta.totalItems} entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>
              Page {meta.currentPage} of {meta.totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Prev
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
      </div>

      {/* Action Modals */}
      <ReserveModal
        variant={selectedVariant}
        isOpen={activeModal === 'reserve'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleActionSuccess}
      />

      <ReleaseModal
        variant={selectedVariant}
        isOpen={activeModal === 'release'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleActionSuccess}
      />

      <UpdateStockModal
        variant={selectedVariant}
        isOpen={activeModal === 'update'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleActionSuccess}
      />

      <HistoryModal
        variant={selectedVariant}
        isOpen={activeModal === 'history'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};
