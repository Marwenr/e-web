# Product Visual States

Reusable UI patterns for product badges and stock status indicators.

## Components

### ProductBadge

Displays product badges: New, Best Seller, or Sale.

```tsx
import { ProductBadge } from '@/components/product';

// New badge
<ProductBadge type="new" />

// Best Seller badge
<ProductBadge type="bestseller" />

// Sale badge (with percentage)
<ProductBadge type="sale" discountPercent={25} />

// Custom label
<ProductBadge type="sale" label="50% OFF" />
```

**Props:**
- `type`: `"new" | "bestseller" | "sale"` - Badge type
- `label?`: `string` - Custom label override
- `discountPercent?`: `number` - For sale badges, shows percentage
- `className?`: `string` - Additional CSS classes

**Badge Styles:**
- **New**: Green (`bg-success-500`) - For newly published products
- **Best Seller**: Dark (`bg-primary-900`) - For top-selling products
- **Sale**: Red (`bg-error-500`) - For discounted products

### ProductStockStatus

Displays stock availability status with appropriate styling.

```tsx
import { ProductStockStatus, getStockStatus } from '@/components/product';

// In stock
<ProductStockStatus status="in_stock" />

// Low stock
<ProductStockStatus status="low_stock" stockCount={5} />

// Out of stock
<ProductStockStatus status="out_of_stock" />

// With helper function
const status = getStockStatus(stockCount, 10);
<ProductStockStatus status={status} stockCount={stockCount} />
```

**Props:**
- `status`: `"in_stock" | "low_stock" | "out_of_stock"` - Stock status
- `stockCount?`: `number` - Current stock count
- `threshold?`: `number` - Low stock threshold (default: 10)
- `className?`: `string` - Additional CSS classes

**Helper Function:**
```tsx
getStockStatus(stockCount: number | undefined, threshold?: number): StockStatus
```
Automatically determines status based on stock count.

**Status Styles:**
- **In Stock**: Green background (`bg-success-50`) with green text
- **Low Stock**: Yellow/warning background (`bg-warning-50`) with warning text
- **Out of Stock**: Red background (`bg-error-50`) with error text

### ProductStatusOverlay

Combines badges and stock status in a single overlay component.

```tsx
import { ProductStatusOverlay } from '@/components/product';

<ProductStatusOverlay
  badge="sale"
  discountPercent={25}
  stockStatus="low_stock"
  stockCount={5}
  position="top-right"
/>
```

**Props:**
- `badge?`: `ProductBadgeType` - Badge to display
- `badgeLabel?`: `string` - Custom badge label
- `discountPercent?`: `number` - For sale badges
- `stockStatus?`: `StockStatus` - Stock status
- `stockCount?`: `number` - Stock count for display
- `lowStockThreshold?`: `number` - Threshold for low stock (default: 10)
- `position?`: `"top-left" | "top-right" | "bottom-left" | "bottom-right"` - Overlay position
- `className?`: `string` - Additional CSS classes

## Usage Examples

### In Product Card

```tsx
import { ProductBadge, ProductStockStatus } from '@/components/product';

<div className="relative">
  <img src={product.image} alt={product.name} />
  
  {/* Badge overlay */}
  <div className="absolute top-3 right-3">
    {product.isNew && <ProductBadge type="new" />}
    {product.isOnSale && (
      <ProductBadge type="sale" discountPercent={product.discountPercent} />
    )}
  </div>
  
  {/* Stock status */}
  {product.stockStatus !== 'in_stock' && (
    <div className="absolute bottom-3 left-3">
      <ProductStockStatus 
        status={product.stockStatus} 
        stockCount={product.stockCount}
      />
    </div>
  )}
</div>
```

### Using the Overlay Component

```tsx
import { ProductStatusOverlay, getStockStatus } from '@/components/product';

<div className="relative">
  <img src={product.image} alt={product.name} />
  
  <ProductStatusOverlay
    badge={product.badge}
    discountPercent={product.discountPercent}
    stockStatus={getStockStatus(product.stockCount)}
    stockCount={product.stockCount}
    position="top-right"
  />
</div>
```

### In Product List/Grid

```tsx
{products.map(product => (
  <div key={product.id} className="relative">
    <ProductCard product={product} />
    
    {/* Status overlay */}
    <ProductStatusOverlay
      badge={product.badge}
      stockStatus={getStockStatus(product.stockCount)}
      position="top-right"
    />
  </div>
))}
```

## Design Tokens Used

All components use Tailwind config tokens for consistency:

### Colors
- Success: `success-*` (green shades)
- Warning: `warning-*` (yellow/orange shades)
- Error: `error-*` (red shades)
- Primary: `primary-*` (dark shades for best seller)

### Typography
- Labels: `text-label`
- Body: `text-body-sm`, `text-body-md`

### Spacing
- Padding: `px-2.5 py-1`, `gap-1.5`, `gap-2`
- Positioning: `top-3`, `right-3`, `bottom-3`, `left-3`

### Borders & Radius
- Border radius: `rounded-md`
- Borders: `border`, `border-success-200`, etc.

## Accessibility

- All badges include `aria-label` attributes
- Stock status uses `role="status"` for screen readers
- Icons are marked with `aria-hidden="true"` when decorative
- Color contrast meets WCAG AA standards

## Best Practices

1. **Badge Priority**: Show only one badge at a time (New > Best Seller > Sale)
2. **Stock Status**: Only show when not "in_stock" to reduce visual clutter
3. **Positioning**: Use consistent positioning across product cards (top-right for badges)
4. **Thresholds**: Use consistent low stock thresholds (default: 10)
5. **Responsive**: Badges are sized appropriately for mobile and desktop

