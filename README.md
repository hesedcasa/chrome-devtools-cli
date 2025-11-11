# Chrome DevTools CLI

[![npm chrome-devtools-cli package](https://img.shields.io/npm/v/chrome-devtools-cli.svg)](https://npmjs.org/package/chrome-devtools-cli)

A command-line interface for connecting to and interacting with Chrome DevTools. This CLI provides both interactive REPL and headless execution modes for programmatic browser control.

## Features

- 📡 Persistent connection to Chrome DevTools MCP server
- 💻 Interactive REPL for browser control
- 🚀 Headless mode for one-off command execution
- 🛠️ 26 browser control tools (navigation, interaction, screenshots, performance, etc.)
- 🔧 Command-specific help and documentation

## Requirements

- [Node.js](https://nodejs.org/) v20.19 or a newer [latest maintenance LTS](https://github.com/nodejs/Release#release-schedule) version
- [Chrome](https://www.google.com/chrome/) browser with remote debugging enabled on port 9222
- [npm](https://www.npmjs.com/)

## Installation

```bash
npm install -g chrome-devtools-cli
```

## Quick Start

### Start the Chrome browser

Start the Chrome browser with the remote debugging port 9222 enabled. Ensure to close any running Chrome instances before starting.

**macOS**

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile-stable
```

**Linux**

```bash
/usr/bin/google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile-stable
```

**Windows**

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%TEMP%\chrome-profile-stable"
```

### Interactive Mode

Start the CLI and interact with Chrome through a REPL:

```bash
npx chrome-devtools-cli
```

Once started, you'll see the `chrome>` prompt:

```
Chrome DevTools CLI

Usage:

commands         list all the available commands
<command> -h     quick help on <command>
<command> <arg>  run <command> with argument
clear            clear the screen
exit, quit, q    exit the CLI

chrome> commands
# Lists all 26 available commands

chrome> navigate_page {"url":"https://example.com","type":"url"}
# Navigates to the specified URL

chrome> take_screenshot {"fullPage":true,"filePath":"./screenshot.png"}
# Takes a full-page screenshot

chrome> exit
```

### Headless Mode

Execute single commands without starting the interactive REPL:

```bash
# General format
npx chrome-devtools-cli <command> '<json_arguments>'

# Examples
npx chrome-devtools-cli navigate_page '{"url":"https://google.com","type":"url"}'
npx chrome-devtools-cli take_screenshot '{"fullPage":true,"filePath":"./test.png"}'
npx chrome-devtools-cli list_pages

# With headless browser flag
npx chrome-devtools-cli navigate_page '{"url":"https://example.com","type":"url"}' --headless
```

### Command Line Options

```bash
# Show version
npx chrome-devtools-cli --version
npx chrome-devtools-cli -v

# List all commands
npx chrome-devtools-cli --commands

# Get help for specific command
npx chrome-devtools-cli navigate_page -h

# General help
npx chrome-devtools-cli --help
npx chrome-devtools-cli -h
```

## Available Tools

The CLI exposes **26 browser control tools** from the Chrome DevTools MCP server:

### Navigation & Pages

- **`navigate_page`** - Navigate to a URL, go back/forward, or reload
- **`list_pages`** - Get a list of open pages in the browser
- **`new_page`** - Create a new page
- **`close_page`** - Close a page by index
- **`select_page`** - Select a page as context for future commands
- **`resize_page`** - Resize the page window to specified dimensions

### User Interaction

- **`click`** - Click on an element (supports double-click)
- **`hover`** - Hover over an element
- **`type`** - Type text into input/textarea or select option
- **`fill`** - Fill a single form element
- **`fill_form`** - Fill multiple form elements at once
- **`drag`** - Drag an element onto another element
- **`press_key`** - Press a key or key combination

### Content & Screenshots

- **`take_screenshot`** - Capture a screenshot (PNG/JPEG/WebP)
- **`take_snapshot`** - Take a text snapshot based on accessibility tree
- **`get_page_content`** - Extract page content
- **`get_page_info`** - Get current page information

### JavaScript Execution

- **`evaluate_script`** - Execute JavaScript in the browser context

### Console & Network

- **`list_console_messages`** - List console messages for the current page
- **`get_console_message`** - Get a specific console message by ID
- **`list_network_requests`** - List network requests for the current page
- **`get_network_request`** - Get a specific network request by ID

### Performance

- **`performance_start_trace`** - Start performance trace recording
- **`performance_stop_trace`** - Stop performance trace recording
- **`performance_analyze_insight`** - Get detailed performance insights

### Advanced Features

- **`handle_dialog`** - Handle browser dialogs (accept/dismiss)
- **`upload_file`** - Upload a file through a file input element
- **`wait_for`** - Wait for specified text to appear on page
- **`emulate`** - Emulate network conditions and CPU throttling

## License

Apache-2.0
