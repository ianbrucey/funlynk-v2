# Form Patterns and Validation
## Funlynk & Funlynk Spark MVP Design System

### Overview
This document defines standardized form patterns, validation rules, and error handling approaches for consistent user experience across all interfaces. All agents must follow these exact patterns for form implementation.

## Form Layout Patterns

### Basic Form Structure
```html
<form class="form-container">
  <div class="form-header">
    <h2 class="form-title">Form Title</h2>
    <p class="form-description">Optional description text</p>
  </div>
  
  <div class="form-body">
    <div class="form-group">
      <label class="form-label" for="input-id">
        Field Label
        <span class="form-required">*</span>
      </label>
      <input class="form-input" id="input-id" type="text" />
      <div class="form-help">Optional help text</div>
      <div class="form-error">Error message appears here</div>
    </div>
  </div>
  
  <div class="form-footer">
    <button type="button" class="button-secondary">Cancel</button>
    <button type="submit" class="button-primary">Submit</button>
  </div>
</form>
```

### Form Group Styles
```css
.form-container {
  max-width: 480px;
  margin: 0 auto;
  background-color: var(--color-white);
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: var(--space-6);
  text-align: center;
}

.form-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
  margin-bottom: var(--space-2);
}

.form-description {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  line-height: var(--leading-normal);
}

.form-body {
  margin-bottom: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-5);
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
  margin-bottom: var(--space-2);
  line-height: var(--leading-normal);
}

.form-required {
  color: var(--color-error-500);
  margin-left: var(--space-1);
}

.form-help {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
  margin-top: var(--space-1);
  line-height: var(--leading-normal);
}

.form-error {
  font-size: var(--text-xs);
  color: var(--color-error-600);
  margin-top: var(--space-1);
  line-height: var(--leading-normal);
  display: none;
}

.form-group.has-error .form-error {
  display: block;
}

.form-group.has-error .form-input {
  border-color: var(--color-error-500);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-footer {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-neutral-200);
}

@media (max-width: 640px) {
  .form-footer {
    flex-direction: column-reverse;
  }
}
```

### Inline Form Pattern
```css
.form-inline {
  display: flex;
  gap: var(--space-3);
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-inline .form-group {
  flex: 1;
  min-width: 200px;
  margin-bottom: 0;
}

.form-inline .form-actions {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .form-inline {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-inline .form-group {
    margin-bottom: var(--space-4);
  }
}
```

### Multi-Step Form Pattern
```css
.form-steps {
  margin-bottom: var(--space-6);
}

.form-step-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-8);
}

.form-step {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

.form-step:not(:last-child)::after {
  content: '';
  width: 40px;
  height: 1px;
  background-color: var(--color-neutral-300);
  margin: 0 var(--space-3);
}

.form-step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--color-neutral-300);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  margin-right: var(--space-2);
}

.form-step.active {
  color: var(--color-primary-600);
}

.form-step.active .form-step-number {
  background-color: var(--color-primary-500);
}

.form-step.completed {
  color: var(--color-success-600);
}

.form-step.completed .form-step-number {
  background-color: var(--color-success-500);
}
```

## Input Field Patterns

### Text Input Variations
```css
/* Standard text input - inherits from component library */
.form-input {
  /* Base styles defined in component library */
}

/* Input with icon */
.form-input-with-icon {
  position: relative;
}

.form-input-with-icon .form-input {
  padding-left: 40px;
}

.form-input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-neutral-400);
  pointer-events: none;
}

/* Search input */
.form-search {
  position: relative;
}

.form-search .form-input {
  padding-left: 40px;
  padding-right: 40px;
  border-radius: 24px;
}

.form-search .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-neutral-400);
}

.form-search .clear-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-400);
}

.form-search .clear-button:hover {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-600);
}
```

### Select and Dropdown Patterns
```css
/* Custom select styling */
.form-select-custom {
  position: relative;
}

.form-select-custom .form-input {
  cursor: pointer;
  padding-right: 40px;
}

.form-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--color-white);
  border: 2px solid var(--color-primary-500);
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.form-select-option {
  padding: 12px 16px;
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--color-neutral-700);
  border-bottom: 1px solid var(--color-neutral-100);
}

.form-select-option:hover {
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
}

.form-select-option.selected {
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
  font-weight: var(--font-weight-medium);
}

.form-select-option:last-child {
  border-bottom: none;
}
```

### File Upload Pattern
```css
.form-file-upload {
  border: 2px dashed var(--color-neutral-300);
  border-radius: 8px;
  padding: var(--space-8);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--color-neutral-50);
}

.form-file-upload:hover {
  border-color: var(--color-primary-400);
  background-color: var(--color-primary-50);
}

.form-file-upload.dragover {
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-100);
}

.form-file-upload-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-4);
  color: var(--color-neutral-400);
}

.form-file-upload-text {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  margin-bottom: var(--space-2);
}

.form-file-upload-hint {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

.form-file-upload input[type="file"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.form-file-list {
  margin-top: var(--space-4);
}

.form-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background-color: var(--color-neutral-100);
  border-radius: 6px;
  margin-bottom: var(--space-2);
}

.form-file-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.form-file-name {
  font-size: var(--text-sm);
  color: var(--color-neutral-700);
}

.form-file-size {
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
}

.form-file-remove {
  background: none;
  border: none;
  color: var(--color-error-500);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: 4px;
}

.form-file-remove:hover {
  background-color: var(--color-error-50);
}
```

## Validation Rules

### Required Field Validation
```javascript
const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};
```

### Email Validation
```javascript
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};
```

### Password Validation
```javascript
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors.length > 0 ? errors.join('. ') : null;
};
```

### Phone Number Validation
```javascript
const validatePhone = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    return 'Phone number must be 10 digits';
  }
  
  return null;
};

const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};
```

### Date Validation
```javascript
const validateDate = (dateString, fieldName = 'Date') => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  
  return null;
};

const validateFutureDate = (dateString, fieldName = 'Date') => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    return `${fieldName} must be in the future`;
  }
  
  return null;
};
```

### Custom Validation Patterns
```javascript
// Spark-specific: Student ID validation
const validateStudentId = (studentId) => {
  if (studentId && !/^\d{6,10}$/.test(studentId)) {
    return 'Student ID must be 6-10 digits';
  }
  return null;
};

// Core-specific: Event capacity validation
const validateCapacity = (capacity, fieldName = 'Capacity') => {
  const num = parseInt(capacity, 10);
  
  if (isNaN(num) || num < 1) {
    return `${fieldName} must be a positive number`;
  }
  
  if (num > 10000) {
    return `${fieldName} cannot exceed 10,000`;
  }
  
  return null;
};

// Price validation
const validatePrice = (price, fieldName = 'Price') => {
  const num = parseFloat(price);
  
  if (isNaN(num) || num < 0) {
    return `${fieldName} must be a positive number`;
  }
  
  if (num > 99999.99) {
    return `${fieldName} cannot exceed $99,999.99`;
  }
  
  return null;
};
```

## Error Handling Patterns

### Form-Level Error Display
```css
.form-errors {
  background-color: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: 8px;
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.form-errors-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-error-700);
  margin-bottom: var(--space-2);
}

.form-errors-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.form-errors-item {
  font-size: var(--text-sm);
  color: var(--color-error-600);
  margin-bottom: var(--space-1);
  padding-left: var(--space-4);
  position: relative;
}

.form-errors-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-error-500);
}
```

### Success State Display
```css
.form-success {
  background-color: var(--color-success-50);
  border: 1px solid var(--color-success-200);
  border-radius: 8px;
  padding: var(--space-4);
  margin-bottom: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.form-success-icon {
  width: 20px;
  height: 20px;
  color: var(--color-success-500);
  flex-shrink: 0;
}

.form-success-message {
  font-size: var(--text-sm);
  color: var(--color-success-700);
}
```

### Loading State Pattern
```css
.form-loading {
  position: relative;
}

.form-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
}

.form-loading .loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.form-loading .form-input,
.form-loading .button {
  pointer-events: none;
  opacity: 0.6;
}
```

## Accessibility Requirements

### ARIA Labels and Descriptions
```html
<!-- Required field with error -->
<div class="form-group has-error">
  <label class="form-label" for="email">
    Email Address
    <span class="form-required" aria-label="required">*</span>
  </label>
  <input 
    class="form-input" 
    id="email" 
    type="email"
    aria-required="true"
    aria-invalid="true"
    aria-describedby="email-error email-help"
  />
  <div class="form-help" id="email-help">
    We'll never share your email with anyone else.
  </div>
  <div class="form-error" id="email-error" role="alert">
    Please enter a valid email address.
  </div>
</div>
```

### Keyboard Navigation
- All form elements must be keyboard accessible
- Tab order must be logical and intuitive
- Custom components must support arrow key navigation
- Submit buttons must be accessible via Enter key
- Form validation must not trap keyboard focus

### Screen Reader Support
- Use proper semantic HTML elements
- Provide clear labels for all inputs
- Use aria-describedby for help text and errors
- Announce form errors with role="alert"
- Group related fields with fieldset and legend

## Implementation Guidelines

### Real-time Validation
- Validate on blur for better UX
- Show success states for valid fields
- Debounce validation for performance
- Don't validate empty optional fields

### Error Recovery
- Clear errors when user starts typing
- Provide clear, actionable error messages
- Focus the first invalid field on submit
- Maintain form data during validation

### Mobile Considerations
- Use appropriate input types (email, tel, number)
- Ensure touch targets are at least 44px
- Consider virtual keyboard behavior
- Test with various screen sizes and orientations
