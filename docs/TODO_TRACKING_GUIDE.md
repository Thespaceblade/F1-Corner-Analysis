# TODO Tracking System Guide

This guide explains how to use the TODO and FIXME tracking system in this project.

## Files Overview

### 1. TODO.md
**Purpose**: Tracks unfinished work, planned improvements, and future enhancements.

**Location**: Root directory (`/TODO.md`)

**Contents**:
- Unfinished work items
- Planned features
- Technical debt
- Future enhancements
- Priority rankings

**When to Update**:
- When starting new work - check for related items
- When completing work - mark items as done
- When discovering new requirements - add new items
- Weekly review to update priorities

### 2. FIXME.md
**Purpose**: Tracks known bugs, broken functionality, and issues that need fixing.

**Location**: Root directory (`/FIXME.md`)

**Contents**:
- Known bugs
- Broken functionality
- Issues needing verification
- Testing gaps
- Documentation issues

**When to Update**:
- When discovering a bug - add it here
- When fixing a bug - mark it as fixed
- When verifying functionality - update status
- Before releases - review all items

### 3. docs/remaining-tasks.md
**Purpose**: Detailed task list with comprehensive breakdown.

**Location**: `docs/remaining-tasks.md`

**Contents**:
- Detailed task descriptions
- Implementation notes
- Priority rankings
- Status tracking

**When to Update**:
- For detailed planning
- When breaking down large tasks
- For comprehensive project tracking

## Code Markers

### TODO Comments
Use `TODO:` in code to mark work that needs to be done:

```typescript
// TODO: Add error handling for this function
// TODO: Optimize this calculation for large datasets
// TODO: Add unit tests for this component
```

### FIXME Comments
Use `FIXME:` to mark broken code or issues:

```typescript
// FIXME: This is a temporary workaround, needs proper solution
// FIXME: Memory leak possible here, needs investigation
// FIXME: This doesn't handle edge case X
```

### XXX Comments
Use `XXX:` for warnings about problematic code:

```typescript
// XXX: This function is slow, consider optimization
// XXX: This may break if data structure changes
```

### HACK Comments
Use `HACK:` for workarounds that should be replaced:

```typescript
// HACK: Temporary fix until proper solution is implemented
// HACK: Using setTimeout to work around race condition
```

### NOTE Comments
Use `NOTE:` for important information:

```typescript
// NOTE: This assumes data is sorted by lap number
// NOTE: Performance critical section, avoid unnecessary re-renders
```

## Priority Levels

### 🚨 Critical
- Blocks functionality
- Fix immediately
- Examples: Broken features, security issues

### 🔧 High Priority
- Impacts user experience
- Should be fixed soon
- Examples: UI bugs, performance issues

### 🎨 Medium Priority
- Nice to have
- Improves usability
- Examples: UI enhancements, feature additions

### 📊 Feature Enhancements
- New features to add
- Planned improvements
- Examples: New analysis types, visualizations

### 🏗️ Technical Debt
- Code quality issues
- Maintenance tasks
- Examples: Refactoring, test coverage

### 🚀 Future
- Long-term goals
- Not urgent
- Examples: Advanced features, mobile support

## Status Icons

### ✅ Completed
Work is done and verified.

### 🚧 In Progress
Work is currently being done.

### ⏸️ Blocked
Cannot proceed until dependency is resolved.

### ⚠️ Needs Attention
Requires immediate review or action.

### 🔍 Investigating
Currently being looked into.

## How to Use

### Starting New Work
1. Check `TODO.md` for related items
2. Check `FIXME.md` for related bugs
3. Search codebase for `TODO:` and `FIXME:` comments
4. Update relevant items with your work

### Completing Work
1. Mark items as complete (✅) in TODO.md or FIXME.md
2. Remove or update code comments
3. Update documentation if needed
4. Commit with clear message referencing the item

### Finding Work
1. Review `TODO.md` for high-priority items
2. Check `FIXME.md` for critical bugs
3. Search codebase for markers: `grep -r "TODO:\|FIXME:"`
4. Check GitHub issues if integrated

### Reporting Bugs
1. Check if bug is already in `FIXME.md`
2. If not, add it with:
   - Description
   - Steps to reproduce
   - Expected vs actual behavior
   - Priority level
   - Files affected

## Best Practices

1. **Be Specific**: Use clear, actionable descriptions
2. **Set Priorities**: Mark items with appropriate priority
3. **Update Regularly**: Review and update weekly
4. **Link Issues**: Reference related code or issues
5. **Track Progress**: Update status as work progresses
6. **Remove Completed**: Clean up completed items regularly
7. **Be Realistic**: Don't create impossible TODO items

## Integration with Git

### Commit Messages
Reference TODO/FIXME items in commit messages:

```
fix: resolve corner hover issue (FIXME #3)
feat: add error handling (TODO #12)
```

### Branch Names
Use TODO items in branch names:

```
fix/todo-12-error-handling
feature/todo-45-new-analysis
```

## Review Process

### Weekly Review
- Review all TODO items
- Update priorities
- Mark completed items
- Add new items as needed

### Before Releases
- Review all FIXME items
- Fix critical bugs
- Update documentation
- Clean up completed items

### After Major Features
- Update TODO with new requirements
- Add FIXME for new bugs
- Update documentation
- Review code markers

## Tools

### Search TODO/FIXME
```bash
# Search for all TODO comments
grep -r "TODO:" --include="*.ts" --include="*.tsx" .

# Search for all FIXME comments
grep -r "FIXME:" --include="*.ts" --include="*.tsx" .

# Search in specific directory
grep -r "TODO:" components/
```

### Count Items
```bash
# Count TODO items in code
grep -r "TODO:" --include="*.ts" --include="*.tsx" . | wc -l

# Count FIXME items in code
grep -r "FIXME:" --include="*.ts" --include="*.tsx" . | wc -l
```

## Example Workflow

1. **Discover Bug**:
   - Add to FIXME.md with 🚨 priority
   - Add FIXME comment in code
   - Create branch: `fix/fixme-5-corner-bug`

2. **Fix Bug**:
   - Work on fix
   - Update FIXME.md status to 🚧
   - Test thoroughly

3. **Complete Fix**:
   - Mark as ✅ in FIXME.md
   - Remove FIXME comment from code
   - Commit: `fix: resolve corner bug (FIXME #5)`
   - Push and create PR

4. **Review**:
   - Verify fix works
   - Update documentation if needed
   - Close related issues

## Resources

- [TODO.md](../TODO.md) - Main TODO file
- [FIXME.md](../FIXME.md) - Known bugs and issues
- [docs/remaining-tasks.md](./remaining-tasks.md) - Detailed tasks
- [README.md](../README.md) - Project overview with TODO references

---

**Last Updated**: 2025-01-08

