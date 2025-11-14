import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CHROME_SERVER,
  COMMANDS,
  COMMANDS_INFO,
  COMMANDS_DETAIL,
} from '../../../src/config/constants.js';

describe('config/constants', () => {
  describe('DEFAULT_CHROME_SERVER', () => {
    it('should have correct command', () => {
      expect(DEFAULT_CHROME_SERVER.command).toBe('npx');
    });

    it('should have correct args array', () => {
      expect(DEFAULT_CHROME_SERVER.args).toEqual([
        '-y',
        'chrome-devtools-mcp@latest',
        '--browser-url=http://127.0.0.1:9222',
      ]);
    });

    it('should have args as an array', () => {
      expect(Array.isArray(DEFAULT_CHROME_SERVER.args)).toBe(true);
    });
  });

  describe('COMMANDS', () => {
    it('should be an array', () => {
      expect(Array.isArray(COMMANDS)).toBe(true);
    });

    it('should contain 26 commands', () => {
      expect(COMMANDS).toHaveLength(26);
    });

    it('should include navigate_page command', () => {
      expect(COMMANDS).toContain('navigate_page');
    });

    it('should include take_screenshot command', () => {
      expect(COMMANDS).toContain('take_screenshot');
    });

    it('should include list_pages command', () => {
      expect(COMMANDS).toContain('list_pages');
    });

    it('should include click command', () => {
      expect(COMMANDS).toContain('click');
    });

    it('should include all expected commands', () => {
      const expectedCommands = [
        'click',
        'close_page',
        'drag',
        'emulate',
        'evaluate_script',
        'fill',
        'fill_form',
        'get_console_message',
        'get_network_request',
        'handle_dialog',
        'hover',
        'list_console_messages',
        'list_network_requests',
        'list_pages',
        'navigate_page',
        'new_page',
        'performance_analyze_insight',
        'performance_start_trace',
        'performance_stop_trace',
        'press_key',
        'resize_page',
        'select_page',
        'take_screenshot',
        'take_snapshot',
        'upload_file',
        'wait_for',
      ];

      expect(COMMANDS).toEqual(expectedCommands);
    });

    it('should have no duplicate commands', () => {
      const uniqueCommands = [...new Set(COMMANDS)];
      expect(uniqueCommands).toHaveLength(COMMANDS.length);
    });

    it('should have all lowercase snake_case commands', () => {
      COMMANDS.forEach((cmd) => {
        expect(cmd).toMatch(/^[a-z_]+$/);
      });
    });
  });

  describe('COMMANDS_INFO', () => {
    it('should be an array', () => {
      expect(Array.isArray(COMMANDS_INFO)).toBe(true);
    });

    it('should have same length as COMMANDS', () => {
      expect(COMMANDS_INFO).toHaveLength(COMMANDS.length);
    });

    it('should have 26 descriptions', () => {
      expect(COMMANDS_INFO).toHaveLength(26);
    });

    it('should have non-empty strings for all descriptions', () => {
      COMMANDS_INFO.forEach((info, idx) => {
        expect(typeof info).toBe('string');
        expect(info.length).toBeGreaterThan(0);
      });
    });

    it('should have description for navigate_page at correct index', () => {
      const navIndex = COMMANDS.indexOf('navigate_page');
      expect(COMMANDS_INFO[navIndex]).toContain('Navigates');
    });

    it('should have description for click at correct index', () => {
      const clickIndex = COMMANDS.indexOf('click');
      expect(COMMANDS_INFO[clickIndex]).toContain('Clicks');
    });
  });

  describe('COMMANDS_DETAIL', () => {
    it('should be an array', () => {
      expect(Array.isArray(COMMANDS_DETAIL)).toBe(true);
    });

    it('should have same length as COMMANDS', () => {
      expect(COMMANDS_DETAIL).toHaveLength(COMMANDS.length);
    });

    it('should have 26 detail entries', () => {
      expect(COMMANDS_DETAIL).toHaveLength(26);
    });

    it('should have strings for all details', () => {
      COMMANDS_DETAIL.forEach((detail) => {
        expect(typeof detail).toBe('string');
      });
    });

    it('should have detail for navigate_page containing parameters', () => {
      const navIndex = COMMANDS.indexOf('navigate_page');
      const detail = COMMANDS_DETAIL[navIndex];
      expect(detail).toContain('url');
    });

    it('should have detail for click containing uid parameter', () => {
      const clickIndex = COMMANDS.indexOf('click');
      const detail = COMMANDS_DETAIL[clickIndex];
      expect(detail).toContain('uid');
    });
  });

  describe('Array alignment', () => {
    it('should have COMMANDS, COMMANDS_INFO, and COMMANDS_DETAIL with same length', () => {
      expect(COMMANDS.length).toBe(COMMANDS_INFO.length);
      expect(COMMANDS.length).toBe(COMMANDS_DETAIL.length);
    });

    it('should maintain correct index mapping between arrays', () => {
      COMMANDS.forEach((cmd, idx) => {
        expect(COMMANDS_INFO[idx]).toBeDefined();
        expect(COMMANDS_DETAIL[idx]).toBeDefined();
        expect(typeof COMMANDS_INFO[idx]).toBe('string');
        expect(typeof COMMANDS_DETAIL[idx]).toBe('string');
      });
    });
  });
});
