# Component Library Specifications
## Funlynk & Funlynk Spark MVP Design System

### Overview
This document provides exact specifications for all UI components used across Funlynk Core and Funlynk Spark applications. Every component includes visual specifications, behavior definitions, and implementation requirements.

## Button Components

### Primary Button
**Usage**: Main actions, form submissions, primary CTAs
```css
.button-primary {
  /* Base styles */
  background-color: var(--color-primary-500);
  color: var(--color-white);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-family: var(--font-family-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-none);
  letter-spacing: var(--tracking-wide);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px; /* Touch target */
  
  /* States */
  &:hover {
    background-color: var(--color-primary-600);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:active {
    background-color: var(--color-primary-700);
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    background-color: var(--color-neutral-300);
    color: var(--color-neutral-500);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}
```

### Secondary Button
**Usage**: Secondary actions, cancel buttons
```css
.button-secondary {
  background-color: transparent;
  color: var(--color-primary-600);
  border: 2px solid var(--color-primary-500);
  border-radius: 8px;
  padding: 10px 22px; /* Adjusted for border */
  font-family: var(--font-family-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-none);
  letter-spacing: var(--tracking-wide);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  
  &:hover {
    background-color: var(--color-primary-50);
    border-color: var(--color-primary-600);
    color: var(--color-primary-700);
  }
  
  &:active {
    background-color: var(--color-primary-100);
    border-color: var(--color-primary-700);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    background-color: transparent;
    border-color: var(--color-neutral-300);
    color: var(--color-neutral-400);
    cursor: not-allowed;
  }
}
```

### Tertiary Button
**Usage**: Text-only actions, subtle interactions
```css
.button-tertiary {
  background-color: transparent;
  color: var(--color-primary-600);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-family: var(--font-family-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
  
  &:hover {
    background-color: var(--color-primary-50);
    color: var(--color-primary-700);
  }
  
  &:active {
    background-color: var(--color-primary-100);
  }
  
  &:focus {
    outline: none;
    background-color: var(--color-primary-50);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
}
```

### Button Sizes
```css
/* Small button */
.button-small {
  padding: 8px 16px;
  font-size: var(--text-xs);
  min-height: 36px;
}

/* Large button */
.button-large {
  padding: 16px 32px;
  font-size: var(--text-base);
  min-height: 52px;
}

/* Full width button */
.button-full {
  width: 100%;
  justify-content: center;
}
```

### Icon Buttons
```css
.button-icon {
  background-color: transparent;
  border: none;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: var(--color-neutral-100);
  }
  
  &:active {
    background-color: var(--color-neutral-200);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
}
```

## Input Components

### Text Input
```css
.input-text {
  width: 100%;
  background-color: var(--color-white);
  border: 2px solid var(--color-neutral-300);
  border-radius: 8px;
  padding: 12px 16px;
  font-family: var(--font-family-primary);
  font-size: var(--text-base);
  font-weight: var(--font-weight-normal);
  color: var(--color-neutral-900);
  transition: all 0.2s ease;
  min-height: 48px;
  
  &::placeholder {
    color: var(--color-neutral-400);
  }
  
  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background-color: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
    color: var(--color-neutral-500);
    cursor: not-allowed;
  }
  
  &.error {
    border-color: var(--color-error-500);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
  
  &.success {
    border-color: var(--color-success-500);
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }
}
```

### Textarea
```css
.input-textarea {
  /* Inherits from .input-text */
  min-height: 120px;
  resize: vertical;
  font-family: var(--font-family-primary);
  line-height: var(--leading-normal);
}
```

### Select Dropdown
```css
.input-select {
  /* Inherits from .input-text */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
  cursor: pointer;
  
  &:focus {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  }
}
```

### Checkbox
```css
.input-checkbox {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-neutral-300);
  border-radius: 4px;
  background-color: var(--color-white);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:checked {
    background-color: var(--color-primary-500);
    border-color: var(--color-primary-500);
  }
  
  &:checked::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 6px;
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    background-color: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
    cursor: not-allowed;
  }
}
```

### Radio Button
```css
.input-radio {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-neutral-300);
  border-radius: 50%;
  background-color: var(--color-white);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:checked {
    border-color: var(--color-primary-500);
  }
  
  &:checked::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--color-primary-500);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
}
```

## Card Components

### Basic Card
```css
.card {
  background-color: var(--color-white);
  border-radius: 12px;
  border: 1px solid var(--color-neutral-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
}

.card-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-neutral-200);
}

.card-body {
  padding: 20px 24px;
}

.card-footer {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-50);
}
```

### Event Card (Core Funlynk)
```css
.event-card {
  /* Inherits from .card */
  max-width: 320px;
  
  .event-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    background-color: var(--color-neutral-100);
  }
  
  .event-content {
    padding: 16px 20px;
  }
  
  .event-title {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-neutral-900);
    margin-bottom: 8px;
    line-height: var(--leading-snug);
  }
  
  .event-date {
    font-size: var(--text-sm);
    color: var(--color-neutral-600);
    margin-bottom: 8px;
  }
  
  .event-location {
    font-size: var(--text-sm);
    color: var(--color-neutral-500);
    margin-bottom: 12px;
  }
  
  .event-attendees {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-xs);
    color: var(--color-neutral-500);
  }
}
```

### Program Card (Spark)
```css
.program-card {
  /* Inherits from .card */
  
  .program-header {
    padding: 20px;
    background: linear-gradient(135deg, var(--color-spark-primary-500), var(--color-spark-primary-600));
    color: white;
  }
  
  .program-title {
    font-size: var(--text-xl);
    font-weight: var(--font-weight-semibold);
    margin-bottom: 8px;
  }
  
  .program-duration {
    font-size: var(--text-sm);
    opacity: 0.9;
  }
  
  .program-content {
    padding: 20px;
  }
  
  .character-topics {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .character-topic-tag {
    background-color: var(--color-spark-accent-100);
    color: var(--color-spark-accent-700);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
  }
}
```

## Navigation Components

### Tab Navigation
```css
.tab-navigation {
  display: flex;
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-neutral-200);
  overflow-x: auto;
}

.tab-item {
  flex: 1;
  padding: 16px 20px;
  text-align: center;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-600);
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  
  &:hover {
    color: var(--color-primary-600);
    background-color: var(--color-primary-50);
  }
  
  &.active {
    color: var(--color-primary-600);
    border-bottom-color: var(--color-primary-500);
    background-color: var(--color-primary-50);
  }
  
  &:focus {
    outline: none;
    background-color: var(--color-primary-50);
  }
}
```

### Bottom Navigation (Mobile)
```css
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-white);
  border-top: 1px solid var(--color-neutral-200);
  display: flex;
  padding: 8px 0;
  z-index: 1000;
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  .icon {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
    color: var(--color-neutral-500);
  }
  
  .label {
    font-size: var(--text-xs);
    color: var(--color-neutral-500);
    font-weight: var(--font-weight-medium);
  }
  
  &.active {
    .icon { color: var(--color-primary-500); }
    .label { color: var(--color-primary-600); }
  }
  
  &:hover {
    background-color: var(--color-neutral-50);
  }
}
```

## Status and Feedback Components

### Alert Messages
```css
.alert {
  padding: 16px 20px;
  border-radius: 8px;
  border-left: 4px solid;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  
  .alert-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .alert-content {
    flex: 1;
  }
  
  .alert-title {
    font-weight: var(--font-weight-semibold);
    margin-bottom: 4px;
  }
  
  .alert-message {
    font-size: var(--text-sm);
    line-height: var(--leading-normal);
  }
}

.alert-success {
  background-color: var(--color-success-50);
  border-left-color: var(--color-success-500);
  color: var(--color-success-800);
}

.alert-warning {
  background-color: var(--color-warning-50);
  border-left-color: var(--color-warning-500);
  color: var(--color-warning-800);
}

.alert-error {
  background-color: var(--color-error-50);
  border-left-color: var(--color-error-500);
  color: var(--color-error-800);
}

.alert-info {
  background-color: var(--color-info-50);
  border-left-color: var(--color-info-500);
  color: var(--color-info-800);
}
```

### Loading Spinner
```css
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-neutral-200);
  border-top: 3px solid var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner-large {
  width: 40px;
  height: 40px;
  border-width: 4px;
}
```

### Badge/Tag Components
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  
  &.badge-primary {
    background-color: var(--color-primary-100);
    color: var(--color-primary-700);
  }
  
  &.badge-success {
    background-color: var(--color-success-100);
    color: var(--color-success-700);
  }
  
  &.badge-warning {
    background-color: var(--color-warning-100);
    color: var(--color-warning-700);
  }
  
  &.badge-error {
    background-color: var(--color-error-100);
    color: var(--color-error-700);
  }
  
  &.badge-neutral {
    background-color: var(--color-neutral-100);
    color: var(--color-neutral-700);
  }
}
```

## Implementation Requirements

### Accessibility
- All interactive components must have proper ARIA labels
- Focus states must be clearly visible
- Color cannot be the only way to convey information
- Touch targets must be at least 44px × 44px
- Components must work with screen readers

### Responsive Behavior
- Components must work on screens from 320px to 1920px wide
- Touch-friendly sizing on mobile devices
- Appropriate spacing adjustments for different screen sizes
- Consistent behavior across iOS and Android

### Animation Guidelines
- Use `transition: all 0.2s ease` for hover states
- Use `transform` for movement animations
- Keep animations subtle and purposeful
- Respect user's motion preferences (`prefers-reduced-motion`)

### Component States
Every interactive component must support:
- **Default**: Normal state
- **Hover**: Mouse over state
- **Active**: Pressed/clicked state
- **Focus**: Keyboard focus state
- **Disabled**: Non-interactive state
- **Loading**: Processing state (where applicable)
- **Error**: Invalid/error state (for inputs)
