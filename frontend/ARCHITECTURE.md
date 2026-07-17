# Component Architecture

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.js                 # Root layout with providers
│   │   ├── page.js                   # Home page
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── ui-showcase/              # ✨ NEW: Component showcase
│   │   └── api/
│   │
│   ├── components/
│   │   ├── ui/                       # ✨ NEW: UI Component Library
│   │   │   ├── Button.js             # ✨ NEW
│   │   │   ├── Input.js              # ✨ NEW
│   │   │   ├── Badge.js              # ✨ NEW
│   │   │   ├── Dialog.js             # ✨ NEW
│   │   │   ├── Tooltip.js            # ✨ NEW
│   │   │   ├── Progress.js           # ✨ NEW
│   │   │   ├── Skeleton.js           # ✨ NEW
│   │   │   ├── Loading.js            # ✨ NEW
│   │   │   ├── Toaster.js            # ✨ NEW
│   │   │   ├── CommandPalette.js     # ✨ NEW
│   │   │   ├── ThemeSwitcher.js      # ✨ NEW
│   │   │   ├── Card.js               # Enhanced
│   │   │   ├── Icon.js
│   │   │   ├── MaterialIcon.js
│   │   │   └── index.js              # ✨ NEW: Central exports
│   │   │
│   │   ├── animations/               # ✨ NEW: Animation utilities
│   │   │   └── index.js              # ✨ NEW
│   │   │
│   │   ├── providers/                # ✨ NEW: Context providers
│   │   │   └── ThemeProvider.js      # ✨ NEW
│   │   │
│   │   ├── layout/
│   │   │   ├── TopNav.js             # Enhanced with new components
│   │   │   ├── Sidebar.js
│   │   │   └── TerminalLayout.js
│   │   │
│   │   ├── views/
│   │   │   ├── DashboardView.js
│   │   │   ├── MarketLiveView.js
│   │   │   ├── AIInsightsView.js
│   │   │   └── PortfoliosView.js
│   │   │
│   │   ├── widgets/
│   │   │   ├── KPIWidget.js
│   │   │   └── ChartWidgets.js
│   │   │
│   │   ├── MarketChart.js            # Enhanced with animations
│   │   ├── UnifiedFeedTable.js       # Enhanced with animations
│   │   ├── MarketMonitor.js
│   │   ├── PortfolioSummary.js
│   │   └── PredictionPanel.js
│   │
│   ├── lib/
│   │   ├── utils.js                  # ✨ NEW: Utility functions
│   │   ├── auth.js
│   │   ├── prisma.js
│   │   ├── redis.js
│   │   └── websocket.js
│   │
│   ├── hooks/
│   │   └── useMarketData.js
│   │
│   ├── services/
│   │   └── marketApi.js
│   │
│   ├── store/
│   │   └── market-store.js
│   │
│   └── types/
│
├── public/
├── UI_ENHANCEMENTS.md                # ✨ NEW: Full documentation
├── QUICK_REFERENCE.md                # ✨ NEW: Quick guide
├── ENHANCEMENT_SUMMARY.md            # ✨ NEW: Summary
├── package.json                      # Updated with new deps
└── next.config.js
```

---

## 🎨 Component Hierarchy

```
App Root
│
├─── ThemeProvider                    # ✨ NEW: Theme management
│    │
│    └─── SessionProvider
│         │
│         ├─── Page Content
│         │    │
│         │    ├─── TopNav            # Enhanced
│         │    │    ├─── CommandPalette    # ✨ NEW: Ctrl+K
│         │    │    └─── ThemeSwitcher     # ✨ NEW: Theme toggle
│         │    │
│         │    ├─── Sidebar
│         │    │
│         │    └─── Main Content
│         │         │
│         │         ├─── Views
│         │         │    ├─── DashboardView
│         │         │    ├─── MarketLiveView
│         │         │    ├─── AIInsightsView
│         │         │    └─── PortfoliosView
│         │         │
│         │         └─── Components
│         │              ├─── UnifiedFeedTable  # Enhanced
│         │              ├─── MarketChart       # Enhanced
│         │              ├─── MarketMonitor
│         │              └─── PortfolioSummary
│         │
│         └─── Toaster                # ✨ NEW: Global notifications
```

---

## 🧩 UI Component System

```
UI Component Library (@/components/ui)
│
├─── Basic Inputs
│    ├─── Button
│    │    ├─── 8 variants
│    │    ├─── 7 sizes
│    │    ├─── Loading state
│    │    └─── Icon support
│    │
│    └─── Input
│         ├─── Label & helper text
│         ├─── Error/success states
│         ├─── Icon slots
│         └─── Animated focus
│
├─── Feedback Components
│    ├─── Badge (7 variants)
│    ├─── Toast Notifications
│    ├─── Progress (linear & circular)
│    └─── Loading States
│         ├─── LoadingSpinner
│         ├─── LoadingDots
│         ├─── LoadingBar
│         ├─── LoadingPulse
│         ├─── FullPageLoader
│         ├─── PageLoader
│         ├─── ContentLoader
│         └─── SkeletonLoader
│
├─── Overlays
│    ├─── Dialog
│    │    ├─── DialogContent
│    │    ├─── DialogHeader
│    │    ├─── DialogTitle
│    │    ├─── DialogDescription
│    │    └─── DialogFooter
│    │
│    └─── Tooltip
│         ├─── TooltipTrigger
│         └─── TooltipContent
│
├─── Layout Components
│    ├─── Card
│    ├─── MetricCard
│    ├─── ChartCard
│    └─── Skeleton variants
│         ├─── SkeletonCard
│         ├─── SkeletonTable
│         ├─── SkeletonChart
│         └─── SkeletonStats
│
└─── Feature Components
     ├─── CommandPalette (Ctrl+K)
     └─── ThemeSwitcher
```

---

## 🎭 Animation System

```
Animation Library (@/components/animations)
│
├─── Wrapper Components
│    ├─── FadeIn
│    ├─── SlideIn (4 directions)
│    ├─── ScaleIn
│    ├─── Stagger
│    └─── ScrollReveal
│
├─── Motion Variants
│    ├─── fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight
│    ├─── scaleIn
│    ├─── slideInLeft, slideInRight, slideInUp, slideInDown
│    ├─── staggerContainer, staggerFast, staggerSlow
│    └─── hoverScale, hoverLift, hoverRotate
│
├─── Transition Presets
│    ├─── spring
│    ├─── smoothSpring
│    ├─── bouncy
│    ├─── smooth, fast, slow
│
└─── Loader Components
     ├─── PulseLoader
     └─── SpinLoader
```

---

## 🔧 Utility System

```
Utilities (@/lib/utils)
│
├─── Styling
│    └─── cn() - Merge Tailwind classes
│
├─── Formatting
│    ├─── formatCurrency()
│    ├─── formatPercentage()
│    └─── formatCompactNumber()
│
└─── Performance
     ├─── debounce()
     └─── throttle()
```

---

## 🎯 Feature Flow Diagrams

### Command Palette Flow
```
User presses Ctrl+K
    ↓
CommandPalette opens
    ↓
User types search query
    ↓
Results filtered in real-time
    ↓
User selects with arrow keys + Enter
    ↓
Action executed (navigate or command)
    ↓
CommandPalette closes
```

### Toast Notification Flow
```
Action triggered (e.g., save)
    ↓
toast.success("Saved!") called
    ↓
Toast appears with animation
    ↓
Auto-dismiss after 4s (or user closes)
    ↓
Toast exits with animation
```

### Theme Switching Flow
```
User clicks ThemeSwitcher
    ↓
Theme value toggled (light ↔ dark)
    ↓
next-themes updates context
    ↓
CSS variables updated
    ↓
All components re-render with new theme
    ↓
Preference saved to localStorage
```

### Loading State Flow
```
Component mounts / Data requested
    ↓
loading = true
    ↓
Show Skeleton / LoadingSpinner
    ↓
Data arrives
    ↓
loading = false
    ↓
Animate in actual content
```

---

## 📊 Data Flow

```
API Request
    ↓
Loading State (Skeleton)
    ↓
Data Response
    ↓
State Update
    ↓
Component Re-render
    ↓
Animate Content In
    ↓
User Interaction
    ↓
Feedback (Toast/Animation)
```

---

## 🎨 Design Token Flow

```
globals.css (@theme)
    ↓
CSS Variables (--color-*, --spacing-*, etc.)
    ↓
Tailwind Config
    ↓
Tailwind Classes (bg-primary, text-on-surface, etc.)
    ↓
Components
    ↓
Rendered UI
```

---

## 🔄 State Management

```
Component State (useState)
    ↓
User Interaction
    ↓
State Update
    ↓
Re-render with Animation
    ↓
Feedback (Toast/Visual)

Global State (Zustand)
    ↓
Multiple Components
    ↓
Shared State Updates
    ↓
All Subscribed Components Update
```

---

## 📱 Responsive Breakpoints

```
Mobile First Approach

xs: 0px       (default)
    ↓
sm: 640px     (Tablet portrait)
    ↓
md: 768px     (Tablet landscape)
    ↓
lg: 1024px    (Desktop)
    ↓
xl: 1280px    (Large desktop)
    ↓
2xl: 1536px   (Extra large)
```

---

## 🎯 Import Patterns

### Recommended Import Structure
```javascript
// 1. React & Next.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { motion } from "framer-motion";

// 3. UI Components
import { Button, Input, Dialog, toast } from "@/components/ui";

// 4. Animations
import { FadeIn, ScrollReveal } from "@/components/animations";

// 5. Utilities
import { cn, formatCurrency } from "@/lib/utils";

// 6. Local components
import { MarketChart } from "@/components/MarketChart";

// 7. Styles (if needed)
import styles from "./styles.module.css";
```

---

## 🚀 Performance Optimization

```
Code Splitting
    ↓
Lazy Loading Components
    ↓
Dynamic Imports
    ↓
Memoization (React.memo)
    ↓
useMemo / useCallback
    ↓
Debounce/Throttle Expensive Operations
    ↓
Reduced Motion Support
```

---

## ♿ Accessibility Flow

```
Component Renders
    ↓
Semantic HTML
    ↓
ARIA Attributes Added
    ↓
Keyboard Navigation Enabled
    ↓
Focus Management
    ↓
Screen Reader Announces
    ↓
User Interaction (Keyboard/Mouse)
    ↓
Visual & Audio Feedback
```

---

## 🔐 Type Safety (Future)

```
TypeScript Interface
    ↓
Component Props
    ↓
Type Checking
    ↓
Auto-completion
    ↓
Compile-time Errors
```

---

This architecture ensures:
- ✅ Modularity
- ✅ Reusability
- ✅ Maintainability
- ✅ Scalability
- ✅ Performance
- ✅ Accessibility
- ✅ Developer Experience
