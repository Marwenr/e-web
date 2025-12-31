# UX Patterns

Reusable UI patterns for consistent states across auth & user pages.

## Components

### Alert
Displays alert messages with different variants (success, error, warning, info).

```tsx
import { Alert } from '@/components/patterns';

// Simple message
<Alert variant="error" message="Invalid credentials" />

// With title
<Alert 
  variant="success" 
  title="Success!" 
  message="Your profile has been updated."
/>
```

**Variants:** `success`, `error`, `warning`, `info`

### LoadingSpinner
Animated loading spinner with size and variant options.

```tsx
import { LoadingSpinner } from '@/components/patterns';

<LoadingSpinner size="md" variant="primary" />
```

**Sizes:** `sm`, `md`, `lg`  
**Variants:** `primary`, `success`, `neutral`

### LoadingState
Full loading state with spinner and message.

```tsx
import { LoadingState } from '@/components/patterns';

<LoadingState 
  message="Loading orders..." 
  description="Please wait while we fetch your data"
/>
```

### EmptyState
Displays empty state with icon, title, description, and optional action.

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

### FieldError
Displays field-level validation error messages.

```tsx
import { FieldError } from '@/components/patterns';

<FieldError 
  id="email-error" 
  message="Please enter a valid email address" 
/>
```

### ButtonLoading
Loading state for buttons with spinner and text.

```tsx
import { ButtonLoading } from '@/components/patterns';

<Button>
  {isLoading ? (
    <ButtonLoading loadingText="Saving...">Save Changes</ButtonLoading>
  ) : (
    'Save Changes'
  )}
</Button>
```

## Usage Guidelines

### Alert Messages
- Use for page-level success/error messages
- Place at top of form or page content
- Use appropriate variant for message type

### Loading States
- Use `LoadingState` for full-page or section loading
- Use `LoadingSpinner` for inline loading indicators
- Use `ButtonLoading` for button loading states

### Empty States
- Use when no data is available
- Include helpful description
- Provide action button when applicable

### Field Errors
- Display below form fields
- Associate with input via `id` and `aria-describedby`
- Use consistent error styling

## Design Tokens

All components use Tailwind config tokens:
- Colors: `success-*`, `error-*`, `warning-*`, `neutral-*`
- Typography: `text-body`, `text-body-sm`, `text-h4`
- Spacing: Consistent spacing scale
- No hardcoded values

