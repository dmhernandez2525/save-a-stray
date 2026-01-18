# Pre-Commit Checklist

**Version:** 1.0.0
**Last Updated:** January 2026

---

## Before Every Commit

### Code Quality
- [ ] Code follows project coding standards
- [ ] No console.log or debug statements left in code
- [ ] No commented-out code blocks
- [ ] Variable and function names are descriptive
- [ ] No hardcoded values (use environment variables)

### GraphQL
- [ ] New queries/mutations are properly typed
- [ ] Resolvers handle errors appropriately
- [ ] No N+1 query issues (use DataLoader if needed)

### Testing
- [ ] All existing tests pass (`npm test`)
- [ ] New code has corresponding tests
- [ ] Edge cases are covered
- [ ] No skipped tests without explanation

### Security
- [ ] No API keys or secrets in code
- [ ] No sensitive data logged
- [ ] Input validation implemented where needed
- [ ] GraphQL resolvers check authorization

### Documentation
- [ ] Complex logic has inline comments
- [ ] Public functions have JSDoc comments
- [ ] README updated if needed
- [ ] GraphQL schema documented

### Git Hygiene
- [ ] Commit message is descriptive and follows conventions
- [ ] Changes are atomic (single logical change per commit)
- [ ] No unrelated changes bundled together
- [ ] Branch is up to date with main

---

## Quick Commands

```bash
# Run linter
npm run lint

# Run tests
npm test

# Check for security issues
npm audit
```
