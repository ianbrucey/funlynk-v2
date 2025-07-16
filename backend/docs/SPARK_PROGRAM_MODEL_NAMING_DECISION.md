# Spark Program Model Naming Conflict Resolution

## Decision Summary

**Decision**: Adopt the **Alias Approach** for resolving the `Program` model naming conflict.

**Date**: December 2024

## Problem Statement

The Spark module contains a `Program` model that could potentially conflict with other program-related models in the application. To provide better namespace clarity and avoid future conflicts, we needed to choose between:

1. **Alias approach** – Keep existing `Program` model but create `SparkProgram` that extends `Program`
2. **Rename approach** – Rename `Program` ⇒ `SparkProgram` everywhere with IDE-assisted refactor

## Chosen Solution: Alias Approach

### Implementation

1. **Created `SparkProgram` model** that extends the existing `Program` model:
   ```php
   namespace App\Models\Spark;
   
   class SparkProgram extends Program
   {
       // Inherits all functionality from Program model
   }
   ```

2. **Updated new controllers and services** to use `SparkProgram`:
   - `SparkProgramService` - Updated to use `SparkProgram` throughout
   - `SparkProgramController` - Updated to use `SparkProgram` for authorization and type hints

3. **Updated relationships** where appropriate:
   - `CharacterTopic` model's `programs()` relationship now returns `SparkProgram` instances

4. **Maintained backward compatibility**:
   - Existing `ProgramController` and `ProgramService` continue to use the original `Program` model
   - All existing functionality remains intact

### Rationale

**Advantages of the chosen approach:**
- **Minimum risk**: No breaking changes to existing code
- **Least file churn**: Only a few files needed updates
- **Clear namespace**: New services can use `SparkProgram` for better clarity
- **Backward compatibility**: Existing controllers and services continue to work
- **Future-proof**: Easy to migrate gradually to `SparkProgram` if needed

**Why not the rename approach:**
- Higher risk of breaking existing functionality
- More extensive changes across the codebase
- Potential for missed references during refactoring
- Could impact existing tests and documentation

## Files Modified

### New Files Created
- `app/Models/Spark/SparkProgram.php` - Alias model extending Program
- `docs/SPARK_PROGRAM_MODEL_NAMING_DECISION.md` - This documentation

### Files Updated
- `app/Models/Spark/CharacterTopic.php` - Updated `programs()` relationship
- `app/Services/Spark/SparkProgramService.php` - Updated to use `SparkProgram`
- `app/Http/Controllers/Api/V1/Spark/SparkProgramController.php` - Updated to use `SparkProgram`

### Files Unchanged (Intentionally)
- `app/Models/Spark/Program.php` - Original model remains unchanged
- `app/Http/Controllers/Api/V1/Spark/ProgramController.php` - Uses original `Program` model
- `app/Services/Spark/ProgramService.php` - Uses original `Program` model
- All existing tests and resources continue to work with `Program` model

## Future Considerations

1. **Gradual Migration**: If desired, existing controllers and services can be gradually updated to use `SparkProgram`
2. **Naming Convention**: New Spark-related services should use `SparkProgram` for consistency
3. **Documentation**: API documentation should clarify which endpoints use which model approach

## Migration Guide for Developers

When creating new Spark program-related functionality:

1. **Use `SparkProgram` for new services/controllers**:
   ```php
   use App\Models\Spark\SparkProgram;
   
   public function createProgram(array $data): SparkProgram
   {
       return SparkProgram::create($data);
   }
   ```

2. **Existing functionality** can continue using `Program`:
   ```php
   use App\Models\Spark\Program;
   
   public function updateProgram(Program $program, array $data): Program
   {
       return $program->update($data);
   }
   ```

3. **Type hints and relationships** should use the appropriate model based on the service layer being used.

This approach ensures smooth operation while providing clear namespace separation for future development.
