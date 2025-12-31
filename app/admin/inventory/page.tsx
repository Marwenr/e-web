'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import {
  getAdminInventory,
  updateAdminStock,
  getAdminLowStockAlerts,
  type InventoryItem,
  type InventoryListOptions,
} from '@/lib/api/admin';
import { LoadingSpinner } from '@/components/patterns';
import { SearchIcon } from '@/components/svg';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InventoryListOptions>({
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [lowStockAlerts, setLowStockAlerts] = useState<InventoryItem[]>([]);

  useEffect(() => {
    loadInventory();
    loadLowStockAlerts();
  }, [filters]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await getAdminInventory({
        ...filters,
        search: search || undefined,
      });
      setInventory(response.data || []);
      setMeta(response.meta || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
    } catch (error) {
      console.error('Failed to load inventory:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLowStockAlerts = async () => {
    try {
      const alerts = await getAdminLowStockAlerts();
      setLowStockAlerts(alerts || []);
    } catch (error) {
      console.error('Failed to load low stock alerts:', error);
      setLowStockAlerts([]);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
  };

  const handleStockUpdate = async (variantId: string, newStock: number) => {
    try {
      await updateAdminStock(variantId, { stock: newStock });
      loadInventory();
      loadLowStockAlerts();
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-bold text-foreground">Inventory Management</h1>
        <p className="text-body text-foreground-secondary mt-2">
          Manage stock levels and track inventory
        </p>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <h2 className="text-body-lg font-semibold text-warning-900 mb-2">
            Low Stock Alerts ({lowStockAlerts.length})
          </h2>
          <p className="text-body-sm text-warning-700">
            {lowStockAlerts.length} item(s) have low stock and need attention.
          </p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-secondary" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filters.lowStockOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={() =>
              setFilters({ ...filters, lowStockOnly: !filters.lowStockOnly, page: 1 })
            }
          >
            Low Stock Only
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-background rounded-lg border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!inventory || inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-foreground-secondary">
                  No inventory items found
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      {item.variantName && (
                        <div className="text-body-sm text-foreground-secondary">
                          {item.variantName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-body-sm">{item.variantSku}</TableCell>
                  <TableCell>
                    <input
                      type="number"
                      min="0"
                      value={item.stock}
                      onChange={(e) => {
                        const newStock = parseInt(e.target.value) || 0;
                        handleStockUpdate(item.variantId, newStock);
                      }}
                      className="w-20 px-2 py-1 border border-neutral-200 rounded text-body-sm"
                    />
                  </TableCell>
                  <TableCell>{item.reservedStock}</TableCell>
                  <TableCell>{item.availableStock}</TableCell>
                  <TableCell>
                    {item.lowStockAlert ? (
                      <span className="px-2 py-1 rounded text-label-sm font-medium bg-warning-100 text-warning-700">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-label-sm font-medium bg-success-100 text-success-700">
                        In Stock
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newStock = prompt('Enter new stock quantity:', item.stock.toString());
                        if (newStock !== null) {
                          handleStockUpdate(item.variantId, parseInt(newStock) || 0);
                        }
                      }}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-body-sm text-foreground-secondary">
            Showing {((meta.page - 1) * meta.limit) + 1} to{' '}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} items
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page === 1}
              onClick={() => setFilters({ ...filters, page: meta.page - 1 })}
            >
              Previous
            </Button>
            <span className="text-body-sm">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page === meta.totalPages}
              onClick={() => setFilters({ ...filters, page: meta.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

