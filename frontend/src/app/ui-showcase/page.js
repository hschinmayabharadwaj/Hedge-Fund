"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Input,
  Badge,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Progress,
  CircularProgress,
  toast,
  LoadingSpinner,
  LoadingDots,
  Card,
  MetricCard,
} from "@/components/ui";
import { FadeIn, SlideIn, ScaleIn, Stagger, ScrollReveal } from "@/components/animations";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";

export default function UIShowcase() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [progress, setProgress] = useState(45);
  const [inputValue, setInputValue] = useState("");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-8 space-y-12">
        {/* Header */}
        <FadeIn>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-on-surface mb-2">
              UI Components Showcase
            </h1>
            <p className="text-on-surface-variant">
              Enhanced UI components with smooth animations and modern design
            </p>
          </div>
        </FadeIn>

        <div className="max-w-7xl mx-auto space-y-12">
          {/* Buttons Section */}
          <ScrollReveal>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-on-surface">Buttons</h2>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button loading>Loading</Button>
                <Button leftIcon={<MaterialIcon name="add" className="w-4 h-4" />}>
                  With Left Icon
                </Button>
                <Button rightIcon={<MaterialIcon name="arrow_forward" className="w-4 h-4" />}>
                  With Right Icon
                </Button>
                <Button
                  onClick={() => toast.success("Button clicked!")}
                >
                  Show Toast
                </Button>
              </div>
            </section>
          </ScrollReveal>

          {/* Inputs Section */}
          <ScrollReveal>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-on-surface">Inputs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  helperText="We'll never share your email."
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                />
                <Input
                  label="With Left Icon"
                  leftIcon={<MaterialIcon name="search" className="w-4 h-4" />}
                  placeholder="Search..."
                />
                <Input
                  label="Error State"
                  error="This field is required"
                  placeholder="Enter value"
                />
                <Input
                  label="Success State"
                  success
                  helperText="Looks good!"
                  placeholder="Enter value"
                  defaultValue="Valid input"
                />
              </div>
            </section>
          </ScrollReveal>

          {/* Badges Section */}
          <ScrollReveal>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-on-surface">Badges</h2>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="ghost">Ghost</Badge>
                <Badge animate variant="success">Animated</Badge>
              </div>
            </section>
          </ScrollReveal>

          {/* Progress Section */}
          <ScrollReveal>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-on-surface">Progress</h2>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <p className="text-sm text-on-surface-variant mb-2">Linear Progress</p>
                  <Progress value={progress} animated showLabel />
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                      Decrease
                    </Button>
                    <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                      Increase
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant mb-2">Circular Progress</p>
                  <CircularProgress value={progress} />
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Loading States Section */}
          <ScrollReveal>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-on-surface">Loading States</h2>
              <div className="flex flex-wrap gap-8 items-center">
                <div className="space-y-2">
                  <p className="text-sm text-on-surface-variant">Spinner Small</p>
                  <LoadingSpinner size="sm" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-on-surface-variant">Spinner Medium</p>
                  <LoadingSpinner size="md" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-on-surface-variant">Spinner Large</p>
                  <LoadingSpinner size="lg" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-on-surface-variant">Loading Dots</p>
                  <LoadingDots />
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Cards Section */}
          <ScrollReveal>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-on-surface">Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Revenue"
                  value="$124,563"
                  change="+12.5%"
                  icon="trending_up"
                  positive
                />
                <MetricCard
                  title="Active Users"
                  value="8,456"
                  change="+23.1%"
                  icon="people"
                  positive
                />
                <MetricCard
                  title="Conversion Rate"
                  value="3.24%"
                  change="-2.4%"
                  icon="show_chart"
                />
                <MetricCard
                  title="Alerts"
                  value="12"
                  change="Critical"
                  icon="warning"
                  warning
                />
              </div>
            </section>
          </ScrollReveal>

          {/* Skeleton Section */}
          <ScrollReveal>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-on-surface">Skeleton Loaders</h2>
              <div className="space-y-4 max-w-2xl">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
            </section>
          </ScrollReveal>

          {/* Dialog Section */}
          <ScrollReveal>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-on-surface">Dialog</h2>
              <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogDescription>
                      This is a sample dialog with smooth animations. Are you sure you want to proceed?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        toast.success("Action confirmed!");
                        setDialogOpen(false);
                      }}
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </section>
          </ScrollReveal>

          {/* Tooltips Section */}
          <ScrollReveal>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-on-surface">Tooltips</h2>
              <div className="flex flex-wrap gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This is a tooltip</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">
                      <MaterialIcon name="info" className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More information here</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </section>
          </ScrollReveal>

          {/* Toast Notifications Section */}
          <ScrollReveal>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-on-surface">Toast Notifications</h2>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => toast.success("Success message!")}>
                  Success Toast
                </Button>
                <Button onClick={() => toast.error("Error occurred!")}>
                  Error Toast
                </Button>
                <Button onClick={() => toast.warning("Warning message!")}>
                  Warning Toast
                </Button>
                <Button onClick={() => toast.info("Information message!")}>
                  Info Toast
                </Button>
                <Button
                  onClick={() =>
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 2000)),
                      {
                        loading: "Loading...",
                        success: "Completed!",
                        error: "Failed!",
                      }
                    )
                  }
                >
                  Promise Toast
                </Button>
              </div>
            </section>
          </ScrollReveal>

          {/* Animation Examples Section */}
          <ScrollReveal>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-on-surface">Animations</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FadeIn delay={0}>
                  <Card className="p-6">
                    <h3 className="font-semibold text-on-surface mb-2">Fade In</h3>
                    <p className="text-sm text-on-surface-variant">
                      Smooth fade-in animation
                    </p>
                  </Card>
                </FadeIn>
                <SlideIn direction="up" delay={0.1}>
                  <Card className="p-6">
                    <h3 className="font-semibold text-on-surface mb-2">Slide In</h3>
                    <p className="text-sm text-on-surface-variant">
                      Slides in from bottom
                    </p>
                  </Card>
                </SlideIn>
                <ScaleIn delay={0.2}>
                  <Card className="p-6">
                    <h3 className="font-semibold text-on-surface mb-2">Scale In</h3>
                    <p className="text-sm text-on-surface-variant">
                      Scales up with fade
                    </p>
                  </Card>
                </ScaleIn>
              </div>
            </section>
          </ScrollReveal>
        </div>
      </div>
    </TooltipProvider>
  );
}
