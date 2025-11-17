import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';

import { DEFAULT_CHROME_SERVER } from '../config/index.js';

/**
 * Commands that require take_snapshot to be called before execution
 */
const COMMANDS_REQUIRING_SNAPSHOT = [
  'click',
  'drag',
  'fill',
  'fill_form',
  'handle_dialog',
  'hover',
  'press_key',
  'upload_file',
];

/**
 * Runs a command in headless mode (non-interactive)
 * @param command - The command/tool name to execute
 * @param arg - JSON string or null for the command arguments
 * @param flag - Optional flag (e.g., "--headless")
 */
export const runCommand = async (command: string, arg: string | null, flag: string | null): Promise<void> => {
  try {
    console.log([command, arg, flag].filter(Boolean).join(' '));

    // Prepare client and transport
    const client = new Client(
      {
        name: 'chrome-devtools-cli-headless',
        version: '1',
      },
      {
        capabilities: {},
      }
    );

    const transport = new StdioClientTransport({
      command: DEFAULT_CHROME_SERVER.command,
      args:
        flag === '--headless' ? [...DEFAULT_CHROME_SERVER.args, '--headless=true'] : [...DEFAULT_CHROME_SERVER.args],
    });

    await client.connect(transport);

    // Call take_snapshot first for commands that require it
    if (COMMANDS_REQUIRING_SNAPSHOT.includes(command)) {
      console.log('Taking snapshot before executing command...');
      await client.callTool(
        {
          name: 'take_snapshot',
          arguments: {},
        },
        CallToolResultSchema
      );
    }

    const argObj: { [key: string]: unknown } = arg && arg.trim() !== '' ? JSON.parse(arg) : {};

    const result = await client.callTool(
      {
        name: command,
        arguments: argObj,
      },
      CallToolResultSchema
    );

    console.log(JSON.stringify(result, null, 2));

    await client.close();

    process.exit(0);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running command:', errorMessage);
    process.exit(1);
  }
};
