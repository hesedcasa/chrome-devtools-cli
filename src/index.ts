#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import readline from "readline";

const DEFAULT_CHROME_SERVER = {
  command: "npx",
  args: ["-y", "chrome-devtools-mcp@latest"],
};

class ChromeDevToolsCLI {
  private client: Client | null = null;
  private rl: readline.Interface;
  private sessionName: string = "chrome-devtools";

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "chrome-devtools> ",
    });
  }

  async connect(serverConfig?: typeof DEFAULT_CHROME_SERVER): Promise<void> {
    try {
      const command = serverConfig?.command || DEFAULT_CHROME_SERVER.command;
      const args = serverConfig?.args || DEFAULT_CHROME_SERVER.args;

      console.log("🔌 Connecting to Chrome DevTools MCP server...");
      console.log(`   Command: ${command}`);
      console.log(`   Args: ${args.join(" ")}`);

      this.client = new Client(
        {
          name: "chrome-devtools-mcp-cli",
          version: "1.0.0",
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

      console.log("✅ Connected successfully!");
      console.log("");
      await this.printAvailableTools();
      console.log("");
      console.log('Type "help" for available commands or "exit" to quit.');
      console.log("");
    } catch (error) {
      console.error("❌ Failed to connect to MCP server:", error);
      process.exit(1);
    }
  }

  private async printAvailableTools(): Promise<void> {
    if (!this.client) {
      console.log("No tools available - not connected");
      return;
    }

    try {
      const result = await this.client.listTools();
      console.log("📋 Available tools:");
      result.tools.forEach((tool, index) => {
        console.log(`  ${index + 1}. ${tool.name}`);
        if (tool.description) {
          console.log(`     ${tool.description}`);
        }
      });
    } catch (error) {
      console.log(
        "📋 Tools will be available after connection is fully established",
      );
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

    if (trimmed === "tools" || trimmed === "list") {
      await this.printAvailableTools();
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
      console.log("📤 Result:");
      console.log(JSON.stringify(result, null, 2));
      console.log("");
    } catch (error: any) {
      console.error("❌ Error calling tool:", error.message || error);
    }

    this.rl.prompt();
  }

  private printHelp(): void {
    console.log("");
    console.log("Available commands:");
    console.log("  tools, list     - List all available tools");
    console.log("  help, ?         - Show this help message");
    console.log("  clear           - Clear the screen");
    console.log("  exit, quit, q   - Exit the CLI");
    console.log("");
    console.log("To use a tool, type the tool name followed by arguments:");
    console.log("  <tool_name> [arguments]");
    console.log("");
    console.log("Arguments can be:");
    console.log('  - A JSON object: {"url": "https://example.com"}');
    console.log("  - A single string (e.g., URL): https://example.com");
    console.log("  - Multiple space-separated args");
    console.log("");
  }

  async start(): Promise<void> {
    this.rl.prompt();

    this.rl.on("line", async (line) => {
      await this.handleCommand(line);
    });

    this.rl.on("close", async () => {
      await this.disconnect();
    });

    // Handle Ctrl+C
    process.on("SIGINT", async () => {
      console.log("\nReceived SIGINT, disconnecting...");
      await this.disconnect();
      process.exit(0);
    });

    // Handle Ctrl+D
    process.on("SIGTERM", async () => {
      console.log("\nReceived SIGTERM, disconnecting...");
      await this.disconnect();
      process.exit(0);
    });
  }

  private async disconnect(): Promise<void> {
    console.log("🔌 Disconnecting from server...");
    console.log("✅ Disconnected successfully");
    this.rl.close();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
let customServer: typeof DEFAULT_CHROME_SERVER | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--command" && i + 1 < args.length) {
    customServer = { command: args[i + 1], args: [] };
    i++;
  } else if (args[i] === "--args" && i + 1 < args.length) {
    if (!customServer) {
      customServer = { command: DEFAULT_CHROME_SERVER.command, args: [] };
    }
    customServer.args = args[i + 1].split(" ");
    i++;
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
Chrome DevTools MCP CLI

Usage:
  npm start [options]

Options:
  --command <cmd>  Custom command to run the MCP server (default: npx)
  --args <args>    Custom arguments for the MCP server (default: "-y chrome-devtools-mcp@latest")
  --help, -h       Show this help message

Examples:
  npm start
  npm start --command npx --args "-y chrome-devtools-mcp@latest"
`);
    process.exit(0);
  }
}

// Main execution
async function main() {
  const cli = new ChromeDevToolsCLI();
  await cli.connect(customServer);
  await cli.start();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
