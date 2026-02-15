# Daedalus Testing Guide

**Last Updated:** 2026-02-15
**Status:** Test infrastructure established, coverage expanding

---

## Testing Overview

Daedalus uses **Bun's built-in test runner** for unit and integration testing. The project follows a test-driven approach for critical platform services while gradually expanding coverage to all primitives.

---

## Test Infrastructure

### Test Runner: Bun Test

```bash
# Run all tests
bun test

# Run specific test file
bun test src/platform/firecrawl/service.test.ts

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage
```

### Type Definitions

Custom Bun test type definitions are located in:
- `src/types/bun-test.d.ts` - Type definitions for `bun:test` module

---

## Current Test Coverage

### ✅ Platform Services (Tested)

#### Firecrawl Service
**Location:** `src/platform/firecrawl/service.test.ts`
**Status:** ✅ PASSING
**Coverage:** Comprehensive

**Test Cases:**
- Basic URL scraping with valid response
- Empty response validation and rejection
- Fallback URL attempts on empty responses
- Retry logic with exponential backoff
- Rate limiting enforcement
- Error handling and structured errors
- Search functionality

#### Scout Workflow Tests
**Location:** `src/daedalus/scout/workflow.test.ts`
**Status:** ✅ PASSING
**Coverage:** Comprehensive

**Test Cases:**
- URL normalization (trailing slashes, lowercase, UTM removal)
- Deduplication logic (previously seen URLs, normalized matching, batch deduplication)
- Schedule calculation (manual, hourly, daily, weekly)

**Key Testing Patterns:**
```typescript
import { describe, test, expect } from 'bun:test'
import { firecrawlService } from './service'

describe('Firecrawl Service', () => {
  test('scrapes URL successfully', async () => {
    const result = await firecrawlService.scrape('https://example.com')
    expect(result).toBeDefined()
    expect(result.markdown).toBeTruthy()
  })

  test('rejects empty responses', async () => {
    // Test implementation
  })

  test('retries with fallback URLs', async () => {
    // Test implementation
  })
})
```

---

### ⚠️ Areas Needing Tests

#### API Routes (Priority: High)

**Needed Test Coverage:**
- `/api/enrich` - Single lead enrichment
- `/api/enrich/batch` - CSV batch enrichment
- `/api/enrich/stream` - Streaming enrichment
- `/api/extract` - Brand extraction
- `/api/monitors` - Monitor CRUD operations
- `/api/monitors/[id]` - Monitor check execution
- `/api/scouts` - Scout CRUD operations
- `/api/scouts/[id]` - Scout run execution
- `/api/research` - Research session management
- `/api/research/stream` - Streaming research
- `/api/billing/usage` - Usage tracking
- `/api/stripe/checkout` - Stripe integration
- `/api/webhooks/stripe` - Stripe webhooks

**Test Template for API Routes:**
```typescript
import { describe, test, expect } from 'bun:test'
import { POST } from './route'

describe('POST /api/enrich', () => {
  test('requires authentication', async () => {
    const request = new Request('http://localhost:3000/api/enrich', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' })
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  test('validates input schema', async () => {
    // Test with authenticated request
    // Test with invalid input
    // Expect 400 Bad Request
  })

  test('enriches lead successfully', async () => {
    // Test with valid authenticated request
    // Test with valid input
    // Expect 200 OK with enriched data
  })

  test('handles rate limiting', async () => {
    // Test with exceeded rate limit
    // Expect 429 Too Many Requests
  })
})
```

#### Workflows (Priority: High)

**Enrich Workflows:**
- `src/daedalus/enrich/api.ts`
  - Test CSV parsing and validation
  - Test lead enrichment pipeline (discovery → profile → funding → tech → custom)
  - Test streaming progress updates
  - Test error handling and partial failures

**Extract Workflows:**
- `src/daedalus/extract/brand/workflow.ts`
  - Test brand identity extraction
  - Test schema validation
  - Test source attribution
  - Test empty/invalid URL handling

**Observe Workflows:**
- `src/daedalus/observe/workflow.ts`
  - Test monitor creation and management
  - Test content hash comparison
  - Test change detection
  - Test diff generation (when implemented)

**Scout Workflows:**
- Scout search execution (when implemented)
- URL deduplication logic
- Scheduled run handling (when implemented)

**Agent Workflows:**
- `src/daedalus/agent/research/`
  - Test research session creation
  - Test multi-turn conversations
  - Test tool orchestration
  - Test streaming responses

#### Database Operations (Priority: Medium)

**Kysely Client Tests:**
- Test connection pooling
- Test transaction handling
- Test query building
- Test error handling
- Test type safety

**Migration Tests:**
- Test migration execution
- Test rollback procedures
- Test schema validation

#### AI Provider Tests (Priority: Medium)

**LLM Provider Abstraction:**
- Test provider creation (OpenAI, Anthropic, Groq)
- Test schema validation
- Test streaming support
- Test markdown fence stripping
- Test retry and fallback logic
- Test Safe Mode activation

**Schema Validation:**
- Test Zod schema parsing
- Test structured output validation
- Test error recovery

#### UI Component Tests (Priority: Low)

**React Components:**
- Test UnifiedInput component
- Test CSVUploader component
- Test EnrichmentResults display
- Test loading states
- Test error boundaries

---

## Test Categories

### Unit Tests

**Purpose:** Test individual functions and modules in isolation

**Examples:**
- Firecrawl service methods
- LLM provider methods
- Utility functions
- Schema validators
- Database query builders

**Best Practices:**
- Mock external dependencies
- Test edge cases and error conditions
- Fast execution (<100ms per test)
- Clear, descriptive test names

### Integration Tests

**Purpose:** Test interaction between modules and services

**Examples:**
- API route → workflow → service integration
- Database operations with real connection
- Firecrawl + LLM pipeline integration
- Auth + API protection integration

**Best Practices:**
- Use test database or transactions
- Clean up test data after execution
- Test realistic user scenarios
- Moderate execution time (<5s per test)

### End-to-End Tests (Not Yet Implemented)

**Purpose:** Test complete user workflows through the UI

**Needed Tools:**
- Playwright or Cypress for browser automation
- Test fixtures and seed data
- Isolated test environment

**Priority Workflows to Test:**
1. User registration → login → dashboard access
2. CSV upload → enrichment → results download
3. Single lead enrichment → view results
4. Brand extraction → view brand identity
5. Monitor creation → change detection → notification
6. Scout creation → run search → view findings
7. Research session → multi-turn conversation → view sources

---

## Testing Best Practices

### 1. Test Organization

```
src/
  platform/
    firecrawl/
      service.ts
      service.test.ts    # Co-located with implementation
  daedalus/
    enrich/
      api.ts
      api.test.ts        # Co-located with implementation
  app/
    api/
      enrich/
        route.ts
        route.test.ts    # Co-located with API route
```

### 2. Test Naming Convention

```typescript
// Good: Descriptive, clear intent
test('rejects empty responses from Firecrawl API')
test('retries failed requests with exponential backoff')
test('enforces rate limiting after 10 requests per minute')

// Bad: Vague, unclear
test('handles errors')
test('works correctly')
test('test case 1')
```

### 3. Test Structure (Arrange-Act-Assert)

```typescript
test('enriches lead with valid email', async () => {
  // Arrange - Set up test data and mocks
  const email = 'john@acme.com'
  const mockSession = { user: { id: 'user-123' } }

  // Act - Execute the code being tested
  const result = await enrichLead(email, mockSession.user.id)

  // Assert - Verify expected outcomes
  expect(result.email).toBe(email)
  expect(result.company).toBeDefined()
  expect(result.role).toBeDefined()
  expect(result.sources).toHaveLength(5) // discovery, profile, funding, tech, custom
})
```

### 4. Mocking External Services

```typescript
import { describe, test, expect, mock } from 'bun:test'

// Mock Firecrawl service
const mockFirecrawl = {
  scrape: mock(async (url: string) => ({
    success: true,
    markdown: '# Company Name\n\nAbout us...',
    metadata: { title: 'Company Name' }
  }))
}

test('extracts brand identity', async () => {
  // Use mocked service
  const result = await extractBrand('https://example.com', mockFirecrawl)

  expect(mockFirecrawl.scrape).toHaveBeenCalledWith('https://example.com')
  expect(result.brandName).toBeDefined()
})
```

### 5. Testing Async Operations

```typescript
import { describe, test, expect } from 'bun:test'

test('streams enrichment progress', async () => {
  const progressUpdates: string[] = []

  await enrichWithStream('john@acme.com', (update) => {
    progressUpdates.push(update.phase)
  })

  expect(progressUpdates).toEqual([
    'discovery',
    'company_profile',
    'funding',
    'tech_stack',
    'custom_fields'
  ])
})
```

### 6. Testing Error Conditions

```typescript
test('handles invalid email format', async () => {
  const invalidEmail = 'not-an-email'

  await expect(async () => {
    await enrichLead(invalidEmail, 'user-123')
  }).toThrow('Invalid email format')
})

test('returns structured error on API failure', async () => {
  // Mock API failure
  const mockFirecrawl = {
    scrape: mock(async () => {
      throw new Error('API rate limit exceeded')
    })
  }

  const result = await extractBrand('https://example.com', mockFirecrawl)

  expect(result.success).toBe(false)
  expect(result.error).toBeDefined()
  expect(result.error.message).toContain('rate limit')
})
```

---

## Running Tests in CI/CD

### GitHub Actions (Recommended)

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Run tests
        run: bun test

      - name: Run linter
        run: bun run lint

      - name: Type check
        run: bunx tsc --noEmit
```

### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

bun test
bun run lint
bunx tsc --noEmit
```

---

## Test Data Management

### Test Fixtures

**Location:** `tests/fixtures/`

**Examples:**
- Sample CSV files for enrichment testing
- Mock API responses
- Test user accounts
- Sample brand data

### Database Seeding

**Strategy:**
- Use transactions for test isolation
- Clean up after each test
- Use realistic test data
- Document test data relationships

```typescript
import { db } from '@/platform/db/kysely'

async function seedTestData() {
  await db.transaction().execute(async (trx) => {
    const user = await trx.insertInto('user')
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    await trx.insertInto('enrichment_jobs')
      .values({
        user_id: user.id,
        status: 'completed',
        input_type: 'email',
        input_value: 'john@acme.com'
      })
      .execute()
  })
}
```

---

## Test Metrics

### Current Status (2026-02-15)

**Test Execution:**
- Total Tests: 20+ (Firecrawl + Scout workflows)
- Passing: 20+/20+ (100%)
- Failing: 0
- Execution Time: <2 seconds

**Test Files:**
- `src/platform/firecrawl/service.test.ts` - Firecrawl service comprehensive tests
- `src/daedalus/scout/workflow.test.ts` - Scout workflow unit tests

**Coverage:**
- Platform Services: 30% (Firecrawl + Scout)
- API Routes: 0%
- Workflows: 15% (Scout workflow tested)
- UI Components: 0%

**Overall Coverage:** ~10% (needs significant expansion)

### Target Metrics (Goals)

- **Unit Test Coverage:** 80%+
- **Integration Test Coverage:** 60%+
- **API Route Coverage:** 90%+
- **Critical Path Coverage:** 100%
- **Test Execution Time:** <5 minutes for full suite

---

## Known Issues

### TypeScript Compilation Errors

**Status:** Blocking strict type checking

**Issues:**
- `.next` build type generation errors
- AI SDK tool type mismatches
- UI component prop type issues

**Impact on Testing:**
- Cannot enable strict TypeScript mode
- Some tests may have type inconsistencies
- Need to fix before expanding test suite

**Next Steps:**
1. Resolve `.next` type errors
2. Fix AI SDK tool types
3. Correct UI component prop types
4. Enable strict TypeScript checks

---

## Next Steps (Priority Order)

### Immediate (Week 1)
1. Add API route tests for all primitives
2. Add workflow tests for core enrichment pipeline
3. Fix TypeScript compilation errors

### Short-term (Weeks 2-4)
4. Add integration tests for Firecrawl + LLM pipelines
5. Add database operation tests
6. Expand Firecrawl service test coverage
7. Add AI provider tests

### Medium-term (Weeks 5-8)
8. Set up E2E testing infrastructure (Playwright)
9. Add E2E tests for critical user flows
10. Implement test fixtures and seeding
11. Add performance benchmarking tests

### Long-term (Weeks 9+)
12. Achieve 80%+ unit test coverage
13. Achieve 60%+ integration test coverage
14. Set up continuous testing in CI/CD
15. Implement automated regression testing

---

## Resources

### Bun Test Documentation
- [Bun Test Runner](https://bun.sh/docs/cli/test)
- [Bun Mocking](https://bun.sh/docs/test/mocking)

### Testing Best Practices
- [Testing TypeScript Applications](https://github.com/testdouble/contributing-tests/wiki/Testing-TypeScript)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

### Related Documentation
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Overall project status
- [CLAUDE.md](../CLAUDE.md) - Developer guide and conventions
- [PRD.md](../PRD.md) - Product requirements and user stories

---

**Document Version:** 1.0
**Last Reviewed:** 2026-01-21
**Next Review:** After test coverage expansion
