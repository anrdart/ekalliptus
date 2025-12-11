# Requirements Document

## Introduction

This document specifies the requirements for redesigning the Ekalliptus customer website UI/UX to align with the admin dashboard design system. The goal is to create a cohesive visual identity across both applications while maintaining the customer website's unique marketing-focused purpose. The redesign will synchronize color schemes, typography, component styles, and interaction patterns between the customer-facing website and the admin dashboard.

## Glossary

- **Customer_Website**: The Vite + React public-facing website where customers browse services and submit orders
- **Admin_Dashboard**: The Next.js admin panel used by staff to manage orders and payments
- **Design_System**: The collection of CSS variables, color tokens, component styles, and UI patterns that define the visual identity
- **Brand_Green**: The primary brand color (HSL 142 71% 45%) used across both applications
- **Glass_Panel**: A semi-transparent UI element with backdrop blur effect used for cards and overlays
- **Theme_Toggle**: A UI control that switches between light and dark color modes
- **Status_Badge**: A colored label component indicating order or payment status

## Requirements

### Requirement 1

**User Story:** As a customer, I want the website to have a consistent visual identity with the admin dashboard, so that I recognize the Ekalliptus brand across all touchpoints.

#### Acceptance Criteria

1. WHEN the Customer_Website loads THEN the Design_System SHALL use the same Brand_Green primary color (HSL 142 71% 45%) as the Admin_Dashboard
2. WHEN viewing any page THEN the Customer_Website SHALL display typography with the same font weights and letter-spacing as the Admin_Dashboard
3. WHEN the user toggles between light and dark themes THEN the Customer_Website SHALL use the same color token values as the Admin_Dashboard for background, foreground, card, and muted colors
4. WHEN rendering UI components THEN the Customer_Website SHALL use the same border-radius value (0.5rem) as the Admin_Dashboard

### Requirement 2

**User Story:** As a customer, I want to see the Ekalliptus logo consistently displayed, so that I can easily identify the brand.

#### Acceptance Criteria

1. WHEN the navigation header renders THEN the Customer_Website SHALL display the EkalliptusLogo component matching the Admin_Dashboard SVG logo design
2. WHEN the logo appears in different contexts THEN the Customer_Website SHALL support both "full" and "icon" logo variants as defined in the Admin_Dashboard
3. WHEN the theme changes THEN the logo colors SHALL adapt using the same CSS class patterns (text-primary, text-primary-foreground) as the Admin_Dashboard

### Requirement 3

**User Story:** As a customer, I want buttons and interactive elements to look and behave consistently, so that I have a familiar experience across the platform.

#### Acceptance Criteria

1. WHEN rendering primary buttons THEN the Customer_Website SHALL use the same button variant styles (default, destructive, outline, secondary, ghost, link) as the Admin_Dashboard
2. WHEN a button is in loading state THEN the Customer_Website SHALL display a Loader2 spinner icon with the same animation as the Admin_Dashboard
3. WHEN hovering over buttons THEN the Customer_Website SHALL apply the same hover state transitions (bg-primary/90) as the Admin_Dashboard
4. WHEN buttons are disabled THEN the Customer_Website SHALL apply the same disabled styles (pointer-events-none, opacity-50) as the Admin_Dashboard

### Requirement 4

**User Story:** As a customer, I want cards and content containers to have a modern, clean appearance, so that information is easy to read and visually appealing.

#### Acceptance Criteria

1. WHEN rendering Card components THEN the Customer_Website SHALL use the same card structure (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter) as the Admin_Dashboard
2. WHEN displaying cards THEN the Customer_Website SHALL apply the same shadow and border styles (rounded-lg border bg-card shadow-sm) as the Admin_Dashboard
3. WHEN cards contain forms THEN the Customer_Website SHALL use the same spacing patterns (space-y-1.5 for headers, p-6 for content) as the Admin_Dashboard

### Requirement 5

**User Story:** As a customer, I want to see order status clearly indicated, so that I understand the current state of my orders.

#### Acceptance Criteria

1. WHEN displaying order status THEN the Customer_Website SHALL use the StatusBadge component with the same color coding as the Admin_Dashboard
2. WHEN showing "waiting_dp" status THEN the StatusBadge SHALL display yellow background (bg-yellow-100 text-yellow-800) matching the Admin_Dashboard
3. WHEN showing "dp_paid" status THEN the StatusBadge SHALL display blue background (bg-blue-100 text-blue-800) matching the Admin_Dashboard
4. WHEN showing "onsite_paid" or completed status THEN the StatusBadge SHALL display green background (bg-green-100 text-green-800) matching the Admin_Dashboard
5. WHEN showing "cancelled" status THEN the StatusBadge SHALL display red background (bg-red-100 text-red-800) matching the Admin_Dashboard

### Requirement 6

**User Story:** As a customer, I want smooth loading states and transitions, so that the website feels responsive and polished.

#### Acceptance Criteria

1. WHEN content is loading THEN the Customer_Website SHALL display the BrandedLoader component with the EkalliptusLogo animation matching the Admin_Dashboard
2. WHEN theme transitions occur THEN the Customer_Website SHALL apply the same smooth transition timing (0.3s cubic-bezier) as the Admin_Dashboard
3. WHEN elements animate in THEN the Customer_Website SHALL use the same animation keyframes (fade-in, slide-in-from-top, scale-in) as the Admin_Dashboard

### Requirement 7

**User Story:** As a customer, I want the order form to match the admin's public order form design, so that the experience is consistent.

#### Acceptance Criteria

1. WHEN rendering the order form THEN the Customer_Website SHALL use the same Card-based section layout as the Admin_Dashboard PublicOrderForm
2. WHEN displaying form labels THEN the Customer_Website SHALL show required field indicators with the same destructive color styling as the Admin_Dashboard
3. WHEN showing form validation errors THEN the Customer_Website SHALL display error messages with the same text-destructive styling as the Admin_Dashboard
4. WHEN rendering select dropdowns THEN the Customer_Website SHALL use the same Select component styling as the Admin_Dashboard

### Requirement 8

**User Story:** As a customer on mobile, I want the website to be fully responsive, so that I can use it comfortably on any device.

#### Acceptance Criteria

1. WHEN viewing on mobile devices (320px+) THEN the Customer_Website SHALL use the same responsive breakpoints as the Admin_Dashboard
2. WHEN the navigation collapses on mobile THEN the Customer_Website SHALL display a mobile menu with the same styling patterns as the Admin_Dashboard
3. WHEN forms display on mobile THEN the Customer_Website SHALL stack form fields vertically with the same responsive grid patterns (grid-cols-1 md:grid-cols-2) as the Admin_Dashboard

### Requirement 9

**User Story:** As a customer, I want the website header and footer to match the admin's public layout, so that the overall page structure feels unified.

#### Acceptance Criteria

1. WHEN rendering the header THEN the Customer_Website SHALL use a sticky header with the same backdrop blur effect (bg-background/95 backdrop-blur) as the Admin_Dashboard public layout
2. WHEN rendering the footer THEN the Customer_Website SHALL display copyright and contact links with the same layout structure as the Admin_Dashboard public layout
3. WHEN the header contains navigation THEN the Customer_Website SHALL use the same container padding patterns (px-4 sm:px-6 lg:px-8) as the Admin_Dashboard

### Requirement 10

**User Story:** As a developer, I want the CSS variables to be synchronized, so that future design changes propagate consistently.

#### Acceptance Criteria

1. WHEN defining CSS custom properties THEN the Customer_Website SHALL use the same variable naming convention (--background, --foreground, --primary, etc.) as the Admin_Dashboard
2. WHEN defining dark mode variables THEN the Customer_Website SHALL use the same .dark class selector pattern as the Admin_Dashboard
3. WHEN defining sidebar variables THEN the Customer_Website SHALL include the same sidebar-specific tokens (--sidebar-background, --sidebar-foreground, etc.) as the Admin_Dashboard for future consistency
