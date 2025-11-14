# Chrome DevTools CLI Test Suite

This directory contains comprehensive tests for the Chrome DevTools CLI project.

## Test Structure

```
tests/
├── unit/                           # Unit tests for individual modules
│   ├── utils/
│   │   └── argParser.test.ts      # 12 tests for argument parsing
│   ├── config/
│   │   └── constants.test.ts      # 26 tests for configuration constants
│   └── commands/
│       ├── helpers.test.ts        # 20 tests for command helpers
│       └── runner.test.ts         # 15 tests for headless command execution
└── integration/                    # Integration tests
    └── cli/
        └── chromeDevToolsCLI.test.ts  # 20 tests for CLI REPL functionality

Total: 93 tests across 5 test files
```

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

### Unit Tests

#### `utils/argParser.test.ts` (12 tests)

- Version flags (`--version`, `-v`)
- Commands listing (`--commands`)
- Help flags (`--help`, `-h`)
- Command-specific help (`<command> -h`)
- Headless command execution
- Argument parsing and flag handling

#### `config/constants.test.ts` (26 tests)

- `DEFAULT_CHROME_SERVER` configuration
- `COMMANDS` array structure and content
- `COMMANDS_INFO` descriptions
- `COMMANDS_DETAIL` parameter documentation
- Array alignment and consistency

#### `commands/helpers.test.ts` (20 tests)

- `getCurrentVersion()` function
- `printAvailableCommands()` output
- `printCommandDetail()` for valid/invalid commands
- Error handling for unknown commands
- Empty input handling

#### `commands/runner.test.ts` (15 tests)

- Headless command execution
- JSON argument parsing
- `--headless` flag handling
- Error handling (connection, execution, JSON parsing)
- Client lifecycle management

### Integration Tests

#### `cli/chromeDevToolsCLI.test.ts` (20 tests)

- Constructor and readline interface setup
- MCP server connection
- REPL command handling:
  - Special commands: `help`, `commands`, `clear`, `exit`, `quit`, `q`
  - Tool execution with/without arguments
  - Command-specific help (`<command> -h`)
  - Empty/whitespace input
  - Error handling
- Signal handlers for graceful shutdown

## Testing Framework

The project uses **Vitest** as the testing framework, chosen for:

- Native ES modules support (matches the project's `"type": "module"`)
- Fast execution with intelligent watch mode
- TypeScript support out of the box
- Compatible API with other testing frameworks
- Built-in coverage reporting

## Test Configuration

Configuration is defined in `vitest.config.ts`:

- **Environment**: Node.js
- **Coverage Provider**: v8
- **Coverage Reporters**: text, json, html
- **Excluded from Coverage**: node_modules, dist, type definitions, config files, barrel exports

## Mocking Strategy

Tests use Vitest's mocking capabilities to:

1. **Mock MCP SDK**: Prevents actual connection attempts to Chrome DevTools server
2. **Mock Console**: Captures console output for assertions
3. **Mock Process**: Prevents test process from exiting during tests
4. **Mock Readline**: Simulates user input in REPL tests

## Writing New Tests

When adding new features, follow these patterns:

1. **Unit Tests**: Test individual functions/modules in isolation
   - Place in `tests/unit/<module>/`
   - Mock all external dependencies
   - Focus on single responsibility

2. **Integration Tests**: Test how modules work together
   - Place in `tests/integration/<feature>/`
   - Mock only external systems (MCP server, process, etc.)
   - Test real interactions between internal modules

### Example Test Structure

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('MyModule', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('myFunction', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = myFunction(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Continuous Testing

For development, use watch mode:

```bash
npm run test:watch
```

This will:

- Re-run tests when source or test files change
- Show only failed tests by default
- Provide an interactive menu for filtering tests

## Coverage Goals

Current test coverage focuses on:

- ✅ All exported functions
- ✅ Error paths and edge cases
- ✅ Command parsing and validation
- ✅ User interaction flows
- ✅ Configuration validation

## Known Limitations

- **MCP Server Integration**: Tests mock the MCP SDK; full end-to-end tests would require a running Chrome instance
- **Readline Interaction**: Real terminal interactions are mocked; manual testing recommended for user experience validation

## Contributing

When adding tests:

1. Ensure all tests pass: `npm test`
2. Maintain or improve coverage: `npm run test:coverage`
3. Follow existing patterns and structure
4. Add descriptive test names
5. Test both success and failure paths
