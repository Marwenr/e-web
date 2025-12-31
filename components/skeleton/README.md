# Skeleton Loading Components

Reusable skeleton loading UI components for smooth loading UX across the application.

## Components

### Skeleton

Base skeleton component with pulse animation. Use as a building block for more complex skeletons.

```tsx
import { Skeleton } from '@/components/skeleton';

// Rectangular skeleton
<Skeleton variant="rectangular" width={200} height={20} />

// Circular skeleton
<Skeleton variant="circular" width={40} height={40} />

// Text skeleton
<Skeleton variant="text" height={16} width="100%" />
```

**Props:**
- `variant?`: `"rectangular" | "circular" | "text"` - Skeleton shape (default: "rectangular")
- `width?`: `string | number` - Width of skeleton
- `height?`: `string | number` - Height of skeleton
- `animate?`: `boolean` - Enable pulse animation (default: true)
- `className?`: `string` - Additional CSS classes

### ProductCardSkeleton

Skeleton loader matching the ProductCard component structure.

```tsx
import { ProductCardSkeleton } from '@/components/skeleton';

<ProductCardSkeleton />
<ProductCardSkeleton showDescription={false} />
```

**Props:**
- `className?`: `string` - Additional CSS classes
- `showDescription?`: `boolean` - Show description skeleton (default: true)

### ProductGridSkeleton

Displays multiple ProductCardSkeleton components in a grid.

```tsx
import { ProductGridSkeleton } from '@/components/skeleton';

<ProductGridSkeleton count={8} />
<ProductGridSkeleton count={6} showDescription={false} />
```

**Props:**
- `count?`: `number` - Number of skeleton cards (default: 8)
- `className?`: `string` - Additional CSS classes
- `showDescription?`: `boolean` - Show description in cards (default: true)

### ProductSectionSkeleton

Complete skeleton for product sections (headers + grid).

```tsx
import { ProductSectionSkeleton } from '@/components/skeleton';

<ProductSectionSkeleton />
<ProductSectionSkeleton 
  showTitle={true}
  showSubtitle={true}
  productCount={6}
/>
```

**Props:**
- `showTitle?`: `boolean` - Show title skeleton (default: true)
- `showSubtitle?`: `boolean` - Show subtitle skeleton (default: true)
- `productCount?`: `number` - Number of product skeletons (default: 6)
- `className?`: `string` - Additional CSS classes

### ProductDetailSkeleton

Complete skeleton for product detail pages.

```tsx
import { ProductDetailSkeleton } from '@/components/skeleton';

<ProductDetailSkeleton />
```

**Props:**
- `className?`: `string` - Additional CSS classes

Includes:
- Breadcrumbs skeleton
- Image gallery skeleton (main + thumbnails)
- Product information skeleton
- Related products skeleton

### HomeSectionSkeleton

Complete skeleton for home page.

```tsx
import { HomeSectionSkeleton } from '@/components/skeleton';

<HomeSectionSkeleton />
<HomeSectionSkeleton 
  showHero={true}
  sectionCount={3}
/>
```

**Props:**
- `showHero?`: `boolean` - Show hero section skeleton (default: true)
- `sectionCount?`: `number` - Number of product sections (default: 3)
- `className?`: `string` - Additional CSS classes

## Usage Examples

### In Product Grid

```tsx
import { ProductGridSkeleton } from '@/components/skeleton';

{isLoading ? (
  <ProductGridSkeleton count={12} />
) : (
  <ProductGrid products={products} />
)}
```

### In Product Section

```tsx
import { ProductSectionSkeleton } from '@/components/skeleton';

{isLoading ? (
  <ProductSectionSkeleton productCount={6} />
) : (
  <ProductSection 
    title="Best Sellers"
    products={products}
  />
)}
```

### In Product Detail Page

```tsx
import { ProductDetailSkeleton } from '@/components/skeleton';
import { Suspense } from 'react';

<Suspense fallback={<ProductDetailSkeleton />}>
  <ProductDetail product={product} />
</Suspense>
```

### In Home Page

```tsx
import { HomeSectionSkeleton } from '@/components/skeleton';

{isLoading ? (
  <HomeSectionSkeleton sectionCount={3} />
) : (
  <HomePageContent />
)}
```

### Custom Skeleton

```tsx
import { Skeleton } from '@/components/skeleton';

<div className="space-y-4">
  <Skeleton variant="text" height={32} width={200} />
  <Skeleton variant="text" height={20} width={300} />
  <Skeleton variant="rectangular" height={200} width="100%" />
</div>
```

## Design Tokens

All skeletons use Tailwind config tokens:

### Colors
- Background: `bg-neutral-200` (skeleton color)
- Uses semantic color tokens from config

### Animation
- Pulse animation: `animate-pulse` (Tailwind built-in)
- Smooth and subtle for better UX

### Spacing
- Consistent with actual components
- Matches product card spacing and layout

## Best Practices

1. **Match Structure**: Skeleton should match the actual component structure
2. **Same Dimensions**: Use same sizing as real content
3. **Count**: Show reasonable number of skeletons (6-12 items)
4. **Accessibility**: All skeletons have `aria-hidden="true"`
5. **Performance**: Lightweight with CSS animations (no JS)
6. **Responsive**: Skeletons are responsive like actual components

## Accessibility

- All skeleton components include `aria-hidden="true"` to hide from screen readers
- Actual content should replace skeletons to maintain accessibility
- Screen readers will announce when real content loads

## Animation

The pulse animation is provided by Tailwind's built-in `animate-pulse` utility, which:
- Provides smooth fade in/out effect
- Respects `prefers-reduced-motion` (already handled in globals.css)
- Lightweight and performant
- No JavaScript required

