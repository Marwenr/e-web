"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Container, Section, Input } from "@/components/ui";
import { useCartStore } from "@/store/cart";
import { LoadingState, EmptyState, Alert } from "@/components/patterns";
import { ShoppingBagIcon, XIcon } from "@/components/svg";

export default function CartPage() {
  const { cart, isLoading, error, updateQuantity, removeItem, clearCart, recalculateCart } = useCartStore();

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

  const handleClearCart = async () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
    }
  };

  const handleRecalculate = async () => {
    await recalculateCart();
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

  if (isLoading && !cart) {
    return (
      <Section className="py-12">
        <Container>
          <LoadingState message="Loading your cart..." />
        </Container>
      </Section>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Section className="py-12">
        <Container>
          <EmptyState
            icon={<ShoppingBagIcon className="h-16 w-16 text-neutral-400" />}
            title="Your cart is empty"
            description="Add some items to your cart to get started"
            action={
              <Link href="/products">
                <Button variant="primary" size="lg">
                  Continue Shopping
                </Button>
              </Link>
            }
          />
        </Container>
      </Section>
    );
  }

  // Calculate totals (placeholder for tax and shipping)
  const subtotal = cart.subtotal;
  const tax = 0; // Placeholder
  const shipping = 0; // Placeholder
  const total = subtotal + tax + shipping;

  return (
    <Section className="py-8 md:py-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-body-md text-foreground-secondary">
            {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert variant="error" message={error} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleRecalculate}
                className="text-body-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Recalculate Cart
              </button>
              <button
                type="button"
                onClick={handleClearCart}
                className="text-body-sm text-error-500 hover:text-error-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cart.items.map((item, index) => {
                const image = getProductImage(item);
                const productName = getProductName(item);
                const displayPrice = item.variant?.discountPrice ?? item.variant?.basePrice ?? item.product?.discountPrice ?? item.product?.basePrice ?? item.price;
                const itemTotal = displayPrice * item.quantity;

                return (
                  <div
                    key={`${item.productId}-${item.variantId || "none"}-${index}`}
                    className="flex gap-6 p-6 border border-neutral-200 rounded-lg bg-background"
                  >
                    {/* Product Image */}
                    {image && (
                      <Link
                        href={`/products/${item.product?.slug || ""}`}
                        className="relative flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-neutral-100 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={image.url || image}
                          alt={image.alt || productName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 96px, 128px"
                        />
                      </Link>
                    )}

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product?.slug || ""}`}
                            className="block"
                          >
                            <h3 className="text-body-lg font-semibold text-foreground hover:text-primary-900 line-clamp-2">
                              {productName}
                            </h3>
                          </Link>

                          {/* Variant Attributes */}
                          {item.variant?.attributes && item.variant.attributes.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {item.variant.attributes.map((attr: any, attrIndex: number) => (
                                <div
                                  key={attrIndex}
                                  className="text-body-sm text-foreground-secondary"
                                >
                                  <span className="font-medium">{attr.name}:</span> {attr.value}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Price per item */}
                          <div className="mt-2">
                            <span className="text-body-md font-medium text-foreground">
                              ${displayPrice.toFixed(2)}
                            </span>
                            {item.variant?.basePrice && item.variant.discountPrice && (
                              <span className="ml-2 text-body-sm text-foreground-secondary line-through">
                                ${item.variant.basePrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="flex-shrink-0 p-2 text-foreground-secondary hover:text-error-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <XIcon className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Quantity Controls and Total */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <label htmlFor={`quantity-${index}`} className="text-body-sm font-medium text-foreground">
                            Quantity:
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(index, item.quantity - 1)}
                              className="flex items-center justify-center w-10 h-10 border-2 border-neutral-300 rounded-md text-foreground hover:bg-neutral-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <input
                              id={`quantity-${index}`}
                              type="number"
                              min="1"
                              max={item.variant?.stock || 100}
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1;
                                handleQuantityChange(index, newQuantity);
                              }}
                              className="w-16 h-10 text-center border-2 border-neutral-300 rounded-md text-body font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(index, item.quantity + 1)}
                              disabled={item.variant && item.variant.stock <= item.quantity}
                              className="flex items-center justify-center w-10 h-10 border-2 border-neutral-300 rounded-md text-foreground hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <div className="text-h4 font-bold text-foreground">
                            ${itemTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {item.variant && item.variant.stock <= 5 && item.variant.stock > 0 && (
                        <div className="mt-2">
                          <p className="text-body-sm text-warning-600">
                            ⚠️ Only {item.variant.stock} left in stock
                          </p>
                        </div>
                      )}
                      {item.variant && item.variant.stock === 0 && (
                        <div className="mt-2">
                          <p className="text-body-sm text-error-500">
                            ❌ Out of stock
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <div className="pt-4">
              <Link href="/products">
                <Button variant="outline" size="lg">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 p-6 border border-neutral-200 rounded-lg bg-background space-y-6">
              <h2 className="text-h3 font-bold text-foreground">Order Summary</h2>

              {/* Coupon Input (Placeholder) */}
              <div className="space-y-2">
                <label htmlFor="coupon" className="text-body-sm font-medium text-foreground">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    type="text"
                    placeholder="Enter code"
                    className="flex-1"
                    disabled
                  />
                  <Button variant="outline" disabled>
                    Apply
                  </Button>
                </div>
              </div>

              {/* Summary Details */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-body-md text-foreground-secondary">Subtotal</span>
                  <span className="text-body-md font-medium text-foreground">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-body-md text-foreground-secondary">Tax</span>
                  <span className="text-body-md font-medium text-foreground">
                    ${tax.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-body-md text-foreground-secondary">Shipping</span>
                  <span className="text-body-md font-medium text-foreground">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <span className="text-h4 font-bold text-foreground">Total</span>
                    <span className="text-h4 font-bold text-foreground">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout" className="block">
                <Button variant="primary" size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>

              <p className="text-body-xs text-foreground-secondary text-center">
                Shipping and taxes calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

