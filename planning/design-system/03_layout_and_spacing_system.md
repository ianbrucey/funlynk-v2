# Layout and Spacing System
## Funlynk & Funlynk Spark MVP Design System

### Overview
This document defines the complete layout and spacing system for consistent visual rhythm and alignment across all interfaces. All agents must use these exact specifications for margins, padding, grid systems, and responsive breakpoints.

## Spacing Scale

### Base Spacing Units
```css
/* Base unit: 4px */
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-7: 1.75rem;  /* 28px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
--space-32: 8rem;    /* 128px */
--space-40: 10rem;   /* 160px */
--space-48: 12rem;   /* 192px */
--space-56: 14rem;   /* 224px */
--space-64: 16rem;   /* 256px */
```

### Semantic Spacing
```css
/* Component spacing */
--space-xs: var(--space-1);    /* 4px - Tight spacing */
--space-sm: var(--space-2);    /* 8px - Small spacing */
--space-md: var(--space-4);    /* 16px - Medium spacing */
--space-lg: var(--space-6);    /* 24px - Large spacing */
--space-xl: var(--space-8);    /* 32px - Extra large spacing */
--space-2xl: var(--space-12);  /* 48px - 2X large spacing */
--space-3xl: var(--space-16);  /* 64px - 3X large spacing */

/* Layout spacing */
--space-section: var(--space-16);     /* 64px - Between major sections */
--space-container: var(--space-6);    /* 24px - Container padding */
--space-card: var(--space-5);         /* 20px - Card internal padding */
--space-form: var(--space-4);         /* 16px - Form element spacing */
--space-list: var(--space-3);         /* 12px - List item spacing */
```

## Grid System

### Container Widths
```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-container);
}

/* Responsive container max-widths */
@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

@media (min-width: 1536px) {
  .container { max-width: 1536px; }
}
```

### Flexbox Grid System
```css
.grid {
  display: flex;
  flex-wrap: wrap;
  margin: calc(var(--space-4) * -0.5);
}

.grid-item {
  padding: calc(var(--space-4) * 0.5);
  flex: 1;
}

/* Grid columns */
.grid-cols-1 .grid-item { flex: 0 0 100%; }
.grid-cols-2 .grid-item { flex: 0 0 50%; }
.grid-cols-3 .grid-item { flex: 0 0 33.333333%; }
.grid-cols-4 .grid-item { flex: 0 0 25%; }
.grid-cols-5 .grid-item { flex: 0 0 20%; }
.grid-cols-6 .grid-item { flex: 0 0 16.666667%; }

/* Responsive grid */
@media (max-width: 768px) {
  .grid-cols-2 .grid-item,
  .grid-cols-3 .grid-item,
  .grid-cols-4 .grid-item,
  .grid-cols-5 .grid-item,
  .grid-cols-6 .grid-item {
    flex: 0 0 100%;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-cols-3 .grid-item,
  .grid-cols-4 .grid-item,
  .grid-cols-5 .grid-item,
  .grid-cols-6 .grid-item {
    flex: 0 0 50%;
  }
}
```

### CSS Grid System
```css
.css-grid {
  display: grid;
  gap: var(--space-4);
}

.css-grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.css-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.css-grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.css-grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.css-grid-cols-5 { grid-template-columns: repeat(5, 1fr); }
.css-grid-cols-6 { grid-template-columns: repeat(6, 1fr); }

/* Responsive CSS Grid */
@media (max-width: 768px) {
  .css-grid-cols-2,
  .css-grid-cols-3,
  .css-grid-cols-4,
  .css-grid-cols-5,
  .css-grid-cols-6 {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .css-grid-cols-3,
  .css-grid-cols-4,
  .css-grid-cols-5,
  .css-grid-cols-6 {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Responsive Breakpoints

### Breakpoint Values
```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small devices (landscape phones) */
--breakpoint-md: 768px;   /* Medium devices (tablets) */
--breakpoint-lg: 1024px;  /* Large devices (laptops) */
--breakpoint-xl: 1280px;  /* Extra large devices (desktops) */
--breakpoint-2xl: 1536px; /* 2X large devices (large desktops) */
```

### Media Query Mixins (for CSS-in-JS)
```javascript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`
};
```

## Layout Patterns

### Page Layout Structure
```css
.page-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-neutral-200);
  padding: var(--space-4) 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.page-main {
  flex: 1;
  padding: var(--space-6) 0;
  background-color: var(--color-neutral-50);
}

.page-footer {
  background-color: var(--color-white);
  border-top: 1px solid var(--color-neutral-200);
  padding: var(--space-8) 0;
  margin-top: auto;
}
```

### Mobile Layout (React Native)
```css
.mobile-container {
  flex: 1;
  background-color: var(--color-neutral-50);
}

.mobile-header {
  background-color: var(--color-white);
  padding: var(--space-4) var(--space-container);
  border-bottom: 1px solid var(--color-neutral-200);
  /* Add safe area padding for iOS */
  padding-top: calc(var(--space-4) + env(safe-area-inset-top));
}

.mobile-content {
  flex: 1;
  padding: var(--space-4) var(--space-container);
}

.mobile-bottom-nav {
  background-color: var(--color-white);
  border-top: 1px solid var(--color-neutral-200);
  /* Add safe area padding for iOS */
  padding-bottom: calc(var(--space-2) + env(safe-area-inset-bottom));
}
```

### Card Layout Patterns
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
  padding: var(--space-6);
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.card-masonry {
  columns: 3;
  column-gap: var(--space-6);
  padding: var(--space-6);
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    padding: var(--space-4);
  }
  
  .card-masonry {
    columns: 1;
    padding: var(--space-4);
  }
}
```

### Form Layout Patterns
```css
.form-layout {
  max-width: 480px;
  margin: 0 auto;
  padding: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-form);
}

.form-group-inline {
  display: flex;
  gap: var(--space-4);
  align-items: flex-end;
}

.form-group-inline .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-neutral-200);
}

@media (max-width: 640px) {
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-group-inline {
    flex-direction: column;
    gap: var(--space-form);
  }
  
  .form-group-inline .form-group {
    margin-bottom: var(--space-form);
  }
  
  .form-group-inline .form-group:last-child {
    margin-bottom: 0;
  }
}
```

## Spacing Utilities

### Margin Utilities
```css
/* Margin all sides */
.m-0 { margin: var(--space-0); }
.m-1 { margin: var(--space-1); }
.m-2 { margin: var(--space-2); }
.m-3 { margin: var(--space-3); }
.m-4 { margin: var(--space-4); }
.m-5 { margin: var(--space-5); }
.m-6 { margin: var(--space-6); }
.m-8 { margin: var(--space-8); }

/* Margin top */
.mt-0 { margin-top: var(--space-0); }
.mt-1 { margin-top: var(--space-1); }
.mt-2 { margin-top: var(--space-2); }
.mt-3 { margin-top: var(--space-3); }
.mt-4 { margin-top: var(--space-4); }
.mt-5 { margin-top: var(--space-5); }
.mt-6 { margin-top: var(--space-6); }
.mt-8 { margin-top: var(--space-8); }

/* Margin bottom */
.mb-0 { margin-bottom: var(--space-0); }
.mb-1 { margin-bottom: var(--space-1); }
.mb-2 { margin-bottom: var(--space-2); }
.mb-3 { margin-bottom: var(--space-3); }
.mb-4 { margin-bottom: var(--space-4); }
.mb-5 { margin-bottom: var(--space-5); }
.mb-6 { margin-bottom: var(--space-6); }
.mb-8 { margin-bottom: var(--space-8); }

/* Margin left/right */
.ml-0 { margin-left: var(--space-0); }
.ml-1 { margin-left: var(--space-1); }
.ml-2 { margin-left: var(--space-2); }
.ml-3 { margin-left: var(--space-3); }
.ml-4 { margin-left: var(--space-4); }

.mr-0 { margin-right: var(--space-0); }
.mr-1 { margin-right: var(--space-1); }
.mr-2 { margin-right: var(--space-2); }
.mr-3 { margin-right: var(--space-3); }
.mr-4 { margin-right: var(--space-4); }

/* Margin horizontal/vertical */
.mx-0 { margin-left: var(--space-0); margin-right: var(--space-0); }
.mx-1 { margin-left: var(--space-1); margin-right: var(--space-1); }
.mx-2 { margin-left: var(--space-2); margin-right: var(--space-2); }
.mx-3 { margin-left: var(--space-3); margin-right: var(--space-3); }
.mx-4 { margin-left: var(--space-4); margin-right: var(--space-4); }
.mx-auto { margin-left: auto; margin-right: auto; }

.my-0 { margin-top: var(--space-0); margin-bottom: var(--space-0); }
.my-1 { margin-top: var(--space-1); margin-bottom: var(--space-1); }
.my-2 { margin-top: var(--space-2); margin-bottom: var(--space-2); }
.my-3 { margin-top: var(--space-3); margin-bottom: var(--space-3); }
.my-4 { margin-top: var(--space-4); margin-bottom: var(--space-4); }
```

### Padding Utilities
```css
/* Padding all sides */
.p-0 { padding: var(--space-0); }
.p-1 { padding: var(--space-1); }
.p-2 { padding: var(--space-2); }
.p-3 { padding: var(--space-3); }
.p-4 { padding: var(--space-4); }
.p-5 { padding: var(--space-5); }
.p-6 { padding: var(--space-6); }
.p-8 { padding: var(--space-8); }

/* Padding top */
.pt-0 { padding-top: var(--space-0); }
.pt-1 { padding-top: var(--space-1); }
.pt-2 { padding-top: var(--space-2); }
.pt-3 { padding-top: var(--space-3); }
.pt-4 { padding-top: var(--space-4); }
.pt-5 { padding-top: var(--space-5); }
.pt-6 { padding-top: var(--space-6); }
.pt-8 { padding-top: var(--space-8); }

/* Padding bottom */
.pb-0 { padding-bottom: var(--space-0); }
.pb-1 { padding-bottom: var(--space-1); }
.pb-2 { padding-bottom: var(--space-2); }
.pb-3 { padding-bottom: var(--space-3); }
.pb-4 { padding-bottom: var(--space-4); }
.pb-5 { padding-bottom: var(--space-5); }
.pb-6 { padding-bottom: var(--space-6); }
.pb-8 { padding-bottom: var(--space-8); }

/* Padding horizontal/vertical */
.px-0 { padding-left: var(--space-0); padding-right: var(--space-0); }
.px-1 { padding-left: var(--space-1); padding-right: var(--space-1); }
.px-2 { padding-left: var(--space-2); padding-right: var(--space-2); }
.px-3 { padding-left: var(--space-3); padding-right: var(--space-3); }
.px-4 { padding-left: var(--space-4); padding-right: var(--space-4); }
.px-5 { padding-left: var(--space-5); padding-right: var(--space-5); }
.px-6 { padding-left: var(--space-6); padding-right: var(--space-6); }

.py-0 { padding-top: var(--space-0); padding-bottom: var(--space-0); }
.py-1 { padding-top: var(--space-1); padding-bottom: var(--space-1); }
.py-2 { padding-top: var(--space-2); padding-bottom: var(--space-2); }
.py-3 { padding-top: var(--space-3); padding-bottom: var(--space-3); }
.py-4 { padding-top: var(--space-4); padding-bottom: var(--space-4); }
.py-5 { padding-top: var(--space-5); padding-bottom: var(--space-5); }
.py-6 { padding-top: var(--space-6); padding-bottom: var(--space-6); }
```

## Layout Guidelines

### Vertical Rhythm
- Use consistent spacing between elements
- Maintain 4px base unit for all spacing
- Use semantic spacing variables for consistency
- Align text baselines when possible

### Horizontal Alignment
- Use flexbox for component-level alignment
- Use CSS Grid for layout-level alignment
- Maintain consistent gutters in grid systems
- Center content containers with max-widths

### Mobile-First Approach
- Design for mobile screens first (320px+)
- Progressive enhancement for larger screens
- Touch-friendly spacing (minimum 44px touch targets)
- Consider thumb-reach zones on mobile devices

### Accessibility Considerations
- Maintain sufficient spacing for users with motor impairments
- Ensure focus indicators have adequate spacing
- Provide enough white space for readability
- Consider zoom levels up to 200%

### Performance Considerations
- Use CSS Grid and Flexbox over float-based layouts
- Minimize layout shifts with consistent spacing
- Use transform for animations instead of changing layout properties
- Consider container queries for component-based responsive design

## Implementation Notes

### CSS Custom Properties
All spacing values must be implemented as CSS custom properties to enable consistent theming and easy maintenance.

### React Native Considerations
- Use StyleSheet.create() for performance
- Convert rem values to numeric pixels (1rem = 16px)
- Use Flexbox as the primary layout method
- Consider safe area insets for iOS devices

### Responsive Design Strategy
- Mobile-first approach with min-width media queries
- Use relative units (rem, %) where appropriate
- Test on actual devices, not just browser dev tools
- Consider foldable devices and unusual aspect ratios
