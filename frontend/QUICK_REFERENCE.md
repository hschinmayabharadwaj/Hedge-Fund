# UI Components Quick Reference

## 🚀 Quick Import Guide

### All Components
```jsx
import {
  // Buttons & Inputs
  Button, Input,
  
  // Feedback
  Badge, toast, Toaster,
  
  // Overlays
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
  
  // Loading
  Skeleton, SkeletonCard, SkeletonTable,
  LoadingSpinner, LoadingDots, FullPageLoader,
  Progress, CircularProgress,
  
  // Navigation
  CommandPalette, ThemeSwitcher,
  
  // Cards
  Card, MetricCard, ChartCard,
} from "@/components/ui";

// Animations
import {
  FadeIn, SlideIn, ScaleIn, Stagger, ScrollReveal,
  fadeIn, fadeInUp, scaleIn, hoverScale,
  spring, smooth, fast,
} from "@/components/animations";

// Utilities
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
```

---

## 📦 Component Cheatsheet

### Button
```jsx
<Button variant="default|secondary|destructive|outline|ghost|link|success|warning"
        size="sm|default|lg|xl|icon"
        loading={false}
        leftIcon={<Icon />}
        rightIcon={<Icon />}>
  Click me
</Button>
```

### Input
```jsx
<Input label="Email"
       type="text"
       placeholder="Enter..."
       error="Error message"
       success
       helperText="Helper text"
       leftIcon={<Icon />}
       rightIcon={<Icon />}
       fullWidth />
```

### Badge
```jsx
<Badge variant="default|secondary|destructive|success|warning|outline|ghost"
       animate>
  Status
</Badge>
```

### Dialog
```jsx
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Toast
```jsx
import { toast } from "@/components/ui";

toast.success("Success!");
toast.error("Error!");
toast.warning("Warning!");
toast.info("Info!");

toast.promise(promise, {
  loading: "Loading...",
  success: "Done!",
  error: "Failed!"
});
```

### Progress
```jsx
<Progress value={75} animated showLabel />
<CircularProgress value={65} size={120} showLabel />
```

### Tooltip
```jsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover</TooltipTrigger>
    <TooltipContent>Info</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Loading
```jsx
<LoadingSpinner size="sm|md|lg|xl" />
<LoadingDots />
<FullPageLoader message="Loading..." />
<Skeleton className="h-4 w-32" />
<SkeletonTable rows={5} columns={4} />
```

### Cards
```jsx
<Card hover glass gradient>
  Content
</Card>

<MetricCard title="Revenue"
            value="$124K"
            change="+12.5%"
            icon="trending_up"
            positive />

<ChartCard title="Sales"
           timeframeOptions={["1D", "1W", "1M"]}
           timeframeValue={timeframe}
           onTimeframeChange={setTimeframe}>
  <Chart />
</ChartCard>
```

---

## 🎭 Animation Quick Patterns

### Fade In
```jsx
<FadeIn delay={0.2}>
  <Component />
</FadeIn>
```

### Slide In
```jsx
<SlideIn direction="up|down|left|right" delay={0}>
  <Component />
</SlideIn>
```

### Scale In
```jsx
<ScaleIn delay={0}>
  <Component />
</ScaleIn>
```

### Stagger Children
```jsx
<Stagger staggerDelay={0.1}>
  {items.map(item => <Item key={item.id} />)}
</Stagger>
```

### Scroll Reveal
```jsx
<ScrollReveal threshold={0.1}>
  <Section />
</ScrollReveal>
```

### Manual Animations
```jsx
<motion.div
  variants={fadeInUp}
  initial="initial"
  animate="animate"
  whileHover={hoverScale}
  transition={spring}>
  Content
</motion.div>
```

---

## 🎨 Utility Functions

### Class Names
```jsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  "conditional-class"
)} />
```

### Formatting
```jsx
import { formatCurrency, formatPercentage, formatCompactNumber } from "@/lib/utils";

formatCurrency(1234.56)           // "$1,234.56"
formatPercentage(12.5)            // "+12.50%"
formatCompactNumber(1500000)      // "1.50M"
```

### Debounce/Throttle
```jsx
import { debounce, throttle } from "@/lib/utils";

const debouncedSearch = debounce(search, 500);
const throttledScroll = throttle(handleScroll, 100);
```

---

## ⌨️ Keyboard Shortcuts

- `Ctrl+K` / `Cmd+K` - Open Command Palette
- `Esc` - Close modals/dialogs
- `Tab` / `Shift+Tab` - Navigate focusable elements
- `Enter` - Confirm/select
- `Arrow Keys` - Navigate lists

---

## 🎯 Common Patterns

### Loading State
```jsx
const [loading, setLoading] = useState(true);

if (loading) return <FullPageLoader />;

return <Content />;
```

### Form with Validation
```jsx
<form onSubmit={handleSubmit}>
  <Input
    label="Email"
    type="email"
    error={errors.email}
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  <Button type="submit" loading={submitting}>
    Submit
  </Button>
</form>
```

### Confirmation Dialog
```jsx
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Delete</Button>

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogDescription>
        Are you sure? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Success Feedback
```jsx
const handleSave = async () => {
  try {
    await saveData();
    toast.success("Saved successfully!");
  } catch (error) {
    toast.error("Failed to save");
  }
};
```

### Animated List
```jsx
<Stagger staggerDelay={0.05}>
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      variants={fadeInUp}
      whileHover={hoverLift}>
      <ItemCard item={item} />
    </motion.div>
  ))}
</Stagger>
```

---

## 🔥 Pro Tips

1. **Use `cn()` for conditional classes**
   ```jsx
   className={cn("base", condition && "active")}
   ```

2. **Combine animations**
   ```jsx
   <motion.div variants={fadeInUp} whileHover={hoverScale}>
   ```

3. **Skeleton matching**
   Match skeleton dimensions to actual content for smooth transitions

4. **Toast actions**
   ```jsx
   toast.success("Deleted", {
     action: {
       label: "Undo",
       onClick: () => restore()
     }
   });
   ```

5. **Theme-aware components**
   Use CSS variables for colors to automatically support theme switching

6. **Accessibility**
   Always include labels, ARIA attributes, and keyboard navigation

---

## 📱 Responsive Examples

### Mobile-First Cards
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <MetricCard ... />
</div>
```

### Conditional Rendering
```jsx
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

---

## 🎨 Design Tokens

### Colors
- `bg-background` - Main background
- `bg-surface` - Card backgrounds
- `text-on-surface` - Primary text
- `text-on-surface-variant` - Secondary text
- `text-primary` - Brand blue
- `text-secondary` - Success green
- `text-tertiary` - Error red

### Spacing
- `p-4` `p-6` `p-8` - Common padding
- `gap-2` `gap-4` `gap-6` - Common gaps
- `space-y-4` - Vertical spacing

### Borders
- `border-outline` - Standard borders
- `rounded-md` `rounded-lg` `rounded-xl` - Border radius

---

## 🚀 Performance Tips

1. Use `React.memo()` for expensive components
2. Lazy load heavy components
3. Debounce search inputs
4. Use `AnimatePresence` for exit animations
5. Respect `useReducedMotion()` for accessibility

---

## 📚 Next Steps

- Check out `/ui-showcase` for live examples
- Read `UI_ENHANCEMENTS.md` for detailed docs
- Browse component source code for advanced usage
- Experiment and customize!

---

**Happy coding! 🎉**
