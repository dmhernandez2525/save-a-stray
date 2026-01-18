# Code Review Checklist

**Version:** 1.0.0
**Last Updated:** January 2026

---

## For Reviewers

### Functionality
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No breaking changes to existing functionality

### Code Quality
- [ ] Code is readable and self-documenting
- [ ] Follows project conventions and patterns
- [ ] No code duplication (DRY principle)
- [ ] Functions are focused and single-purpose
- [ ] Appropriate abstractions used

### GraphQL
- [ ] Types are properly defined
- [ ] Resolvers follow established patterns
- [ ] Mutations validate input
- [ ] No over-fetching or under-fetching

### Architecture
- [ ] Changes fit the existing architecture
- [ ] No unnecessary dependencies added
- [ ] Separation of concerns maintained
- [ ] Apollo Client patterns followed (frontend)

### Security
- [ ] No security vulnerabilities introduced
- [ ] Authentication/authorization correct
- [ ] Input validation present
- [ ] No sensitive data exposure

### Testing
- [ ] Tests cover the changes adequately
- [ ] Tests are meaningful (not just coverage)
- [ ] Test names are descriptive
- [ ] Mocking is appropriate

### Performance
- [ ] No N+1 queries
- [ ] DataLoader used where appropriate
- [ ] Caching considered where appropriate
- [ ] No unnecessary re-renders (React)

### Documentation
- [ ] Code comments explain "why" not "what"
- [ ] GraphQL schema documented
- [ ] README updated if needed

---

## Review Response Guidelines

### Approval Criteria
- All critical issues addressed
- No security vulnerabilities
- Tests pass and cover changes
- Code is maintainable

### Comment Types
- **Blocking**: Must be fixed before merge
- **Suggestion**: Consider for improvement
- **Question**: Clarification needed
- **Nitpick**: Minor style preference
