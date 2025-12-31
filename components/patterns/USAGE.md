# UX Patterns Usage Guide

Complete guide for using reusable UI patterns across auth & user pages.

## Pattern Overview

### 1. Alert Messages
**Use for:** Page-level notifications (success, error, warning, info)

**Location:** Top of forms or page content

**Example:**
```tsx
import { Alert } from '@/components/patterns';

// Success message
{isSuccess && (
  <Alert 
    variant="success" 
    message="Profile updated successfully!" 
  />
)}

// Error message with title
{error && (
  <Alert 
    variant="error" 
    title="Error" 
    message={error} 
  />
)}
```

### 2. Loading States

#### Full Page/Section Loading
**Use for:** Loading entire sections or pages

```tsx
import { LoadingState } from '@/components/patterns';

{isLoading ? (
  <LoadingState 
    message="Loading orders..." 
    description="Please wait"
  />
) : (
  <OrdersList />
)}
```

#### Button Loading
**Use for:** Loading state in buttons

```tsx
import { ButtonLoading } from '@/components/patterns';

<Button disabled={isLoading}>
  {isLoading ? (
    <ButtonLoading loadingText="Saving...">Save Changes</ButtonLoading>
  ) : (
    'Save Changes'
  )}
</Button>
```

#### Inline Spinner
**Use for:** Small loading indicators

```tsx
import { LoadingSpinner } from '@/components/patterns';

<LoadingSpinner size="sm" variant="primary" />
```

### 3. Empty States
**Use for:** When no data is available

```tsx
import { EmptyState } from '@/components/patterns';
import { ShoppingBagIcon } from '@/components/svg';

<EmptyState
  icon={<ShoppingBagIcon className="h-12 w-12" />}
  title="No orders yet"
  description="When you place an order, it will appear here"
  action={<Button>Start Shopping</Button>}
/>
```

### 4. Field Errors
**Use for:** Form field validation errors

```tsx
import { FieldError } from '@/components/patterns';

<div className="space-y-2">
  <Label htmlFor="email" required>Email</Label>
  <Input
    id="email"
    aria-invalid={errors.email ? 'true' : 'false'}
    aria-describedby={errors.email ? 'email-error' : undefined}
    error={!!errors.email}
  />
  {errors.email && (
    <FieldError 
      id="email-error" 
      message={errors.email} 
    />
  )}
</div>
```

### 5. Disabled States
**Use for:** Disabling inputs/buttons during loading

```tsx
// Input disabled state
<Input 
  disabled={isLoading}
  // ... other props
/>

// Button disabled state
<Button 
  disabled={isLoading}
  aria-busy={isLoading}
>
  {/* content */}
</Button>
```

## Page-Specific Patterns

### Auth Pages (Login, Register, etc.)

**Pattern:**
1. Alert at top for errors
2. Form fields with FieldError below
3. Button with ButtonLoading
4. All inputs disabled during loading

**Example:**
```tsx
<form>
  {error && <Alert variant="error" message={error} />}
  
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input 
      id="email"
      disabled={isLoading}
      error={!!errors.email}
    />
    {errors.email && <FieldError message={errors.email} />}
  </div>
  
  <Button disabled={isLoading}>
    {isLoading ? <ButtonLoading>Saving...</ButtonLoading> : 'Submit'}
  </Button>
</form>
```

### User Pages (Settings, Security, etc.)

**Pattern:**
1. Alert at top for success/error
2. Card-based layout
3. LoadingState for section loading
4. EmptyState for no data
5. ButtonLoading for actions

**Example:**
```tsx
<div className="space-y-6">
  {isSuccess && <Alert variant="success" message="Updated!" />}
  {error && <Alert variant="error" message={error} />}
  
  <Card>
    {isLoading ? (
      <LoadingState message="Loading..." />
    ) : data.length === 0 ? (
      <EmptyState title="No data" />
    ) : (
      <DataList />
    )}
  </Card>
</div>
```

## State Management Pattern

**Standard state variables:**
```tsx
const isLoading = false;
const isSuccess = false;
const error = null as string | null;
const errors = {
  fieldName: null as string | null,
};
```

## Accessibility

All patterns include:
- ARIA labels and roles
- Screen reader support
- Keyboard navigation
- Focus management
- Semantic HTML

## Design Consistency

- All colors from Tailwind config
- Consistent spacing scale
- Typography tokens only
- No hardcoded values
- Responsive by default

