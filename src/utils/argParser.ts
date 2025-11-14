import { getCurrentVersion, printAvailableCommands, printCommandDetail } from '../commands/index.js';
import { runCommand } from '../commands/index.js';
import { COMMANDS } from '../config/index.js';

/**
 * Parses and handles command line arguments
 * @param args - Command line arguments (process.argv.slice(2))
 * @returns true if arguments were handled and should exit, false to continue to interactive mode
 */
export const parseArguments = async (args: string[]): Promise<boolean> => {
  for (let i = 0; i < args.length; i++) {
    // Version flag
    if (args[i] === '--version' || args[i] === '-v') {
      console.log(getCurrentVersion());
      process.exit(0);
    }

    // List commands flag
    if (args[i] === '--commands') {
      printAvailableCommands();
      process.exit(0);
    }

    // Command-specific help
    if (i === 0 && args.length >= 2 && args[1] === '-h') {
      printCommandDetail(args[0]);
      process.exit(0);
    }

    // General help flag
    if (args[i] === '--help' || args[i] === '-h') {
      printGeneralHelp();
      process.exit(0);
    }

    // Execute command in headless mode
    if (i === 0 && args.length >= 1 && args[1] !== '-h' && COMMANDS.includes(args[0])) {
      const rest = args.slice(1);
      const params = (rest.find(a => !a.startsWith('-')) ?? null) as string | null;
      const flag = (rest.find(a => a.startsWith('-')) ?? null) as string | null;

      await runCommand(args[0], params, flag);
      process.exit(0);
    }
  }

  return false;
};

/**
 * Prints general help message for the CLI
 */
const printGeneralHelp = (): void => {
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

e.g.: >npx chrome-devtools-cli select_page '{"pageIdx":1}'

`);
};
