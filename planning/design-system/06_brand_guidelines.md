# Brand Guidelines
## Funlynk & Funlynk Spark MVP Design System

### Overview
This document establishes the brand identity, voice, and visual guidelines for Funlynk and Funlynk Spark applications. All agents must follow these guidelines to ensure consistent brand representation across all touchpoints.

## Brand Identity

### Funlynk Core Brand
**Mission**: To help people find like-minded individuals and activities in real life, fostering genuine in-person connections.

**Brand Personality**:
- **Friendly**: Approachable and welcoming to all users
- **Energetic**: Encouraging active participation and engagement
- **Authentic**: Promoting real, meaningful connections
- **Inclusive**: Welcoming to diverse communities and interests
- **Optimistic**: Positive outlook on human connections

**Brand Values**:
- Real-world connections over digital interactions
- Community building and social inclusion
- Activity-based friendship formation
- Authentic self-expression
- Local community engagement

### Funlynk Spark Brand
**Mission**: To facilitate character development field trips for K-12 education, providing schools with efficient tools for educational excursions.

**Brand Personality**:
- **Professional**: Trustworthy and reliable for educational institutions
- **Supportive**: Helping educators achieve their goals
- **Organized**: Streamlined and efficient processes
- **Educational**: Focused on student development and learning
- **Caring**: Prioritizing student safety and growth

**Brand Values**:
- Educational excellence and character development
- Student safety and well-being
- Administrative efficiency for educators
- Parent engagement and transparency
- Community-school partnerships

## Logo and Visual Identity

### Funlynk Core Logo
```css
/* Primary logo specifications */
.funlynk-logo {
  /* Logo should be provided as SVG for scalability */
  min-width: 120px; /* Minimum size for readability */
  max-width: 300px; /* Maximum size for headers */
  height: auto; /* Maintain aspect ratio */
}

/* Logo color variations */
.logo-primary {
  color: var(--color-primary-500); /* #3b82f6 */
}

.logo-white {
  color: var(--color-white);
  /* Use on dark backgrounds */
}

.logo-dark {
  color: var(--color-neutral-900);
  /* Use on light backgrounds when primary color isn't suitable */
}
```

### Funlynk Spark Logo
```css
/* Spark logo specifications */
.funlynk-spark-logo {
  min-width: 140px; /* Slightly larger for institutional use */
  max-width: 320px;
  height: auto;
}

/* Spark logo color variations */
.spark-logo-primary {
  color: var(--color-spark-primary-500); /* #a855f7 */
}

.spark-logo-accent {
  color: var(--color-spark-accent-500); /* #f59e0b */
}
```

### Logo Usage Guidelines
```css
/* Clear space around logo */
.logo-container {
  padding: calc(var(--logo-height) * 0.25); /* 25% of logo height on all sides */
}

/* Logo placement rules */
.header-logo {
  max-height: 40px; /* Standard header logo size */
  margin: var(--space-2) 0;
}

.footer-logo {
  max-height: 60px; /* Footer logo can be larger */
  margin: var(--space-4) 0;
}

.splash-logo {
  max-height: 120px; /* Splash screen logo */
  margin: var(--space-8) 0;
}
```

## Typography Hierarchy

### Funlynk Core Typography
```css
/* Brand-specific typography styles */
.funlynk-heading {
  font-family: var(--font-family-secondary); /* Poppins */
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
  letter-spacing: var(--tracking-tight);
}

.funlynk-subheading {
  font-family: var(--font-family-primary); /* Inter */
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
  letter-spacing: var(--tracking-normal);
}

.funlynk-body {
  font-family: var(--font-family-primary); /* Inter */
  font-weight: var(--font-weight-normal);
  color: var(--color-neutral-600);
  line-height: var(--leading-relaxed);
}
```

### Funlynk Spark Typography
```css
/* Educational-focused typography */
.spark-heading {
  font-family: var(--font-family-secondary); /* Poppins */
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
  letter-spacing: var(--tracking-normal); /* Slightly more formal */
}

.spark-institutional {
  font-family: var(--font-family-primary); /* Inter */
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-800);
  letter-spacing: var(--tracking-wide); /* Professional appearance */
  text-transform: uppercase;
  font-size: var(--text-sm);
}
```

## Color Psychology and Usage

### Funlynk Core Colors
```css
/* Primary blue - Trust, reliability, social connection */
.funlynk-primary {
  background-color: var(--color-primary-500); /* #3b82f6 */
  /* Use for: Primary actions, links, active states */
}

/* Secondary orange - Energy, enthusiasm, warmth */
.funlynk-secondary {
  background-color: var(--color-secondary-500); /* #f97316 */
  /* Use for: Call-to-action buttons, highlights, notifications */
}

/* Success green - Achievement, positive outcomes */
.funlynk-success {
  background-color: var(--color-success-500); /* #22c55e */
  /* Use for: Event confirmations, successful actions, positive feedback */
}
```

### Funlynk Spark Colors
```css
/* Educational purple - Wisdom, creativity, learning */
.spark-primary {
  background-color: var(--color-spark-primary-500); /* #a855f7 */
  /* Use for: Educational content, primary actions, institutional branding */
}

/* Character gold - Excellence, achievement, growth */
.spark-accent {
  background-color: var(--color-spark-accent-500); /* #f59e0b */
  /* Use for: Character development highlights, achievements, awards */
}
```

## Voice and Tone

### Funlynk Core Voice
**Tone Characteristics**:
- **Conversational**: Write like you're talking to a friend
- **Encouraging**: Motivate users to try new activities
- **Inclusive**: Use language that welcomes everyone
- **Positive**: Focus on opportunities and connections
- **Clear**: Simple, jargon-free communication

**Writing Examples**:
```
✅ Good: "Find your next adventure and meet amazing people!"
❌ Avoid: "Utilize our platform to optimize your social networking experience."

✅ Good: "Oops! Something went wrong. Let's try that again."
❌ Avoid: "Error 500: Internal server error occurred."

✅ Good: "You're all set! Your event is live and ready for RSVPs."
❌ Avoid: "Event creation process completed successfully."
```

### Funlynk Spark Voice
**Tone Characteristics**:
- **Professional**: Appropriate for educational settings
- **Supportive**: Helpful and understanding of educator needs
- **Clear**: Precise and unambiguous instructions
- **Respectful**: Acknowledging the importance of education
- **Efficient**: Focused on getting tasks done quickly

**Writing Examples**:
```
✅ Good: "Your field trip has been scheduled. Parents will receive permission slips within 24 hours."
❌ Avoid: "Trip booking confirmed! Parents will get forms soon! 🎉"

✅ Good: "Please review student information before finalizing the roster."
❌ Avoid: "Double-check everything looks good!"

✅ Good: "Contact support if you need assistance with any step."
❌ Avoid: "Hit us up if you're stuck!"
```

## Imagery Guidelines

### Photography Style
```css
/* Image treatment for Funlynk Core */
.funlynk-image {
  border-radius: 12px; /* Friendly, approachable feel */
  filter: brightness(1.05) contrast(1.1) saturate(1.1);
  /* Slightly enhanced for energy and warmth */
}

/* Image treatment for Funlynk Spark */
.spark-image {
  border-radius: 8px; /* More professional appearance */
  filter: brightness(1.02) contrast(1.05) saturate(1.0);
  /* Natural, professional look */
}
```

**Funlynk Core Image Criteria**:
- **People-focused**: Show real people enjoying activities
- **Diverse**: Represent various ages, ethnicities, and abilities
- **Active**: Capture movement and engagement
- **Natural**: Candid moments over posed shots
- **Bright**: Well-lit, optimistic atmosphere
- **Local**: Recognizable community spaces when possible

**Funlynk Spark Image Criteria**:
- **Educational**: Students learning and growing
- **Safe**: Appropriate supervision and safety measures visible
- **Engaging**: Students actively participating
- **Professional**: High-quality, well-composed shots
- **Inclusive**: Diverse student populations
- **Character-focused**: Images that reflect character development themes

### Icon Style
```css
/* Icon specifications */
.funlynk-icon {
  stroke-width: 2px; /* Medium weight for clarity */
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none; /* Outline style for consistency */
}

.spark-icon {
  stroke-width: 1.5px; /* Slightly thinner for professional look */
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}
```

**Icon Guidelines**:
- Use outline style icons for consistency
- Maintain 24px × 24px standard size
- Use consistent stroke width within each brand
- Ensure icons work at small sizes (16px minimum)
- Use semantic colors (primary for active, neutral for inactive)

## Content Guidelines

### Funlynk Core Content
**Event Descriptions**:
- Start with the activity, then the social aspect
- Include skill level (beginner-friendly, intermediate, advanced)
- Mention what to bring or expect
- Use action words and positive language
- Keep descriptions under 150 words

**User Interface Text**:
- Use sentence case for buttons and labels
- Keep button text to 1-2 words when possible
- Use "you" to address users directly
- Avoid technical jargon
- Be specific about actions ("Join Event" not "Submit")

### Funlynk Spark Content
**Program Descriptions**:
- Lead with educational objectives
- Clearly state character development focus
- Include practical information (duration, location, requirements)
- Use professional but accessible language
- Mention safety measures and supervision

**Administrative Interface Text**:
- Use clear, action-oriented labels
- Provide helpful tooltips for complex features
- Use consistent terminology throughout
- Include progress indicators for multi-step processes
- Offer clear error messages with solutions

## Accessibility and Inclusion

### Visual Accessibility
```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  .funlynk-primary {
    background-color: #0066cc; /* Higher contrast blue */
  }
  
  .spark-primary {
    background-color: #7c3aed; /* Higher contrast purple */
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}
```

### Inclusive Language
**Guidelines**:
- Use person-first language ("person with disability" not "disabled person")
- Avoid assumptions about family structure ("parent/guardian" not "mom and dad")
- Use gender-neutral language when possible
- Avoid idioms that may not translate across cultures
- Be mindful of economic assumptions ("bring a snack" not "buy a snack")

### Cultural Sensitivity
- Acknowledge diverse cultural backgrounds in imagery
- Avoid cultural stereotypes in activity suggestions
- Be inclusive of different religious and cultural holidays
- Use examples that represent various socioeconomic backgrounds
- Consider accessibility needs in activity planning

## Brand Application Examples

### Email Templates
```html
<!-- Funlynk Core Email Header -->
<div style="background-color: #3b82f6; padding: 20px; text-align: center;">
  <img src="funlynk-logo-white.svg" alt="Funlynk" style="height: 40px;">
</div>

<!-- Funlynk Spark Email Header -->
<div style="background-color: #a855f7; padding: 20px; text-align: center;">
  <img src="funlynk-spark-logo-white.svg" alt="Funlynk Spark" style="height: 40px;">
</div>
```

### Social Media Guidelines
**Profile Images**: Use primary logo on white background
**Cover Images**: Showcase real users/students in action
**Post Style**: Match brand voice and use brand colors
**Hashtags**: #FunlynkCommunity #RealConnections #FunlynkSpark #CharacterDevelopment

### Print Materials (Spark)
- Use high-resolution logos (300 DPI minimum)
- Maintain brand color accuracy with Pantone equivalents
- Include contact information and website
- Use professional typography hierarchy
- Ensure accessibility with sufficient contrast

## Implementation Checklist

### For All Agents
- [ ] Use correct logo files and sizing
- [ ] Apply appropriate color schemes for each brand
- [ ] Follow typography hierarchy guidelines
- [ ] Use consistent voice and tone
- [ ] Ensure accessibility compliance
- [ ] Test brand elements across different devices
- [ ] Maintain visual consistency with design system
- [ ] Use approved imagery styles and treatments

### Quality Assurance
- [ ] Brand elements render correctly on all screen sizes
- [ ] Colors maintain accessibility contrast ratios
- [ ] Typography scales appropriately
- [ ] Voice and tone remain consistent across all copy
- [ ] Images meet brand criteria and quality standards
- [ ] Icons maintain consistency and clarity
- [ ] Brand differentiation is clear between Core and Spark
