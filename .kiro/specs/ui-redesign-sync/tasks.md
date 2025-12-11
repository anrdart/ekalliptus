# Implementation Plan

- [x] 1. Update CSS Design System Variables





  - [x] 1.1 Update index.css with admin dashboard color tokens


    - Replace current color variables with admin's Brand_Green (HSL 142 71% 45%)
    - Update light mode variables to match admin's light theme
    - Update dark mode variables to match admin's dark theme
    - Set --radius to 0.5rem matching admin
    - _Requirements: 1.1, 1.3, 1.4, 10.1, 10.2, 10.3_
  - [x] 1.2 Write property test for CSS variable naming consistency


    - **Property 1: CSS Variable Naming Consistency**
    - **Validates: Requirements 1.3, 10.1**
  - [x] 1.3 Write property test for theme color token consistency


    - **Property 5: Theme Color Token Consistency**
    - **Validates: Requirements 1.1, 1.3**


- [x] 2. Create Shared Brand Components




  - [x] 2.1 Create EkalliptusLogo component


    - Create src/components/shared/EkalliptusLogo.tsx
    - Implement SVG logo matching admin dashboard design
    - Support "full" and "icon" variants
    - Use theme-aware CSS classes (text-primary, text-primary-foreground)
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Write property test for logo variant rendering


    - **Property 2: Logo Variant Rendering**
    - **Validates: Requirements 2.2**
  - [x] 2.3 Create StatusBadge component


    - Create src/components/shared/StatusBadge.tsx
    - Implement color mapping for all order/payment statuses
    - Match admin dashboard's status color configuration
    - Support default and outline variants
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 2.4 Write property test for StatusBadge color mapping


    - **Property 4: StatusBadge Color Mapping**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
  - [x] 2.5 Create BrandedLoader component


    - Create src/components/shared/BrandedLoader.tsx
    - Include animated EkalliptusLogo with pulse effect
    - Add spinning border indicator
    - Support sm/md/lg size variants
    - _Requirements: 6.1_


- [x] 3. Update UI Components





  - [x] 3.1 Update Button component with loading state

    - Add loading prop to Button component
    - Import and display Loader2 spinner when loading
    - Disable button when loading
    - Ensure variant styles match admin dashboard
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 3.2 Write property test for button variant styles

    - **Property 3: Button Variant Styles**
    - **Validates: Requirements 3.1**
  - [x] 3.3 Update Card component structure


    - Ensure Card exports all sub-components (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
    - Update styling to match admin (rounded-lg border bg-card shadow-sm)
    - _Requirements: 4.1, 4.2_


- [x] 4. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update Navigation Component





  - [x] 5.1 Replace logo with EkalliptusLogo component


    - Import EkalliptusLogo from shared components
    - Replace current logo image with EkalliptusLogo component
    - Use "icon" variant for mobile, "full" for desktop
    - _Requirements: 2.1, 2.3_

  - [x] 5.2 Update header styling to match admin
    - Apply sticky header with backdrop blur (bg-background/95 backdrop-blur)
    - Update container padding (px-4 sm:px-6 lg:px-8)
    - Simplify glass-panel styling

    - _Requirements: 9.1, 9.3_
  - [x] 5.3 Update mobile menu styling
    - Match admin's cleaner mobile menu design
    - Ensure responsive breakpoints align with admin
    - _Requirements: 8.1, 8.2_


- [x] 6. Update Order Form




  - [x] 6.1 Restructure form with Card-based sections


    - Wrap form sections in Card components
    - Use CardHeader, CardTitle, CardDescription for section headers
    - Match admin's PublicOrderForm layout structure
    - _Requirements: 7.1_

  - [x] 6.2 Update form field styling

    - Add required field indicators with destructive color
    - Update error message styling (text-destructive)
    - Ensure Select component matches admin styling
    - _Requirements: 7.2, 7.3, 7.4_

  - [x] 6.3 Add loading state with BrandedLoader

    - Import BrandedLoader component
    - Display during form submission
    - _Requirements: 6.1_

  - [x] 6.4 Update responsive grid for mobile

    - Use grid-cols-1 md:grid-cols-2 pattern
    - Stack fields vertically on mobile
    - _Requirements: 8.3_


- [x] 7. Update Footer Component





  - [x] 7.1 Create/update Footer to match admin layout

    - Add copyright text with current year
    - Add contact links (WhatsApp, Email)
    - Use same layout structure as admin public layout
    - Apply container padding patterns
    - _Requirements: 9.2_

- [x] 8. Update Tailwind Configuration






  - [x] 8.1 Add brand color palette to tailwind.config.ts

    - Add brand color scale (50-950) matching admin
    - Ensure color tokens reference CSS variables
    - _Requirements: 1.1_

- [x] 9. Final Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
