"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Drawer, Button, Badge } from "@/components/ui";
import { useCartStore } from "@/store/cart";
import { LoadingSpinner, EmptyState } from "@/components/patterns";
import { ShoppingBagIcon, XIcon } from "@/components/svg";

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { cart, isLoading, updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = async (itemIndex: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemIndex);
    } else {
      await updateQuantity(itemIndex, newQuantity);
    }
  };

  const handleRemove = async (itemIndex: number) => {
    await removeItem(itemIndex);
  };

  const getProductImage = (item: any) => {
    // Variant images are strings (URLs), not objects
    if (item.variant?.images && item.variant.images.length > 0) {
      const imageUrl = item.variant.images[0];
      return typeof imageUrl === 'string' ? { url: imageUrl, alt: item.product?.name || 'Product' } : imageUrl;
    }
    if (item.product?.images) {
      const primaryImage = item.product.images.find((img: any) => img.isPrimary);
      return primaryImage || item.product.images[0];
    }
    return null;
  };

  const getProductName = (item: any) => {
    if (item.variant?.name) {
      return `${item.product?.name || "Product"} - ${item.variant.name}`;
    }
    return item.product?.name || "Product";
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Shopping Cart" side="right" size="md">
      <div className="flex flex-col h-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" variant="primary" />
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <EmptyState
              icon={<ShoppingBagIcon className="h-16 w-16 text-neutral-400" />}
              title="Your cart is empty"
              description="Add some items to your cart to get started"
              action={
                <Button onClick={onClose} variant="primary">
                  Continue Shopping
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4 px-6">
                {cart.items.map((item, index) => {
                  const image = getProductImage(item);
                  const productName = getProductName(item);
                  const displayPrice = item.variant?.discountPrice ?? item.variant?.basePrice ?? item.product?.discountPrice ?? item.product?.basePrice ?? item.price;

                  return (
                    <div
                      key={`${item.productId}-${item.variantId || "none"}-${index}`}
                      className="flex gap-4 pb-4 border-b border-neutral-200 last:border-b-0"
                    >
                      {/* Product Image */}
                      {image && (
                        <Link
                          href={`/products/${item.product?.slug || ""}`}
                          onClick={onClose}
                          className="relative flex-shrink-0 w-20 h-20 bg-neutral-100 rounded-md overflow-hidden"
                        >
                          <Image
                            src={image.url || image}
                            alt={image.alt || productName}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </Link>
                      )}

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product?.slug || ""}`}
                          onClick={onClose}
                          className="block"
                        >
                          <h3 className="text-body-sm font-medium text-foreground hover:text-primary-900 line-clamp-2">
                            {productName}
                          </h3>
                        </Link>

                        {/* Variant Attributes */}
                        {item.variant?.attributes && item.variant.attributes.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {item.variant.attributes.map((attr: any, attrIndex: number) => (
                              <span
                                key={attrIndex}
                                className="inline-block text-body-xs text-foreground-secondary mr-2"
                              >
                                {attr.name}: {attr.value}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Price */}
                        <div className="mt-2">
                          <span className="text-body-sm font-semibold text-foreground">
                            ${displayPrice.toFixed(2)}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(index, item.quantity - 1)}
                              className="flex items-center justify-center w-8 h-8 border border-neutral-300 rounded-md text-foreground hover:bg-neutral-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-body-sm font-medium text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(index, item.quantity + 1)}
                              disabled={item.variant && item.variant.stock <= item.quantity}
                              className="flex items-center justify-center w-8 h-8 border border-neutral-300 rounded-md text-foreground hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="ml-auto p-1 text-foreground-secondary hover:text-error-500 transition-colors"
                            aria-label="Remove item"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Stock Warning */}
                        {item.variant && item.variant.stock <= 5 && item.variant.stock > 0 && (
                          <p className="mt-2 text-body-xs text-warning-600">
                            Only {item.variant.stock} left in stock
                          </p>
                        )}
                        {item.variant && item.variant.stock === 0 && (
                          <p className="mt-2 text-body-xs text-error-500">
                            Out of stock
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="border-t border-neutral-200 bg-neutral-50 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body-md font-medium text-foreground">Subtotal</span>
                <span className="text-h4 font-bold text-foreground">
                  ${cart.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="text-body-xs text-foreground-secondary">
                Shipping and taxes calculated at checkout
              </div>

              <div className="flex flex-col gap-2">
                <Link href="/cart" onClick={onClose}>
                  <Button variant="outline" size="lg" className="w-full">
                    View Cart
                  </Button>
                </Link>
                <Link href="/checkout" onClick={onClose}>
                  <Button variant="primary" size="lg" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}

