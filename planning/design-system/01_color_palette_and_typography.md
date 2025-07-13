# Color Palette and Typography System
## Funlynk & Funlynk Spark MVP Design System

### Overview
This document defines the complete color palette and typography system for both Funlynk Core and Funlynk Spark applications. All agents must use these exact specifications to ensure visual consistency across mobile and web interfaces.

## Color Palette

### Primary Colors
**Funlynk Brand Colors**
```css
/* Primary Blue - Main brand color */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;  /* Main primary */
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;

/* Secondary Orange - Accent color */
--color-secondary-50: #fff7ed;
--color-secondary-100: #ffedd5;
--color-secondary-200: #fed7aa;
--color-secondary-300: #fdba74;
--color-secondary-400: #fb923c;
--color-secondary-500: #f97316;  /* Main secondary */
--color-secondary-600: #ea580c;
--color-secondary-700: #c2410c;
--color-secondary-800: #9a3412;
--color-secondary-900: #7c2d12;
```

### Semantic Colors
**Success, Warning, Error, Info**
```css
/* Success Green */
--color-success-50: #f0fdf4;
--color-success-100: #dcfce7;
--color-success-200: #bbf7d0;
--color-success-300: #86efac;
--color-success-400: #4ade80;
--color-success-500: #22c55e;  /* Main success */
--color-success-600: #16a34a;
--color-success-700: #15803d;
--color-success-800: #166534;
--color-success-900: #14532d;

/* Warning Yellow */
--color-warning-50: #fefce8;
--color-warning-100: #fef3c7;
--color-warning-200: #fde68a;
--color-warning-300: #fcd34d;
--color-warning-400: #fbbf24;
--color-warning-500: #f59e0b;  /* Main warning */
--color-warning-600: #d97706;
--color-warning-700: #b45309;
--color-warning-800: #92400e;
--color-warning-900: #78350f;

/* Error Red */
--color-error-50: #fef2f2;
--color-error-100: #fee2e2;
--color-error-200: #fecaca;
--color-error-300: #fca5a5;
--color-error-400: #f87171;
--color-error-500: #ef4444;  /* Main error */
--color-error-600: #dc2626;
--color-error-700: #b91c1c;
--color-error-800: #991b1b;
--color-error-900: #7f1d1d;

/* Info Blue */
--color-info-50: #f0f9ff;
--color-info-100: #e0f2fe;
--color-info-200: #bae6fd;
--color-info-300: #7dd3fc;
--color-info-400: #38bdf8;
--color-info-500: #0ea5e9;  /* Main info */
--color-info-600: #0284c7;
--color-info-700: #0369a1;
--color-info-800: #075985;
--color-info-900: #0c4a6e;
```

### Neutral Colors
**Grays for text, backgrounds, borders**
```css
/* Neutral Grays */
--color-neutral-50: #f9fafb;
--color-neutral-100: #f3f4f6;
--color-neutral-200: #e5e7eb;
--color-neutral-300: #d1d5db;
--color-neutral-400: #9ca3af;
--color-neutral-500: #6b7280;
--color-neutral-600: #4b5563;
--color-neutral-700: #374151;
--color-neutral-800: #1f2937;
--color-neutral-900: #111827;

/* Pure Colors */
--color-white: #ffffff;
--color-black: #000000;
```

### Spark-Specific Colors
**Additional colors for educational context**
```css
/* Educational Purple */
--color-spark-primary-50: #faf5ff;
--color-spark-primary-100: #f3e8ff;
--color-spark-primary-200: #e9d5ff;
--color-spark-primary-300: #d8b4fe;
--color-spark-primary-400: #c084fc;
--color-spark-primary-500: #a855f7;  /* Main Spark primary */
--color-spark-primary-600: #9333ea;
--color-spark-primary-700: #7c3aed;
--color-spark-primary-800: #6b21a8;
--color-spark-primary-900: #581c87;

/* Character Development Gold */
--color-spark-accent-50: #fffbeb;
--color-spark-accent-100: #fef3c7;
--color-spark-accent-200: #fde68a;
--color-spark-accent-300: #fcd34d;
--color-spark-accent-400: #fbbf24;
--color-spark-accent-500: #f59e0b;  /* Main Spark accent */
--color-spark-accent-600: #d97706;
--color-spark-accent-700: #b45309;
--color-spark-accent-800: #92400e;
--color-spark-accent-900: #78350f;
```

## Color Usage Guidelines

### Primary Actions
- **Primary buttons**: `--color-primary-500` background, white text
- **Primary links**: `--color-primary-600` text
- **Active states**: `--color-primary-700`
- **Focus states**: `--color-primary-500` with 20% opacity ring

### Secondary Actions
- **Secondary buttons**: `--color-secondary-500` background, white text
- **Secondary links**: `--color-secondary-600` text
- **Hover states**: `--color-secondary-600`

### Status Indicators
- **Success messages**: `--color-success-500` background/text
- **Warning messages**: `--color-warning-500` background/text
- **Error messages**: `--color-error-500` background/text
- **Info messages**: `--color-info-500` background/text

### Text Colors
- **Primary text**: `--color-neutral-900`
- **Secondary text**: `--color-neutral-600`
- **Muted text**: `--color-neutral-500`
- **Placeholder text**: `--color-neutral-400`
- **Disabled text**: `--color-neutral-300`

### Background Colors
- **Page background**: `--color-neutral-50`
- **Card background**: `--color-white`
- **Input background**: `--color-white`
- **Disabled background**: `--color-neutral-100`
- **Hover background**: `--color-neutral-50`

### Border Colors
- **Default border**: `--color-neutral-200`
- **Input border**: `--color-neutral-300`
- **Focus border**: `--color-primary-500`
- **Error border**: `--color-error-500`
- **Success border**: `--color-success-500`

## Typography System

### Font Families
```css
/* Primary Font - Inter (Sans-serif) */
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Secondary Font - Poppins (Display) */
--font-family-secondary: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace Font - JetBrains Mono */
--font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
```

### Font Weights
```css
--font-weight-thin: 100;
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
--font-weight-black: 900;
```

### Typography Scale
```css
/* Headings */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;    /* 60px */
--text-7xl: 4.5rem;     /* 72px */
--text-8xl: 6rem;       /* 96px */
--text-9xl: 8rem;       /* 128px */
```

### Line Heights
```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Letter Spacing
```css
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0em;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

## Typography Usage Guidelines

### Headings
```css
/* H1 - Page titles */
.heading-1 {
  font-family: var(--font-family-secondary);
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
  color: var(--color-neutral-900);
}

/* H2 - Section titles */
.heading-2 {
  font-family: var(--font-family-secondary);
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
  color: var(--color-neutral-900);
}

/* H3 - Subsection titles */
.heading-3 {
  font-family: var(--font-family-secondary);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-neutral-900);
}

/* H4 - Component titles */
.heading-4 {
  font-family: var(--font-family-primary);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-neutral-900);
}

/* H5 - Small headings */
.heading-5 {
  font-family: var(--font-family-primary);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-normal);
  color: var(--color-neutral-800);
}

/* H6 - Labels */
.heading-6 {
  font-family: var(--font-family-primary);
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-normal);
  color: var(--color-neutral-700);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}
```

### Body Text
```css
/* Large body text */
.text-large {
  font-family: var(--font-family-primary);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-normal);
  line-height: var(--leading-relaxed);
  color: var(--color-neutral-800);
}

/* Regular body text */
.text-body {
  font-family: var(--font-family-primary);
  font-size: var(--text-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--leading-normal);
  color: var(--color-neutral-700);
}

/* Small body text */
.text-small {
  font-family: var(--font-family-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-normal);
  line-height: var(--leading-normal);
  color: var(--color-neutral-600);
}

/* Extra small text */
.text-xs {
  font-family: var(--font-family-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-normal);
  line-height: var(--leading-normal);
  color: var(--color-neutral-500);
}
```

### Special Text Styles
```css
/* Caption text */
.text-caption {
  font-family: var(--font-family-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-normal);
  line-height: var(--leading-normal);
  color: var(--color-neutral-500);
  font-style: italic;
}

/* Button text */
.text-button {
  font-family: var(--font-family-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-none);
  letter-spacing: var(--tracking-wide);
}

/* Link text */
.text-link {
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: all 0.2s ease;
}

.text-link:hover {
  color: var(--color-primary-700);
  text-decoration-color: var(--color-primary-700);
}

/* Code text */
.text-code {
  font-family: var(--font-family-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-normal);
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-800);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}
```

## Mobile Typography Adjustments

### iOS Specific
- Use `-apple-system` as fallback
- Increase line-height by 0.125 for better readability
- Use `font-weight: 600` instead of `700` for better rendering

### Android Specific
- Use `Roboto` as fallback
- Maintain standard line-heights
- Use standard font-weights

### Responsive Typography
```css
/* Mobile adjustments */
@media (max-width: 768px) {
  .heading-1 { font-size: var(--text-3xl); }
  .heading-2 { font-size: var(--text-2xl); }
  .heading-3 { font-size: var(--text-xl); }
  .text-large { font-size: var(--text-base); }
}
```

## Implementation Notes

### CSS Custom Properties
All colors and typography values must be implemented as CSS custom properties (variables) to enable easy theming and consistency.

### Dark Mode Preparation
Color variables are structured to support future dark mode implementation by swapping color values while maintaining the same variable names.

### Accessibility
- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text (18px+ or 14px+ bold)
- All interactive elements must have focus states
- Text must be resizable up to 200% without loss of functionality

### Platform Consistency
- Use system fonts as fallbacks for better performance
- Maintain consistent spacing and sizing across platforms
- Test typography rendering on both iOS and Android devices
