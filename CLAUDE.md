# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
# Install dependencies
npm install

# Build the TypeScript source
npm run build

# Run the CLI (development mode with tsx)
npm start

# Run in development (same as start)
npm run dev
```

**Note**: The CLI connects to a Chrome DevTools MCP server. For full functionality (browser control):

## Project Architecture

This is a **single-file TypeScript CLI** that provides a REPL interface for controlling Chrome/Chromium browsers through the Model Context Protocol (MCP).

### Core Components (src/index.ts:1-273)

- **ChromeDevToolsCLI class**: Main orchestrator managing:
  - `connect()` - Establishes MCP server connection via `mcp-use` library
  - `start()` - Initiates interactive REPL with readline interface
  - `handleCommand()` - Parses and processes user commands
  - `callTool()` - Executes MCP tools with JSON argument parsing
  - `disconnect()` - Graceful cleanup on exit signals (SIGINT/SIGTERM)

- **MCP Client Integration**:
  - Uses `@modelcontextprotocol/sdk` for protocol communication
  - Connects to `chrome-devtools-mcp@latest` server via stdio
  - Discovers and lists 26 available browser control tools

- **REPL Interface**:
  - Custom prompt: `chrome-devtools>`
  - Special commands: `help`, `tools`, `clear`, `exit/quit/q`
  - Tool invocation: Direct tool name with JSON or string arguments

### TypeScript Configuration

- **Target**: ES2022 modules (package.json:9 `"type": "module"`)
- **Output**: Compiles to `dist/index.js` (7.8KB)
- **Declarations**: Generates `dist/index.d.ts` (66B)
- **Source Maps**: Enabled for debugging

## Common Development Tasks

### Building and Running

```bash
# Build TypeScript to JavaScript
npm run build

# Run with tsx (no build step needed)
npm start
# or
npm run dev

# After building, use the compiled binary
npm link  # Link globally
chrome-mcp-cli  # Use the CLI command
```

### Available Tools

The CLI exposes **26 browser control tools** from the MCP server:

- **Navigation**: `navigate_page` (primary tool for URL navigation)
- **Interaction**: `click`, `hover`, `type`, `fill`, `fill_form`, `drag`, `press_key`
- **Content**: `take_screenshot`, `take_snapshot`, `get_page_content`, `get_page_info`
- **Pages**: `list_pages`, `new_page`, `close_page`, `select_page`, `resize_page`
- **JavaScript**: `evaluate_script`
- **Console**: `get_console_message`, `list_console_messages`
- **Network**: `get_network_request`, `list_network_requests`
- **Dialogs**: `handle_dialog`
- **Performance**: `performance_analyze_insight`, `performance_start_trace`, `performance_stop_trace`
- **Files**: `upload_file`
- **Waiting**: `wait_for`
- **Device**: `emulate`

### Command Examples

```bash
# Start the CLI
npm start

# Inside the REPL:
chrome-devtools> tools                    # List all 26 tools
chrome-devtools> help                     # Show help
chrome-devtools> navigate_page https://google.com  # Navigate to URL
chrome-devtools> take_screenshot          # Take screenshot
chrome-devtools> evaluate_script {"expression": "document.title"}
chrome-devtools> exit                     # Exit
```

## Code Structure

### Source Layout

```
src/index.ts (273 lines)
├── Imports (lines 1-8)
│   ├── mcp-use for server connection
│   ├── @modelcontextprotocol/sdk for MCP types
│   └── readline/promises for REPL
├── Type definitions (lines 10-18)
│   └── CLIArguments interface
├── ChromeDevToolsCLI class (lines 20-245)
│   ├── Constructor & initialization
│   ├── connect() - MCP server connection
│   ├── printAvailableTools() - List tools
│   ├── handleCommand() - Command parsing
│   ├── callTool() - Tool execution
│   ├── start() - REPL loop
│   └── disconnect() - Cleanup
└── main() entry point (lines 247-273)
    └── Argument parsing and CLI instantiation
```

### Key Implementation Details

- **Argument Parsing**: Supports `--command` and `--args` flags for custom MCP servers
- **Tool Arguments**: Accepts both JSON (`{"key": "value"}`) and string arguments
- **Connection Management**: Uses `mcp-use` to connect via stdio transport
- **Signal Handling**: Graceful shutdown on Ctrl+C (SIGINT) and SIGTERM
- **Error Handling**: Try-catch blocks for connection and tool execution

## Dependencies

**Runtime (2)**:
- `@modelcontextprotocol/sdk@^1.0.0` - Official MCP client SDK
- `mcp-use@^1.0.0` - MCP server connection utility

**Development (3)**:
- `typescript@^5.0.0` - TypeScript compiler
- `tsx@^4.0.0` - TypeScript execution runtime
- `@types/node@^20.0.0` - Node.js type definitions

## Testing and Verification

See **TESTING.md** for comprehensive test results. Key verified features:
- ✅ CLI connection to MCP server
- ✅ All 26 tools discoverable
- ✅ Interactive REPL functionality
- ✅ Command parsing (JSON/string)
- ✅ Graceful exit handling

## Important Notes

1. **Single File**: All logic is in `src/index.ts` - no complex module structure
2. **ES2022 Modules**: Project uses `"type": "module"` - no CommonJS
3. **MCP Ecosystem**: This CLI is a client that connects to the `chrome-devtools-mcp` server package
4. **No Tests**: No explicit test scripts in package.json, but TESTING.md documents manual testing

## Development Tips

- Edit `src/index.ts` and test with `npm start` (tsx provides fast iteration)
- Use `npm run build` before committing to ensure TypeScript compiles
- The CLI will automatically download `chrome-devtools-mcp@latest` on first connection
- Tools can be called with or without JSON: `navigate_page https://example.com` works
- Use `tools` command in REPL to see all 26 available tools anytime
