import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getCurrentVersion, printAvailableCommands, printCommandDetail } from '../../../src/commands/helpers.js';

describe('commands/helpers', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentVersion', () => {
    it('should return version as string', () => {
      const version = getCurrentVersion();
      expect(typeof version).toBe('string');
    });

    it('should return version in semver format', () => {
      const version = getCurrentVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('printAvailableCommands', () => {
    it('should call console.log', () => {
      printAvailableCommands();
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should print header', () => {
      printAvailableCommands();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Available commands'));
    });

    it('should print all 26 commands with their info', () => {
      printAvailableCommands();
      // Should be called once for header + 26 times for commands
      expect(consoleLogSpy).toHaveBeenCalledTimes(27);
    });

    it('should print commands with numbers', () => {
      printAvailableCommands();
      const calls = consoleLogSpy.mock.calls;
      expect(calls[1][0]).toMatch(/^1\./);
      expect(calls[2][0]).toMatch(/^2\./);
    });

    it('should print navigate_page command', () => {
      printAvailableCommands();
      const allCalls = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allCalls).toContain('navigate_page');
    });

    it('should print command descriptions', () => {
      printAvailableCommands();
      const allCalls = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allCalls).toContain('Clicks on the provided element');
    });
  });

  describe('printCommandDetail', () => {
    beforeEach(() => {
      consoleLogSpy.mockClear();
    });

    it('should print detail for valid command', () => {
      printCommandDetail('navigate_page');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should print command name', () => {
      printCommandDetail('navigate_page');
      const allCalls = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allCalls).toContain('navigate_page');
    });

    it('should print command description', () => {
      printCommandDetail('click');
      const allCalls = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allCalls).toContain('Clicks on the provided element');
    });

    it('should print command parameters', () => {
      printCommandDetail('navigate_page');
      const allCalls = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allCalls).toContain('url');
    });

    it('should handle unknown command', () => {
      printCommandDetail('unknown_command');
      const allCalls = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allCalls).toContain('Unknown command');
    });

    it('should print available commands when unknown command provided', () => {
      printCommandDetail('unknown_command');
      const allCalls = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allCalls).toContain('Available commands');
    });

    it('should handle empty command name', () => {
      printCommandDetail('');
      const allCalls = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allCalls).toContain('Please provide a command name');
    });

    it('should handle whitespace-only command name', () => {
      printCommandDetail('   ');
      const allCalls = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allCalls).toContain('Please provide a command name');
    });

    it('should print available commands when empty command provided', () => {
      printCommandDetail('');
      const allCalls = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allCalls).toContain('Available commands');
    });

    it('should handle all valid commands', () => {
      const commands = ['click', 'navigate_page', 'take_screenshot', 'list_pages', 'new_page'];

      commands.forEach(cmd => {
        consoleLogSpy.mockClear();
        printCommandDetail(cmd);
        expect(consoleLogSpy).toHaveBeenCalled();
        const allCalls = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
        expect(allCalls).toContain(cmd);
      });
    });

    it('should trim command name before processing', () => {
      consoleLogSpy.mockClear();
      printCommandDetail('  click  ');
      const allCalls = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      expect(allCalls).toContain('click');
      expect(allCalls).toContain('Clicks on the provided element');
    });
  });
});
