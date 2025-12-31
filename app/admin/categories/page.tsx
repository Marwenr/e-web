"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/api/admin";
import { type Category } from "@/lib/api/category";
import { LoadingSpinner } from "@/components/patterns";
import CategoryFormModal from "@/components/admin/CategoryFormModal";
import { SearchIcon } from "@/components/svg";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [search, setSearch] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminCategories({
        isActive: filterActive,
      });
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [filterActive]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteAdminCategory(categoryId);
      loadCategories();
    } catch (error: any) {
      alert(error.message || "Failed to delete category");
    }
  };

  const handleSave = async (data: CreateCategoryInput | UpdateCategoryInput) => {
    if (editingCategory) {
      await updateAdminCategory(editingCategory.id, data as UpdateCategoryInput);
    } else {
      await createAdminCategory(data as CreateCategoryInput);
    }
    loadCategories();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // Filter categories by search term
  const filteredCategories = categories.filter((category) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      category.name.toLowerCase().includes(searchLower) ||
      category.slug.toLowerCase().includes(searchLower) ||
      (category.description && category.description.toLowerCase().includes(searchLower))
    );
  });

  // Build category tree structure for display
  const buildCategoryTree = (cats: Category[]): Category[] => {
    const categoryMap = new Map<string, Category & { children?: Category[] }>();
    const rootCategories: Category[] = [];

    // First pass: create map of all categories
    cats.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    cats.forEach((cat) => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    // Flatten tree for table display (keeping hierarchy info)
    const flattenTree = (cats: Category[], level: number = 0): Category[] => {
      const result: Category[] = [];
      cats.forEach((cat) => {
        result.push({ ...cat, level } as any);
        if ((cat as any).children && (cat as any).children.length > 0) {
          result.push(...flattenTree((cat as any).children, level + 1));
        }
      });
      return result;
    };

    return flattenTree(rootCategories);
  };

  const displayCategories = buildCategoryTree(filteredCategories);

  if (loading && categories.length === 0) {
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
          <h1 className="text-h1 font-bold text-foreground">Categories</h1>
          <p className="text-body text-foreground-secondary mt-2">
            Manage product categories
          </p>
        </div>
        <Button onClick={handleCreate}>Create Category</Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-secondary" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterActive === undefined ? "" : filterActive.toString()}
            onChange={(e) =>
              setFilterActive(
                e.target.value === "" ? undefined : e.target.value === "true"
              )
            }
            className="px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-background rounded-lg border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-foreground-secondary"
                >
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              displayCategories.map((category) => {
                const level = (category as any).level || 0;
                const parentCategory = category.parentId
                  ? categories.find((c) => c.id === category.parentId)
                  : null;

                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div style={{ paddingLeft: `${level * 24}px` }}>
                        {level > 0 && (
                          <span className="text-foreground-secondary mr-2">├─</span>
                        )}
                        <span className="font-medium text-primary-900">
                          {category.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-body-sm">
                      {category.slug}
                    </TableCell>
                    <TableCell>
                      <span className="text-body-sm text-foreground-secondary">
                        {category.description
                          ? category.description.length > 50
                            ? `${category.description.substring(0, 50)}...`
                            : category.description
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {parentCategory ? (
                        <span className="text-body-sm">{parentCategory.name}</span>
                      ) : (
                        <span className="text-body-sm text-foreground-secondary">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-label-sm font-medium ${
                          category.isActive
                            ? "bg-success-100 text-success-700"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-error-600 hover:text-error-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        category={editingCategory}
        categories={categories}
      />
    </div>
  );
}
