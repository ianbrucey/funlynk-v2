# Code Review Template
**For Technical Lead and Peer Reviews**

## 📋 Review Information
- **Task ID**: ________________
- **Agent**: ________________
- **Reviewer**: ________________
- **Review Date**: ________________
- **Files Changed**: ________________

## ✅ Standards Compliance Review

### PHP/Laravel Standards (if applicable)
- [ ] PSR-12 compliance (4 spaces, 120 char lines, brace placement)
- [ ] Naming conventions (Controllers, Models, Tables)
- [ ] Service layer pattern implemented
- [ ] Dependency injection used correctly
- [ ] API resources implemented
- [ ] Proper namespace structure (Core/Spark separation)

### JavaScript/TypeScript Standards (if applicable)
- [ ] ESLint rules passing
- [ ] Prettier formatting applied
- [ ] Component naming (PascalCase)
- [ ] File naming conventions
- [ ] Atomic design pattern followed
- [ ] TypeScript types properly defined
- [ ] Hook patterns correct (use prefix)

### General Code Quality
- [ ] Functions are single-purpose and well-named
- [ ] Comments explain WHY, not WHAT
- [ ] No hardcoded values (use constants/config)
- [ ] Error handling implemented
- [ ] Input validation present
- [ ] Security best practices followed

### Testing Requirements
- [ ] Unit tests written and passing
- [ ] Test coverage ≥ 80%
- [ ] Integration tests for API endpoints
- [ ] Component tests for UI elements
- [ ] Edge cases covered

### Documentation
- [ ] PHPDoc/JSDoc for public methods
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Inline comments for complex logic

### Performance & Security
- [ ] Database queries optimized
- [ ] No N+1 query problems
- [ ] Proper indexing considered
- [ ] Input sanitization implemented
- [ ] Authentication/authorization correct
- [ ] Rate limiting considered

### Project Structure
- [ ] Files in correct directories
- [ ] Core/Spark separation maintained
- [ ] Dependencies properly managed
- [ ] No circular dependencies

## 🚨 Critical Issues (Must Fix)
*List any critical issues that must be addressed before approval*

## ⚠️ Minor Issues (Should Fix)
*List minor issues that should be addressed*

## 💡 Suggestions (Nice to Have)
*List suggestions for improvement*

## ✅ Approval Status
- [ ] **APPROVED** - Meets all standards, ready to merge
- [ ] **APPROVED WITH MINOR CHANGES** - Minor fixes needed
- [ ] **NEEDS WORK** - Significant changes required
- [ ] **REJECTED** - Major standards violations

## 📝 Review Comments
*Detailed feedback and explanations*

## 🎯 Next Steps
*What the agent should do next*

---

**Reviewer Signature**: ________________  
**Review Completion Date**: ________________
