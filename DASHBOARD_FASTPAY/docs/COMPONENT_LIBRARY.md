# FastPay Component Library Documentation

This document provides comprehensive documentation for the FastPay dashboard component library, including reusable UI components, design patterns, and usage examples.

## 📋 Table of Contents

- [Overview](#overview)
- [Design System](#design-system)
- [Core Components](#core-components)
- [Form Components](#form-components)
- [Data Display Components](#data-display-components)
- [Navigation Components](#navigation-components)
- [Feedback Components](#feedback-components)
- [Layout Components](#layout-components)
- [Animation Components](#animation-components)
- [Usage Guidelines](#usage-guidelines)

---

## Overview

The FastPay component library is built on top of Radix UI and Tailwind CSS, providing a comprehensive set of reusable components for the FastPay dashboard. The library follows modern React patterns and TypeScript best practices.

### Key Features

- **TypeScript Support**: Full TypeScript definitions for all components
- **Accessibility**: Built on Radix UI primitives for accessibility
- **Customizable**: Extensible theming and styling system
- **Performance**: Optimized for performance with lazy loading
- **Responsive**: Mobile-first responsive design
- **Animation**: Smooth animations and transitions

### Component Categories

| Category | Description | Examples |
|-----------|-------------|----------|
| **Core** | Basic UI building blocks | Button, Input, Card |
| **Forms** | Form-specific components | Form, Field, Select |
| **Data Display** | Data presentation components | Table, Badge, Avatar |
| **Navigation** | Navigation and routing | Tabs, Menu, Breadcrumb |
| **Feedback** | User feedback components | Toast, Alert, Modal |
| **Layout** | Layout and structure | Grid, Container, Sidebar |
| **Animation** | Animation utilities | SectionAnimator, ContentAnimator |

---

## Design System

### Color Palette

```css
/* Primary Colors */
--primary: 59 130 246;        /* Blue */
--primary-foreground: 255 255 255;

/* Secondary Colors */
--secondary: 107 114 128;      /* Gray */
--secondary-foreground: 255 255 255;

/* Accent Colors */
--accent: 99 102 241;          /* Indigo */
--accent-foreground: 255 255 255;

/* Status Colors */
--destructive: 239 68 68;       /* Red */
--destructive-foreground: 255 255 255;

--success: 34 197 94;           /* Green */
--success-foreground: 255 255 255;

--warning: 245 158 11;          /* Yellow */
--warning-foreground: 255 255 255;
```

### Typography

```css
/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing

```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

---

## Core Components

### Button

The Button component is the primary action component in the library.

```typescript
import { Button, ButtonProps } from '@/component/ui/button'

interface ExtendedButtonProps extends ButtonProps {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function ExtendedButton({
  children,
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  ...props
}: ExtendedButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center",
        props.className
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}
      <span className={cn("flex items-center gap-2", loading && "opacity-0")}>
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </span>
    </Button>
  )
}
```

**Usage Examples**:
```typescript
// Basic button
<Button>Click me</Button>

// Button with icon
<Button icon={<Plus className="h-4 w-4" />}>
  Add Item
</Button>

// Loading button
<Button loading>Processing...</Button>

// Button variants
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
```

### Input

Enhanced input component with validation and error handling.

```typescript
import { Input, InputProps } from '@/component/ui/input'

interface ExtendedInputProps extends InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function ExtendedInput({
  label,
  error,
  helperText,
  required,
  className,
  ...props
}: ExtendedInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <Input
        className={cn(
          error && "border-destructive focus:border-destructive",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}
```

**Usage Examples**:
```typescript
// Basic input
<ExtendedInput placeholder="Enter your name" />

// Input with label and validation
<ExtendedInput
  label="Email Address"
  type="email"
  required
  error="Invalid email address"
  helperText="We'll never share your email"
/>

// Number input
<ExtendedInput
  type="number"
  label="Quantity"
  min="1"
  max="100"
/>
```

### Card

Flexible card component for content grouping.

```typescript
import { Card, CardProps } from '@/component/ui/card'

interface ExtendedCardProps extends CardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  loading?: boolean;
}

export function ExtendedCard({
  title,
  description,
  actions,
  loading = false,
  children,
  className,
  ...props
}: ExtendedCardProps) {
  return (
    <Card className={cn("relative", className)} {...props}>
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {(title || description || actions) && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {actions && <div className="flex gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

**Usage Examples**:
```typescript
// Basic card
<ExtendedCard>
  <p>Card content goes here</p>
</ExtendedCard>

// Card with header and actions
<ExtendedCard
  title="Device Information"
  description="View and manage device settings"
  actions={
    <>
      <Button variant="outline" size="sm">Edit</Button>
      <Button size="sm">Save</Button>
    </>
  }
>
  <p>Device details...</p>
</ExtendedCard>

// Loading card
<ExtendedCard loading title="Loading...">
  <p>This content is loading...</p>
</ExtendedCard>
```

---

## Form Components

### Form

Comprehensive form component with validation and submission handling.

```typescript
import { Form, FormProps } from '@/component/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface ExtendedFormProps<T extends FieldValues> extends Omit<FormProps<T>, 'children'> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => void | Promise<void>;
  defaultValues?: Partial<T>;
  children: (methods: UseFormReturn<T>) => React.ReactNode;
}

export function ExtendedForm<T extends FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
  ...props
}: ExtendedFormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...methods} {...props}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {children(methods)}
      </form>
    </Form>
  )
}
```

**Usage Examples**:
```typescript
// Define schema
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
});

// Use form component
<ExtendedForm
  schema={userSchema}
  onSubmit={handleSubmit}
  defaultValues={{ name: "", email: "", age: 18 }}
>
  {({ control, formState: { errors } }) => (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <ExtendedInput
            {...field}
            label="Name"
            error={errors.name?.message}
          />
        )}
      />
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <ExtendedInput
            {...field}
            type="email"
            label="Email"
            error={errors.email?.message}
          />
        )}
      />
      <Button type="submit">Submit</Button>
    </div>
  )}
</ExtendedForm>
```

### Select

Enhanced select component with search and multi-select support.

```typescript
import { Select, SelectProps } from '@/component/ui/select'

interface ExtendedSelectProps extends SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  searchable?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export function ExtendedSelect({
  label,
  error,
  helperText,
  required,
  searchable = false,
  options,
  ...props
}: ExtendedSelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <Select {...props}>
        <SelectTrigger className={cn(error && "border-destructive")}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}
```

**Usage Examples**:
```typescript
// Basic select
<ExtendedSelect
  options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ]}
  placeholder="Choose an option"
/>

// Select with label and validation
<ExtendedSelect
  label="Country"
  required
  options={[
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
  ]}
  error="Please select a country"
/>
```

---

## Data Display Components

### Table

Enhanced table component with sorting, filtering, and pagination.

```typescript
import { Table, TableProps } from '@/component/ui/table'

interface Column<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface ExtendedTableProps<T> extends Omit<TableProps, 'children'> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    field: keyof T;
    direction: 'asc' | 'desc';
    onSort: (field: keyof T, direction: 'asc' | 'desc') => void;
  };
}

export function ExtendedTable<T>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  ...props
}: ExtendedTableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | null>(sorting?.field || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof T) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    sorting?.onSort(field, newDirection);
  };

  return (
    <div className="space-y-4">
      <Table {...props}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)}>
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(column.key)}
                    className="h-auto p-0 font-semibold"
                  >
                    {column.title}
                    {sortField === column.key && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  column.title
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.pageSize >= pagination.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Usage Examples**:
```typescript
interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline';
  battery: number;
  lastSeen: string;
}

const columns: Column<Device>[] = [
  {
    key: 'name',
    title: 'Device Name',
    sortable: true,
  },
  {
    key: 'status',
    title: 'Status',
    render: (value) => (
      <Badge variant={value === 'online' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    ),
  },
  {
    key: 'battery',
    title: 'Battery',
    render: (value) => `${value}%`,
  },
  {
    key: 'lastSeen',
    title: 'Last Seen',
    sortable: true,
  },
];

<ExtendedTable
  data={devices}
  columns={columns}
  loading={loading}
  pagination={{
    page: currentPage,
    pageSize: 20,
    total: totalCount,
    onPageChange: setCurrentPage,
  }}
  sorting={{
    field: 'name',
    direction: 'asc',
    onSort: handleSort,
  }}
/>
```

### Badge

Flexible badge component for status indicators.

```typescript
import { Badge, BadgeProps } from '@/component/ui/badge'

interface ExtendedBadgeProps extends BadgeProps {
  status?: 'success' | 'warning' | 'error' | 'info';
  pulse?: boolean;
}

export function ExtendedBadge({
  status,
  pulse = false,
  className,
  children,
  ...props
}: ExtendedBadgeProps) {
  const variantMap = {
    success: 'default',
    warning: 'secondary',
    error: 'destructive',
    info: 'outline',
  };

  return (
    <Badge
      variant={status ? variantMap[status] : props.variant}
      className={cn(
        pulse && "animate-pulse",
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  )
}
```

**Usage Examples**:
```typescript
// Basic badge
<ExtendedBadge>Active</ExtendedBadge>

// Status badges
<ExtendedBadge status="success">Online</ExtendedBadge>
<ExtendedBadge status="error">Error</ExtendedBadge>
<ExtendedBadge status="warning">Warning</ExtendedBadge>

// Pulsing badge
<ExtendedBadge pulse>New</ExtendedBadge>
```

---

## Navigation Components

### Tabs

Enhanced tabs component with smooth animations and keyboard navigation.

```typescript
import { Tabs, TabsProps } from '@/component/ui/tabs'

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface ExtendedTabsProps extends Omit<TabsProps, 'children'> {
  tabs: TabItem[];
  onTabChange?: (value: string) => void;
}

export function ExtendedTabs({
  tabs,
  onTabChange,
  ...props
}: ExtendedTabsProps) {
  return (
    <Tabs {...props} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-auto">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className="flex items-center gap-2"
          >
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            {tab.label}
            {tab.badge && (
              <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
                {tab.badge}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.value === props.value && props.children}
        </TabsContent>
      ))}
    </Tabs>
  )
}
```

**Usage Examples**:
```typescript
const tabs: TabItem[] = [
  { value: 'overview', label: 'Overview', icon: <Home className="h-4 w-4" /> },
  { value: 'devices', label: 'Devices', badge: '5' },
  { value: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

<ExtendedTabs
  tabs={tabs}
  value={activeTab}
  onTabChange={setActiveTab}
>
  <div>
    {/* Tab content */}
  </div>
</ExtendedTabs>
```

---

## Feedback Components

### Toast

Enhanced toast notification system with multiple types and actions.

```typescript
import { toast, ToastOptions } from '@/component/ui/use-toast'

interface ExtendedToastOptions extends Omit<ToastOptions, 'description'> {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export function showSuccessToast(options: ExtendedToastOptions) {
  return toast({
    ...options,
    description: options.description,
    action: options.action && {
      label: options.action.label,
      onClick: options.action.onClick,
    },
  });
}

export function showErrorToast(options: ExtendedToastOptions) {
  return toast({
    ...options,
    variant: 'destructive',
    description: options.description,
  });
}

export function showWarningToast(options: ExtendedToastOptions) {
  return toast({
    ...options,
    description: options.description,
  });
}
```

**Usage Examples**:
```typescript
// Success toast
showSuccessToast({
  title: "Success!",
  description: "Device created successfully",
  duration: 5000,
});

// Error toast
showErrorToast({
  title: "Error",
  description: "Failed to create device",
  action: {
    label: "Retry",
    onClick: () => retryCreateDevice(),
  },
});

// Warning toast
showWarningToast({
  title: "Warning",
  description: "Device battery is low",
});
```

---

## Layout Components

### Container

Responsive container component with max-width controls.

```typescript
interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Container({
  children,
  size = 'lg',
  className,
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}
```

**Usage Examples**:
```typescript
// Responsive container
<Container>
  <h1>Page Title</h1>
  <p>Page content...</p>
</Container>

// Sized container
<Container size="sm">
  <p>Narrow content layout</p>
</Container>
```

---

## Animation Components

### SectionAnimator

Advanced animation component for smooth section transitions.

```typescript
interface SectionAnimatorProps {
  children: React.ReactNode;
  sectionKey: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scale';
  delay?: number;
  duration?: number;
  className?: string;
}

export function SectionAnimator({
  children,
  sectionKey,
  animation = 'fadeIn',
  delay = 0,
  duration = 300,
  className,
}: SectionAnimatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setHasAnimated(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animationClasses = {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideInLeft: 'animate-slide-in-left',
    slideInRight: 'animate-slide-in-right',
    scale: 'animate-scale-in',
  };

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible ? animationClasses[animation] : 'opacity-0',
        className
      )}
      style={{ animationDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
```

**Usage Examples**:
```typescript
// Fade in animation
<SectionAnimator sectionKey="device-list" animation="fadeIn">
  <DeviceList />
</SectionAnimator>

// Slide up with delay
<SectionAnimator sectionKey="device-details" animation="slideUp" delay={200}>
  <DeviceDetails />
</SectionAnimator>

// Staggered animations
{devices.map((device, index) => (
  <SectionAnimator
    key={device.id}
    sectionKey={`device-${device.id}`}
    animation="slideInLeft"
    delay={index * 100}
  >
    <DeviceCard device={device} />
  </SectionAnimator>
))}
```

---

## Usage Guidelines

### Component Composition

```typescript
// Complex component composition
function DeviceManagement() {
  return (
    <Container size="xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Device Management</h1>
          <Button icon={<Plus className="h-4 w-4" />}>
            Add Device
          </Button>
        </div>
        
        <ExtendedTabs
          tabs={[
            { value: 'list', label: 'Device List' },
            { value: 'settings', label: 'Settings' },
          ]}
          value={activeTab}
          onTabChange={setActiveTab}
        >
          <SectionAnimator sectionKey={`tab-${activeTab}`} animation="fadeIn">
            {activeTab === 'list' && (
              <ExtendedCard>
                <ExtendedTable
                  data={devices}
                  columns={deviceColumns}
                  loading={loading}
                  pagination={pagination}
                />
              </ExtendedCard>
            )}
            
            {activeTab === 'settings' && (
              <ExtendedForm
                schema={settingsSchema}
                onSubmit={handleSettingsSubmit}
              >
                {({ control }) => (
                  <div className="space-y-4">
                    <FormField
                      control={control}
                      name="deviceName"
                      render={({ field }) => (
                        <ExtendedInput
                          {...field}
                          label="Device Name"
                          required
                        />
                      )}
                    />
                    <Button type="submit">Save Settings</Button>
                  </div>
                )}
              </ExtendedForm>
            )}
          </SectionAnimator>
        </ExtendedTabs>
      </div>
    </Container>
  );
}
```

### Best Practices

1. **Consistent Spacing**: Use the spacing scale consistently
2. **Semantic HTML**: Use appropriate HTML elements
3. **Accessibility**: Include proper ARIA labels and keyboard navigation
4. **Performance**: Use lazy loading for heavy components
5. **Error Handling**: Provide clear error states and messages
6. **Loading States**: Show loading indicators during async operations
7. **Responsive Design**: Test on all screen sizes
8. **Animation**: Use animations purposefully and sparingly

### TypeScript Best Practices

```typescript
// Define proper interfaces for component props
interface DeviceCardProps {
  device: Device;
  onEdit?: (device: Device) => void;
  onDelete?: (device: Device) => void;
  className?: string;
}

// Use generic types for reusable components
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

// Use discriminated unions for variant types
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

// Use proper typing for event handlers
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // Handle click
};
```

---

## Component Library Structure

```
src/component/
├── ui/                    # Base UI components (Radix UI)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── table.tsx
│   └── ...
├── extended/              # Extended components
│   ├── ExtendedButton.tsx
│   ├── ExtendedInput.tsx
│   ├── ExtendedTable.tsx
│   └── ...
├── layout/                # Layout components
│   ├── Container.tsx
│   ├── Sidebar.tsx
│   └── Header.tsx
├── animation/             # Animation components
│   ├── SectionAnimator.tsx
│   ├── ContentAnimator.tsx
│   └── ...
└── index.ts              # Component exports
```

---

## Testing Components

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ExtendedButton } from '@/component/extended/ExtendedButton';

describe('ExtendedButton', () => {
  it('renders correctly', () => {
    render(<ExtendedButton>Click me</ExtendedButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<ExtendedButton loading>Click me</ExtendedButton>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('opacity-0');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<ExtendedButton onClick={handleClick}>Click me</ExtendedButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react';
import { DeviceManagement } from '@/pages/DeviceManagement';

describe('DeviceManagement', () => {
  it('renders device list', async () => {
    render(<DeviceManagement />);
    
    expect(screen.getByText('Device Management')).toBeInTheDocument();
    expect(screen.getByText('Device List')).toBeInTheDocument();
    expect(screen.getByText('Add Device')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    render(<DeviceManagement />);
    
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByText('Device Name')).toBeInTheDocument();
  });
});
```

---

## Migration Guide

### From v1 to v2

1. **Import Changes**: Update import paths
2. **API Changes**: Review prop changes
3. **Styling**: Update Tailwind class names
4. **TypeScript**: Update type definitions

```typescript
// v1 imports
import { Button } from '@/component/ui/button';

// v2 imports
import { ExtendedButton } from '@/component/extended/ExtendedButton';
```

---

*This component library documentation serves as the comprehensive reference for all FastPay dashboard components. Keep this document updated with any component changes or additions.*
