# NexaStock Frontend Architecture (Current State)

This document explains what is currently implemented in the frontend, including the route structure, the main user flows, and how interaction buttons navigate through the app.

---

## 1. Overall frontend setup

The frontend is built as a React + TypeScript web app using:
- TanStack Router for route-based navigation
- TanStack Query for client-side data fetching context
- Motion for animation
- shadcn/ui style components
- Lucide icons
- a custom glassmorphism/dark UI system

The app currently contains:
- a public marketing/landing page
- authentication pages for sign in and account creation
- an onboarding flow for first-time setup
- a full dashboard area with analytics, inventory, AI, stores, POS, and settings
- a standalone POS screen designed to feel like a real checkout system

---

## 2. Route map (currently implemented)

The frontend currently exposes these routes:

### Public / marketing routes
1. /  
   - Landing page
   - Shows the main marketing experience
   - Includes:
     - top navigation
     - hero section
     - feature highlights
     - AI section
     - pricing
     - footer
   - Main CTA buttons:
     - Start Free Trial → goes to /register
     - Open Dashboard → goes to /dashboard
     - Sign in → goes to /login

2. /login
   - Sign-in page
   - Has email/password form
   - Has social buttons (Google, Microsoft)
   - Links:
     - back to home
     - create account → /register

3. /register
   - Free trial / account creation page
   - Has fields for:
     - full name
     - work email
     - company
     - password
   - CTA:
     - Create workspace → /onboarding

4. /onboarding
   - Multi-step onboarding flow
   - Steps:
     - Organization
     - Warehouse
     - Stores
     - AI preferences
   - User actions:
     - click step badges to jump to previous steps
     - Back button moves previous step
     - Continue button moves forward
     - Launch workspace → /dashboard

### App / dashboard routes
5. /dashboard
   - Main overview screen
   - Uses the shared dashboard layout
   - Shows:
     - KPI cards
     - revenue and demand charts
     - AI recommendations
     - top products
     - alerts

6. /inventory
   - Inventory management screen
   - Shows:
     - SKU totals
     - inventory value
     - low stock / out-of-stock indicators
     - product catalog table
   - Actions:
     - Filter
     - Export
     - Add product

7. /ai
   - AI Center
   - Shows:
     - AI ask bar
     - AI-generated insights cards
     - autonomous agents
     - model performance metrics
   - Main interaction:
     - Ask button (UI placeholder)
     - suggestion chips for AI prompts

8. /stores
   - Stores and warehouses overview
   - Shows cards for each location
   - Includes:
     - store/warehouse name
     - city
     - type
     - health score
     - revenue
     - staff count
   - Action:
     - Add location

9. /analytics
   - Analytics dashboard
   - Shows:
     - revenue overview cards
     - 12-week revenue trend chart
     - category revenue bar chart
     - regional revenue bar chart

10. /settings
   - Workspace settings page
   - Shows:
     - organization settings
     - team & roles
     - role-based member cards
   - Action:
     - Invite member

11. /pos
   - POS / checkout screen
   - This page is implemented as a full-screen checkout experience
   - It is not wrapped in the same dashboard sidebar shell
   - It is designed to behave like a real store terminal

---

## 3. Navigation architecture

### 3.1 Landing page navigation
The landing page is structured around a fixed top navigation bar.

Main clickable paths from the landing view:
- Logo → /
- Sign in → /login
- Open Dashboard → /dashboard
- Platform / Industries / AI Center / Pricing → anchor links on the page

Hero section CTAs:
- Start Free Trial → /register
- Book a demo → currently visual/button-only, no route attached yet

---

### 3.2 Authentication and onboarding flow
The current user journey is:

1. Landing page
2. Start Free Trial → /register
3. Create workspace → /onboarding
4. Complete onboarding steps
5. Launch workspace → /dashboard

Alternative path:
1. Landing page
2. Sign in → /login
3. (currently form-only, no real authentication logic yet)

This means the user flow is currently built as a polished front-end onboarding flow rather than a fully connected backend auth system.

---

### 3.3 Dashboard navigation
Inside the app shell, the main navigation is handled by the shared dashboard layout.

The left sidebar navigation includes:
- Overview → /dashboard
- Inventory → /inventory
- AI Center → /ai
- Stores → /stores
- POS → /pos
- Analytics → /analytics
- Settings → /settings

This layout also includes:
- search box
- notification bell
- profile chip
- AI assistant card at the bottom with Open AI → /ai

So the app is unified under a shared shell, except the POS route, which opens as its own full-screen interface.

---

## 4. Button-click interaction map

### Landing page buttons
- Navbar “Sign in” → navigates to /login
- Navbar “Open Dashboard” → navigates to /dashboard
- Hero “Start Free Trial” → navigates to /register
- Other landing buttons are mostly visual or placeholder elements

### Register page
- “Create workspace” → navigates to /onboarding

### Onboarding page
- Step buttons on the left → jump to any completed or current step
- “Back” → moves to previous onboarding step
- “Continue” → moves to next onboarding step
- “Launch workspace” → navigates to /dashboard

### Dashboard pages
- Sidebar links → switch between app screens
- “Open AI” card → navigates to /ai
- KPI cards and recommendation cards are interactive visuals, not yet connected to real API actions

### Inventory page
- Filter → currently UI-only
- Export → currently UI-only
- Add product → currently UI-only

### AI page
- Ask button → UI placeholder for AI prompt submission
- suggestion chips → sample AI prompts for future AI interactions

### Stores page
- Add location → UI-only placeholder

### Settings page
- Invite member → UI-only placeholder

### POS page
- Product category chips → filter catalog
- Product cards → add item to cart
- “+” / “-” buttons in cart → increase or decrease quantity
- Trash icon → remove item
- Payment buttons (Card / UPI / Cash) → UI-only payment method choices
- Charge button → computes total and is presented as checkout action

---

## 5. POS route behavior (important)

The POS route is one of the most notable current implementations.

### What makes it special
- It uses a full-screen layout with:
  - h-screen container
  - top branded POS header
  - full-height catalog area
  - separate cart sidebar
- It is designed to feel like an actual point-of-sale machine rather than a normal dashboard page.
- The page is not placed inside the shared DashboardLayout shell.
- It uses:
  - barcode/search input
  - category chips
  - product cards
  - animated cart updates
  - live subtotal / GST / total calculation

### Current POS flow
1. User opens /pos.
2. The page renders as a full-screen terminal experience.
3. User can type a product name or scan/search a SKU.
4. User taps a product card to add it to the cart.
5. Cart updates live with quantity price totals.
6. Side panel shows:
   - subtotal
   - GST
   - final total
7. Payment buttons appear for Card / UPI / Cash.
8. Charge button is presented as the checkout action.

This is why the POS screen feels “full-screen” and retail-focused: it intentionally uses the entire viewport to simulate a real cashier terminal.

---

## 6. Current implementation status

The current frontend is mostly a polished prototype / product mockup with:
- route-based page structure
- visual dashboard and analytics screens
- interactive buttons and card states
- static demo data for products, stores, inventory, and insights
- a full-screen POS workflow simulation

What is not fully implemented yet:
- real login / registration backend
- real inventory CRUD
- real AI model integration
- real payment processing
- live data sync from a backend
- persistent user sessions

---

## 7. Summary

The frontend currently contains:
- a public landing site
- sign-in and sign-up pages
- onboarding setup flow
- an internal dashboard with 6 main modules
- a full-screen POS terminal experience

The architecture is currently centered around:
- route-driven screens
- shared dashboard layout for most app pages
- a standalone POS route for retail checkout behavior
- button-driven navigation using TanStack Router links

This is the current shape of the product as implemented in the frontend.