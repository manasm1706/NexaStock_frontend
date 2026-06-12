# NexaStock Frontend Engineering Standards

## Purpose

This document defines the frontend architecture, design system, component standards, styling conventions, naming rules, and engineering principles for the NexaStock platform.

All future frontend code must follow these standards.

This is a mandatory engineering reference for all contributors and AI coding assistants.

---

# CORE PRINCIPLES

NexaStock is a premium enterprise SaaS platform.

The frontend should feel:

* modern
* intelligent
* premium
* scalable
* operationally sophisticated
* AI-native

Inspired by:

* Linear
* Stripe
* Vercel
* Framer
* Arc Browser
* Apple-level polish

The frontend should NEVER feel:

* template-based
* bootstrap-like
* cluttered
* inconsistent
* overly colorful
* legacy ERP-style

---

# PRIMARY ENGINEERING GOALS

The frontend architecture must:

* centralize styling
* centralize reusable UI logic
* avoid duplicated code
* enforce consistency
* scale cleanly
* support rapid feature expansion

Pages should compose reusable systems instead of redefining UI repeatedly.

---

# TECH STACK

Frontend stack:

* React
* TypeScript
* TanStack Router
* TanStack Query
* Tailwind CSS
* Framer Motion
* shadcn/ui patterns
* Lucide Icons

---

# FOLDER STRUCTURE

```txt
src/
│
├── app/
├── routes/
├── layouts/
├── components/
├── hooks/
├── lib/
├── styles/
├── types/
└── data/
```

---

# COMPONENT ORGANIZATION

```txt
components/
│
├── ui/
├── dashboard/
├── inventory/
├── analytics/
├── ai/
├── stores/
├── pos/
├── auth/
├── onboarding/
└── landing/
```

Each feature module should contain:

* components
* hooks
* constants
* types
* utilities

Avoid giant single-file pages.

---

# DESIGN SYSTEM RULES

## NEVER hardcode:

* colors
* spacing
* shadows
* blur styles
* border radius
* typography scales
* animation timing

Everything must come from:

* shared tokens
* reusable variants
* centralized utilities

---

# THEME TOKENS

All visual values must use centralized tokens.

## Token Categories

### Colors

* primary
* secondary
* accent
* success
* warning
* danger
* surface
* surfaceElevated
* glassSurface
* borderSubtle
* textPrimary
* textSecondary

### Radius

* radius-sm
* radius-md
* radius-lg
* radius-xl
* radius-2xl

### Spacing

* space-xs
* space-sm
* space-md
* space-lg
* space-xl

### Motion

* transition-fast
* transition-base
* transition-slow

### Glass

* glass-card
* glass-panel
* glass-navbar
* glass-sidebar

---

# BUTTON SYSTEM

All buttons MUST use the shared Button component.

Never manually style buttons unless absolutely necessary.

Usage:

```tsx
<Button variant="primary" size="md" />
```

## Supported Variants

* primary
* secondary
* ghost
* outline
* destructive
* success
* premiumGradient
* ai
* pos
* icon

## Supported Sizes

* sm
* md
* lg
* xl
* icon

## Supported Features

* loading state
* disabled state
* active state
* leftIcon
* rightIcon
* motion interactions

---

# CARD SYSTEM

All dashboard and feature sections must use reusable card primitives.

Examples:

* GlassCard
* DashboardCard
* MetricCard
* AnalyticsCard
* AIInsightCard
* FloatingCard

Cards should share:

* radius
* blur
* elevation
* borders
* hover motion
* transition behavior

---

# TYPOGRAPHY SYSTEM

Typography must be standardized.

Use reusable primitives:

* PageTitle
* SectionTitle
* MetricValue
* Caption
* Label
* GradientText

Avoid random text sizing.

---

# LAYOUT RULES

## DashboardLayout

Owns:

* sidebar
* navbar
* search
* notifications
* command palette
* page container

Pages should only render content.

## AuthLayout

Reusable auth shell.

## POSLayout

Fullscreen isolated retail experience.

---

# PAGE STRUCTURE

Each major page should follow:

```txt
feature/
│
├── components/
├── hooks/
├── constants/
├── types/
└── page.tsx
```

---

# STYLING RULES

## DO NOT:

* repeat giant Tailwind class strings
* inline massive styles repeatedly
* redefine glassmorphism styles
* hardcode gradients
* duplicate motion configs

## DO:

* use CVA (class-variance-authority)
* use shared cn() utility
* use reusable wrappers
* extract reusable variants

---

# ANIMATION RULES

All motion presets should be centralized.

Location:

```txt
lib/animations/
```

Examples:

* fadeIn
* slideUp
* staggerContainer
* hoverLift
* floatingAnimation
* modalTransition
* sidebarTransition

Pages should import motion presets.

---

# NAMING CONVENTIONS

## Components

PascalCase

Examples:

* InventoryTable
* DashboardSidebar
* AIInsightCard

## Hooks

camelCase prefixed with use

Examples:

* useInventoryFilters
* useDashboardMetrics

## Constants

UPPER_SNAKE_CASE

## Utilities

camelCase

## Folders

kebab-case

---

# RESPONSIVENESS RULES

Responsive behavior must be standardized.

Avoid random breakpoints.

Use shared:

* containers
* spacing rules
* responsive grids
* adaptive layouts

The app must support:

* desktop
* laptop
* tablet
* mobile
* ultrawide

---

# ICON RULES

Use standardized icon wrappers.

Examples:

* NavIcon
* MetricIcon
* StatusIcon

Maintain consistent:

* stroke width
* sizing
* color hierarchy

---

# POS SYSTEM RULES

The POS route is a fullscreen isolated retail workflow.

It should:

* feel instant
* touch-friendly
* operational
* responsive
* optimized for cashier usage

Avoid dashboard-like layouts inside POS.

---

# AI CENTER RULES

AI experiences should feel:

* futuristic
* intelligent
* conversational
* operationally useful

Avoid generic chatbot UI.

Use:

* insight cards
* reasoning sections
* forecasting visuals
* recommendation systems

---

# DASHBOARD EXPERIENCE

Dashboards should:

* prioritize operational clarity
* use rich analytics
* support interaction
* support role-based workflows

Avoid clutter.

---

# CLEAN CODE RULES

Always:

* remove dead code
* remove duplicated components
* extract reusable logic
* separate concerns properly
* maintain strict typing
* prefer composition over duplication

---

# FINAL ENGINEERING STANDARD

Every new component or page should feel like it belongs to:

* the same product
* the same design system
* the same motion system
* the same engineering architecture

The NexaStock frontend should look and feel like a billion-dollar enterprise SaaS platform built by a senior frontend engineering team.
