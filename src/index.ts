#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import readline from "readline";

const DEFAULT_CHROME_SERVER = {
  command: "npx",
  args: [
    "-y",
    "chrome-devtools-mcp@latest",
    "--browser-url=http://127.0.0.1:9222",
  ],
};

const COMMANDS: string[] = [
  "click",
  "close_page",
  "drag",
  "emulate",
  "evaluate_script",
  "fill",
  "fill_form",
  "get_console_message",
  "get_network_request",
  "handle_dialog",
  "hover",
  "list_console_messages",
  "list_network_requests",
  "list_pages",
  "navigate_page",
  "new_page",
  "performance_analyze_insight",
  "performance_start_trace",
  "performance_stop_trace",
  "press_key",
  "resize_page",
  "select_page",
  "take_screenshot",
  "take_snapshot",
  "upload_file",
  "wait_for",
];

const COMMANDS_INFO: string[] = [
  "Clicks on the provided element",
  "Closes the page by its index. The last open page cannot be closed.",
  "Drag an element onto another element",
  "Emulates various features on the selected page.",
  "Evaluate a JavaScript function inside the currently selected page. Returns the response as JSON so returned values have to JSON-serializable.",
  "Type text into a input, text area or select an option from a <select> element.",
  "Fill out multiple form elements at once",
  "Gets a console message by its ID. You can get all messages by calling list_console_messages.",
  "Gets a network request by an optional reqid, if omitted returns the currently selected request in the DevTools Network panel.",
  "If a browser dialog was opened, use this command to handle it",
  "Hover over the provided element",
  "List all console messages for the currently selected page since the last navigation.",
  "List all requests for the currently selected page since the last navigation.",
  "Get a list of pages open in the browser.",
  "Navigates the currently selected page to a URL.",
  "Creates a new page",
  "Provides more detailed information on a specific Performance Insight of an insight set that was highlighted in the results of a trace recording.",
  "Starts a performance trace recording on the selected page. This can be used to look for performance problems and insights to improve the performance of the page. It will also report Core Web Vital (CWV) scores for the page.",
  "Stops the active performance trace recording on the selected page.",
  "Press a key or key combination. Use this when other input methods like fill() cannot be used (e.g., keyboard shortcuts, navigation keys, or special key combinations).",
  "Resizes the selected page's window so that the page has specified dimension",
  "Select a page as a context for future tool calls.",
  "Take a screenshot of the page or element.",
  "Take a text snapshot of the currently selected page based on the a11y tree. The snapshot lists page elements along with a unique identifier (uid). Always use the latest snapshot. Prefer taking a snapshot over taking a screenshot. The snapshot indicates the element selected in the DevTools Elements panel (if any).",
  "Upload a file through a provided element.",
  "Wait for the specified text to appear on the selected page.",
];

const COMMANDS_DETAIL: string[] = [
  `
- uid (required): string - The uid of an element on the page from the page content snapshot
- dblClick: boolean - Set to true for double clicks. Default is false.
`,
  `
- pageIdx (required): number - The index of the page to close. Call list_pages to list pages.
`,
  `
- from_uid (required): string - The uid of the element to drag
- to_uid (required): string - The uid of the element to drop into
`,
  `
- networkConditions: string - Throttle network. Set to "No emulation" to disable. If omitted, conditions remain unchanged.
- cpuThrottlingRate: number - Represents the CPU slowdown factor. Set the rate to 1 to disable throttling. If omitted, throttling remains unchanged.
`,
  `
- function (required): string - A JavaScript function declaration to be executed by the tool in the currently selected page.
Example without arguments:
() => {return document.title} or
async () => {return await fetch("example.com")}.
Example with arguments:
(el) => {return el.innerText;}
- args: array - An optional list of arguments to pass to the function.
`,
  `
- uid (required): string - The uid of an element on the page from the page content snapshot
- value (required): string - The value to fill in
`,
  `
- elements (required): array - Elements from snapshot to fill out.
`,
  `
- msgid (required): number - The msgid of a console message on the page from the listed console messages
`,
  `
- reqid: number - The reqid of the network request. If omitted returns the currently selected request in the DevTools Network panel
`,
  `
- action (required): string - Whether to dismiss or accept the dialog
- promptText: string - Optional prompt text to enter into the dialog.
`,
  `
- uid (required): string - The uid of an element on the page from the page content snapshot
`,
  `
- pageSize: integer - Maximum number of messages to return. When omitted, returns all requests.
- pageIdx: integer - Page number to return (0-based). When omitted, returns the first page.
- types: array - Filter messages to only return messages of the specified resource types. When omitted or empty, returns all messages.
- includePreservedMessages: boolean - Set to true to return the preserved messages over the last 3 navigations.
`,
  `
- pageSize: integer - Maximum number of requests to return. When omitted, returns all requests.
- pageIdx: integer - Page number to return (0-based). When omitted, returns the first page.
- resourceTypes: array - Filter requests to only return requests of the specified resource types. When omitted or empty, returns all requests.
- includePreservedRequests: boolean - Set to true to return the preserved requests over the last 3 navigations.
`,
  `

`,
  `
- type: string - Navigate the page by URL, back or forward in history, or reload.
- url: string - Target URL (only type=url)
- ignoreCache: boolean - Whether to ignore cache on reload.
- timeout: integer - Maximum wait time in milliseconds. If set to 0, the default timeout will be used.
`,
  `
- url (required): string - URL to load in a new page.
- timeout: integer - Maximum wait time in milliseconds. If set to 0, the default timeout will be used.
`,
  `
- insightSetId (required): string - The id for the specific insight set. Only use the ids given in the "Available insight sets" list.
- insightName (required): string - The name of the Insight you want more information on. For example: "DocumentLatency" or "LCPBreakdown"
`,
  `
- reload (required): boolean - Determines if, once tracing has started, the page should be automatically reloaded.
- autoStop (required): boolean - Determines if the trace recording should be automatically stopped.
`,
  `

`,
  `
- key (required): string - A key or a combination (e.g., "Enter", "Control+A", "Control++", "Control+Shift+R"). Modifiers: Control, Shift, Alt, Meta
`,
  `
- width (required): number - Page width
- height (required): number - Page height
`,
  `
- pageIdx (required): number - The index of the page to select. Call list_pages to list pages.
`,
  `
- format: string - Type of format to save the screenshot as. Default is "png"                                                                                                          │
- quality: number - Compression quality for JPEG and WebP formats (0-100). Higher values mean better quality but larger file sizes. Ignored for PNG format.
- uid: string - The uid of an element on the page from the page content snapshot. If omitted takes a pages screenshot.
- fullPage: boolean - If set to true takes a screenshot of the full page instead of the currently visible viewport. Incompatible with uid.
- filePath: string - The absolute path, or a path relative to the current working directory, to save the screenshot to instead of attaching it to the response.
`,
  `
- verbose: boolean - Whether to include all possible information available in the full a11y tree. Default is false.
- filePath: string - The absolute path, or a path relative to the current working directory, to save the snapshot to instead of attaching it to the response.
`,
  `
- uid (required): string - The uid of the file input element or an element that will open file chooser on the page from the page content snapshot
- filePath (required): string - The local path of the file to upload
`,
  `
- text (required): string - Text to appear on the page
- timeout: integer - Maximum wait time in milliseconds. If set to 0, the default timeout will be used.
`,
];

const printAvailableCommands = () => {
  console.log("\nAvailable commands:");
  COMMANDS.forEach((name, i) => {
    const info = COMMANDS_INFO[i];
    console.log(`${i + 1}. ${name}: ${info}`);
  });
};

const printCommandDetail = (command: string) => {
  const name = (command || "").trim();
  if (!name) {
    console.log("Please provide a command name.");
    printAvailableCommands();
    return;
  }

  const idx = COMMANDS.indexOf(name);
  if (idx === -1) {
    console.log(`Unknown command: ${name}`);
    printAvailableCommands();
    return;
  }

  const info = COMMANDS_INFO[idx] || "No additional information available.";
  const detail = (COMMANDS_DETAIL[idx] || "").trim();

  console.log(`${name}\n${info}${detail ? `\n${detail}` : ""}`);
};

const runCommand = async (
  command: string,
  arg: string | null,
  flag: string | null,
) => {
  try {
    // Prepare client and transport
    const client = new Client(
      {
        name: "chrome-devtools-cli-headless",
        version: "1",
      },
      {
        capabilities: {},
      },
    );

    const transport = new StdioClientTransport({
      command: DEFAULT_CHROME_SERVER.command,
      args:
        flag === "--headless"
          ? [...DEFAULT_CHROME_SERVER.args, "--headless=true"]
          : [...DEFAULT_CHROME_SERVER.args],
    });

    await client.connect(transport);

    let argObj: { [key: string]: unknown } =
      arg && arg.trim() !== "" ? JSON.parse(arg) : {};

    const result = await client.callTool(
      {
        name: command,
        arguments: argObj,
      },
      CallToolResultSchema,
    );

    console.log(JSON.stringify(result, null, 2));

    await client.close();

    process.exit(0);
  } catch (error: any) {
    console.error("Error running command:", error?.message ?? error);
    process.exit(1);
  }
};

class ChromeDevToolsCLI {
  private client: Client | null = null;
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "chrome> ",
    });
  }

  async connect(): Promise<void> {
    try {
      const command = DEFAULT_CHROME_SERVER.command;
      const args = DEFAULT_CHROME_SERVER.args;

      this.client = new Client(
        {
          name: "chrome-devtools-cli",
          version: "1",
        },
        {
          capabilities: {},
        },
      );

      const transport = new StdioClientTransport({
        command,
        args,
      });

      await this.client.connect(transport);

      console.log(`
Chrome DevTools CLI

Usage:

commands         list all the available commands
<command> -h     quick help on <command>
<command> <arg>  run <command> with argument
clear            clear the screen
exit, quit, q    exit the CLI

All commands:

click, close_page, drag, emulate, evaluate_script, fill, fill_form,
get_console_message, get_network_request, handle_dialog, hover,
list_console_messages, list_network_requests, list_pages, navigate_page,
new_page, performance_analyze_insight, performance_start_trace,
performance_stop_trace, press_key, resize_page, select_page,
take_screenshot, take_snapshot, upload_file, wait_for

`);
    } catch (error) {
      console.error("Failed to connect to Chrome:", error);
      process.exit(1);
    }
  }

  private async handleCommand(input: string): Promise<void> {
    const trimmed = input.trim();

    if (!trimmed) {
      this.rl.prompt();
      return;
    }

    // Handle special commands
    if (trimmed === "exit" || trimmed === "quit" || trimmed === "q") {
      await this.disconnect();
      return;
    }

    if (trimmed === "help" || trimmed === "?") {
      this.printHelp();
      this.rl.prompt();
      return;
    }

    if (trimmed === "commands") {
      printAvailableCommands();
      this.rl.prompt();
      return;
    }

    if (trimmed === "clear") {
      console.clear();
      this.rl.prompt();
      return;
    }

    // Parse tool invocation: tool_name [args...]
    const parts = trimmed.split(" ");
    const toolName = parts[0];
    const args = parts.slice(1);

    await this.callTool(toolName, args);
  }

  private async callTool(toolName: string, args: string[]): Promise<void> {
    if (!this.client) {
      console.log("❌ Not connected to any server");
      this.rl.prompt();
      return;
    }

    try {
      console.log(`🔧 Calling tool: ${toolName}...`);

      // Parse JSON arguments if the second argument is a JSON string
      let arguments_: any = {};

      if (args.length === 1) {
        try {
          arguments_ = JSON.parse(args[0]);
        } catch {
          // If not JSON, treat as a simple URL or string argument
          arguments_ = { url: args[0] };
        }
      } else if (args.length > 1) {
        // Try to parse as JSON, fallback to object with numbered keys
        try {
          arguments_ = JSON.parse(args.join(" "));
        } catch {
          arguments_ = {};
          args.forEach((arg, idx) => {
            arguments_[`arg${idx}`] = arg;
          });
        }
      }

      const result = await this.client.callTool(
        {
          name: toolName,
          arguments: arguments_,
        },
        CallToolResultSchema,
      );

      console.log("");
      console.log("📋 Result:");
      console.log(JSON.stringify(result, null, 2));
      console.log("");
    } catch (error: any) {
      console.error("❌ Error calling tool:", error.message || error);
    }

    this.rl.prompt();
  }

  private printHelp(): void {
    console.log(`
Available commands:
  tools           - List all available tools
  help, ?         - Show this help message
  clear           - Clear the screen
  exit, quit, q   - Exit the CLI

To use a tool, type the tool name followed by arguments:
  <tool_name> [arguments]

Arguments can be:
  - A JSON object: {"url": "https://example.com"}
  - A single string (e.g., URL): https://example.com
  - Multiple space-separated args
`);
  }

  async start(): Promise<void> {
    this.rl.prompt();

    this.rl.on("line", async (line) => {
      await this.handleCommand(line);
    });

    this.rl.on("close", async () => {
      console.log("📡 Disconnect from server...");
      process.exit(0);
    });

    // Handle termination signals (e.g., Ctrl+C, Ctrl+D)
    const gracefulShutdown = async (signal: string) => {
      try {
        await this.disconnect();
      } catch (error) {
        console.error("Error during shutdown:", error);
      } finally {
        process.exit(0);
      }
    };

    ["SIGINT", "SIGTERM"].forEach((sig) => {
      process.on(sig, () => {
        gracefulShutdown(sig);
      });
    });
  }

  private async disconnect(): Promise<void> {
    this.rl.close();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--version" || args[i] === "-v") {
    console.log("1.0.1");
    process.exit(0);
  } else if (args[i] === "--commands") {
    printAvailableCommands();
    process.exit(0);
  } else if (i === 0 && args.length >= 2 && args[1] === "-h") {
    printCommandDetail(args[0]);
    process.exit(0);
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
Chrome DevTools CLI

Usage:

npx chrome-devtools-cli                  start interactive CLI
npx chrome-devtools-cli --headless       run CLI in headless mode
npx chrome-devtools-cli --commands       list all the available commands
npx chrome-devtools-cli <command> -h     quick help on <command>
npx chrome-devtools-cli <command> <arg>  run command in headless mode

All commands:

click, close_page, drag, emulate, evaluate_script, fill, fill_form,
get_console_message, get_network_request, handle_dialog, hover,
list_console_messages, list_network_requests, list_pages, navigate_page,
new_page, performance_analyze_insight, performance_start_trace,
performance_stop_trace, press_key, resize_page, select_page,
take_screenshot, take_snapshot, upload_file, wait_for

`);
    process.exit(0);
  } else if (
    i === 0 &&
    args.length >= 1 &&
    args[1] !== "-h" &&
    COMMANDS.includes(args[0])
  ) {
    const rest = args.slice(1);
    const params = (rest.find((a) => !a.startsWith("-")) ?? null) as
      | string
      | null;
    const flag = (rest.find((a) => a.startsWith("-")) ?? null) as string | null;

    let message = `chrome> ${args[0]}`;
    if (params) message += ` ${params}`;
    if (flag) message += ` ${flag}`;
    console.log(message);

    await runCommand(args[0], params, flag);

    process.exit(0);
  }
}

// Main execution
async function main() {
  const cli = new ChromeDevToolsCLI();
  await cli.connect();
  await cli.start();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
