/**
 * Configuration for the Chrome DevTools MCP server
 */
export interface ServerConfig {
  command: string;
  args: string[];
}

/**
 * Tool arguments type - flexible object with any properties
 */
export type ToolArguments = Record<string, unknown>;

/**
 * Command execution result
 */
export interface CommandResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
