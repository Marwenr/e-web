"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import {
  getAdminProducts,
  publishAdminProduct,
  unpublishAdminProduct,
  archiveAdminProduct,
  deleteAdminProduct,
  bulkActionProducts,
  type AdminProduct,
  type AdminProductListOptions,
} from "@/lib/api/admin";
import { LoadingSpinner } from "@/components/patterns";
import { SearchIcon } from "@/components/svg";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [filters, setFilters] = useState<AdminProductListOptions>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminProducts({
        ...filters,
        search: search || undefined,
      });
      setProducts(response.data || []);
      setMeta(
        response.meta || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
  };

  const handleBulkAction = async (
    action: "publish" | "unpublish" | "archive" | "delete"
  ) => {
    if (selectedProducts.size === 0) return;

    try {
      await bulkActionProducts({
        productIds: Array.from(selectedProducts),
        action,
      });
      setSelectedProducts(new Set());
      loadProducts();
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  };

  const handleStatusChange = async (
    productId: string,
    action: "publish" | "unpublish" | "archive"
  ) => {
    try {
      if (action === "publish") {
        await publishAdminProduct(productId);
      } else if (action === "unpublish") {
        await unpublishAdminProduct(productId);
      } else if (action === "archive") {
        await archiveAdminProduct(productId);
      }
      loadProducts();
    } catch (error) {
      console.error("Status change failed:", error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteAdminProduct(productId);
      loadProducts();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const toggleSelect = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (!products || products.length === 0) return;
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-foreground">Products</h1>
          <p className="text-body text-foreground-secondary mt-2">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>Create Product</Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-secondary" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.status || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value as
                  | "draft"
                  | "active"
                  | "archived"
                  | undefined,
                page: 1,
              })
            }
            className="px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div className="flex items-center gap-2 p-4 bg-primary-50 rounded-md">
          <span className="text-body-sm font-medium">
            {selectedProducts.size} product(s) selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("publish")}
          >
            Publish
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("unpublish")}
          >
            Unpublish
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("archive")}
          >
            Archive
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("delete")}
          >
            Delete
          </Button>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-background rounded-lg border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={
                    selectedProducts.size === (products?.length || 0) &&
                    (products?.length || 0) > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-neutral-300"
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!products || products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-foreground-secondary"
                >
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded border-neutral-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium text-primary-900 hover:underline"
                      >
                        {product.name}
                      </Link>
                      {product.shortDescription && (
                        <p className="text-body-sm text-foreground-secondary mt-1">
                          {product.shortDescription.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-body-sm">
                    {product.sku}
                  </TableCell>
                  <TableCell>{product.category?.name || "-"}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">
                        ${product.discountPrice || product.basePrice}
                      </span>
                      {product.discountPrice && (
                        <span className="text-body-sm text-foreground-secondary line-through ml-2">
                          ${product.basePrice}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-label-sm font-medium ${
                        product.status === "active"
                          ? "bg-success-100 text-success-700"
                          : product.status === "draft"
                          ? "bg-warning-100 text-warning-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.status === "draft" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(product.id, "publish")
                          }
                        >
                          Publish
                        </Button>
                      )}
                      {product.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(product.id, "unpublish")
                          }
                        >
                          Unpublish
                        </Button>
                      )}
                      <Link href={`/admin/products/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-error-600 hover:text-error-700 hover:bg-error-50"
                      >
                        Delete
                      </Button>
                    </div>
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
            Showing {(meta.page - 1) * meta.limit + 1} to{" "}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{" "}
            products
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
