# Chrome DevTools MCP CLI

A command-line interface for connecting to and interacting with Chrome DevTools through the Model Context Protocol (MCP). This CLI keeps a persistent connection open to the Chrome DevTools MCP server, allowing you to programmatically control Chrome browsers.

## Features

- 🔌 Persistent connection to Chrome DevTools MCP server
- 🛠️ Interactive REPL for browser control
- 📋 List all available tools
- 🎯 Call tools with arguments directly from CLI
- 🔒 Graceful connection management and cleanup
- ⌨️ Simple, intuitive command interface

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Link the binary globally (optional)
npm link
```

## Usage

### Start the CLI

```bash
# Using npm script
npm start

# Using tsx directly
npx tsx src/index.ts

# After npm link, use the binary
chrome-mcp-cli
```

### Interactive Commands

Once the CLI starts, you'll see the prompt `chrome-devtools> ` and can use these commands:

#### Special Commands

- `help` or `?` - Show available commands
- `tools` or `list` - List all available MCP tools
- `clear` - Clear the terminal screen
- `exit`, `quit`, or `q` - Exit the CLI

#### Tool Invocation

Call any MCP tool by typing its name followed by arguments:

```
chrome-devtools> navigate https://example.com
chrome-devtools> take_screenshot path/to/screenshot.png
chrome-devtools> get_page_info
```

### Command Line Options

```bash
npm start -- --command npx --args "-y @chrome-devtools-mcp@latest"
```

Or use the built-in help:

```bash
npm start -- --help
```

## Example Session

```
🔌 Connecting to Chrome DevTools MCP server...
   Command: npx
   Args: -y @chrome-devtools-mcp@latest
✅ Connected successfully!

📋 Available tools:
  1. navigate
  2. take_screenshot
  3. get_page_info
  4. get_page_content
  [... and more ...]

Type "help" for available commands or "exit" to quit.

chrome-devtools> tools
📋 Available tools:
  1. navigate
  2. take_screenshot
  3. get_page_info
  [... and more ...]

chrome-devtools> navigate https://example.com
🔧 Calling tool: navigate...
📤 Result:
{ "success": true, "url": "https://example.com" }

chrome-devtools> take_screenshot /tmp/screenshot.png
🔧 Calling tool: take_screenshot...
📤 Result:
{ "success": true, "path": "/tmp/screenshot.png" }

chrome-devtools> exit
🔌 Disconnecting from server...
✅ Disconnected successfully
```

## Architecture

The CLI is built with the following components:

- **ChromeDevToolsCLI**: Main class that manages the connection and REPL
- **McpClient**: Uses the `mcp-use` library to connect to MCP servers
- **Readline Interface**: Provides the interactive command-line experience
- **Signal Handlers**: Gracefully handles SIGINT (Ctrl+C) and SIGTERM

### Connection Flow

1. Parse command-line arguments
2. Initialize the McpClient
3. Connect to the Chrome DevTools MCP server
4. List available tools
5. Start interactive REPL
6. Handle user commands and tool invocations
7. Clean up connection on exit

## Available Tools

The CLI exposes all tools provided by the Chrome DevTools MCP server, including but not limited to:

- **navigate**: Navigate to a URL
- **take_screenshot**: Capture a screenshot
- **get_page_info**: Get current page information
- **get_page_content**: Extract page content
- **evaluate**: Execute JavaScript in the browser
- **click**: Click elements by selector
- **type**: Input text into elements

## Requirements

- Node.js 18+ (uses ES2022 modules)
- npm
- Chrome browser installed
- Internet connection (to download the MCP server on first use)

## Troubleshooting

### Connection Issues

If the connection fails:

1. Ensure Chrome browser is installed
2. Try running with verbose output
3. Ensure you have the latest version of the MCP server

### Permission Issues

If you encounter permission errors:

1. Try using `npx` instead of globally installed commands
2. Check that the Chrome DevTools protocol is enabled
3. Verify firewall settings allow local connections

## Development

### Project Structure

```
├── src/
│   └── index.ts          # Main CLI entry point
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

### Build

```bash
npm run build
```

### Run in Development Mode

```bash
npm run dev
```

## License

MIT
