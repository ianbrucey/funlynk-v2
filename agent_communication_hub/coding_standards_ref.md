# Coding Standards Quick Reference
**Source**: `/planning/01_coding_standards_and_style_guide.md`  
**Last Updated**: 2025-01-16  

## 🚨 CRITICAL: All agents MUST follow these standards

### PHP (Laravel) Standards
- **PSR-12 compliance** - 4 spaces, 120 char lines
- **Naming**: Controllers (PascalCase + Controller), Models (PascalCase singular), Tables (snake_case plural)
- **Structure**: Service layer pattern, dependency injection, API resources
- **Location**: Core (`App\Http\Controllers\Core\`), Spark (`App\Http\Controllers\Spark\`)

### JavaScript/TypeScript Standards  
- **ESLint + Prettier** - 2 spaces, single quotes, semicolons
- **Components**: PascalCase, Atomic Design pattern
- **Files**: PascalCase for components, camelCase for utilities
- **Hooks**: prefix with `use`
- **Structure**: Separate core/ and spark/ folders

### Git Commit Format
```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Scopes: core, spark, auth, api, ui, db
```

### Quality Requirements
- **Testing**: 80% coverage minimum
- **Documentation**: PHPDoc/JSDoc for public methods
- **Security**: Input validation, CSRF protection, rate limiting
- **Performance**: Query optimization, lazy loading, caching

### Project Structure Reference
```
Core Features: /app/Http/Controllers/Core/, /src/components/core/
Spark Features: /app/Http/Controllers/Spark/, /src/components/spark/
Services: /app/Services/Core/, /app/Services/Spark/
```

## 📋 Before Starting ANY Task:
1. ✅ Read full standards document: `/planning/01_coding_standards_and_style_guide.md`
2. ✅ Check existing planning: `/planning/execution-tasks/`
3. ✅ Verify task dependencies and prerequisites
4. ✅ Update agent status in `agent_status.json`

## 🔗 Full Documentation Links
- Complete Standards: `/planning/01_coding_standards_and_style_guide.md`
- Execution Tasks: `/planning/execution-tasks/`
- Design System: `/planning/design-system/`
- API Contracts: `/planning/02_api_contract_definition.md`
