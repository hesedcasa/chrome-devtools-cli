import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runCommand } from '../../../src/commands/runner.js';

// Mock the MCP SDK
const mockConnect = vi.fn();
const mockCallTool = vi.fn();
const mockClose = vi.fn();

vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn(function () {
    return {
      connect: mockConnect,
      callTool: mockCallTool,
      close: mockClose,
    };
  }),
}));

vi.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: vi.fn(),
}));

vi.mock('@modelcontextprotocol/sdk/types.js', () => ({
  CallToolResultSchema: {},
}));

describe('commands/runner', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as unknown as (...args: unknown[]) => never);

    // Reset mock implementations
    mockConnect.mockResolvedValue(undefined);
    mockCallTool.mockResolvedValue({ result: 'success' });
    mockClose.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('runCommand', () => {
    it('should execute command without arguments', async () => {
      await runCommand('list_pages', null, null);

      expect(mockConnect).toHaveBeenCalled();
      expect(mockCallTool).toHaveBeenCalledWith(
        {
          name: 'list_pages',
          arguments: {},
        },
        {}
      );
      expect(mockClose).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should execute command with JSON arguments', async () => {
      const jsonArg = '{"url": "https://google.com"}';

      await runCommand('navigate_page', jsonArg, null);

      expect(mockCallTool).toHaveBeenCalledWith(
        {
          name: 'navigate_page',
          arguments: { url: 'https://google.com' },
        },
        {}
      );
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should execute command with --headless flag', async () => {
      const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');

      await runCommand('list_pages', null, '--headless');

      expect(StdioClientTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.arrayContaining(['--headless=true']),
        })
      );
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should execute command without --headless flag', async () => {
      const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');

      await runCommand('list_pages', null, null);

      expect(StdioClientTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.not.arrayContaining(['--headless=true']),
        })
      );
    });

    it('should log command and arguments', async () => {
      await runCommand('navigate_page', '{"url": "https://google.com"}', null);

      expect(consoleLogSpy).toHaveBeenCalledWith('navigate_page {"url": "https://google.com"}');
    });

    it('should log result as JSON', async () => {
      const mockResult = { result: 'success', data: 'test' };
      mockCallTool.mockResolvedValue(mockResult);

      await runCommand('list_pages', null, null);

      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(mockResult, null, 2));
    });

    it('should handle connection errors', async () => {
      mockConnect.mockRejectedValue(new Error('Connection failed'));

      await runCommand('list_pages', null, null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error running command:', 'Connection failed');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle tool execution errors', async () => {
      mockCallTool.mockRejectedValue(new Error('Tool execution failed'));

      await runCommand('navigate_page', '{"url": "invalid"}', null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error running command:', 'Tool execution failed');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle JSON parse errors', async () => {
      await runCommand('navigate_page', 'invalid json', null);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle empty string arguments', async () => {
      await runCommand('list_pages', '', null);

      expect(mockCallTool).toHaveBeenCalledWith(
        {
          name: 'list_pages',
          arguments: {},
        },
        {}
      );
    });

    it('should handle whitespace-only arguments', async () => {
      await runCommand('list_pages', '   ', null);

      expect(mockCallTool).toHaveBeenCalledWith(
        {
          name: 'list_pages',
          arguments: {},
        },
        {}
      );
    });

    it('should close client after successful execution', async () => {
      await runCommand('list_pages', null, null);

      expect(mockClose).toHaveBeenCalled();
    });

    it('should use correct client name and version', async () => {
      const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');

      await runCommand('list_pages', null, null);

      expect(Client).toHaveBeenCalledWith(
        {
          name: 'chrome-devtools-cli-headless',
          version: '1',
        },
        {
          capabilities: {},
        }
      );
    });

    it('should handle complex JSON arguments', async () => {
      const complexArg = '{"elements": [{"uid": "1", "value": "test"}]}';

      await runCommand('fill_form', complexArg, null);

      expect(mockCallTool).toHaveBeenCalledWith(
        {
          name: 'fill_form',
          arguments: {
            elements: [{ uid: '1', value: 'test' }],
          },
        },
        {}
      );
    });

    it('should handle error without message property', async () => {
      mockCallTool.mockRejectedValue('Plain error string');

      await runCommand('list_pages', null, null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error running command:', 'Plain error string');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    describe('snapshot-requiring commands', () => {
      it('should call take_snapshot before click command', async () => {
        await runCommand('click', '{"uid": "element-1"}', null);

        expect(mockCallTool).toHaveBeenCalledTimes(2);
        expect(mockCallTool).toHaveBeenNthCalledWith(
          1,
          {
            name: 'take_snapshot',
            arguments: {},
          },
          {}
        );
        expect(mockCallTool).toHaveBeenNthCalledWith(
          2,
          {
            name: 'click',
            arguments: { uid: 'element-1' },
          },
          {}
        );
      });

      it('should call take_snapshot before drag command', async () => {
        await runCommand('drag', '{"from_uid": "1", "to_uid": "2"}', null);

        expect(mockCallTool).toHaveBeenCalledTimes(2);
        expect(mockCallTool).toHaveBeenNthCalledWith(1, { name: 'take_snapshot', arguments: {} }, {});
        expect(mockCallTool).toHaveBeenNthCalledWith(
          2,
          { name: 'drag', arguments: { from_uid: '1', to_uid: '2' } },
          {}
        );
      });

      it('should call take_snapshot before fill command', async () => {
        await runCommand('fill', '{"uid": "input-1", "value": "test"}', null);

        expect(mockCallTool).toHaveBeenCalledTimes(2);
        expect(mockCallTool).toHaveBeenNthCalledWith(1, { name: 'take_snapshot', arguments: {} }, {});
        expect(mockCallTool).toHaveBeenNthCalledWith(
          2,
          { name: 'fill', arguments: { uid: 'input-1', value: 'test' } },
          {}
        );
      });

      it('should call take_snapshot before fill_form command', async () => {
        await runCommand('fill_form', '{"elements": [{"uid": "1", "value": "test"}]}', null);

        expect(mockCallTool).toHaveBeenCalledTimes(2);
        expect(mockCallTool).toHaveBeenNthCalledWith(1, { name: 'take_snapshot', arguments: {} }, {});
        expect(mockCallTool).toHaveBeenNthCalledWith(
          2,
          { name: 'fill_form', arguments: { elements: [{ uid: '1', value: 'test' }] } },
          {}
        );
      });

      it('should call take_snapshot before handle_dialog command', async () => {
        await runCommand('handle_dialog', '{"action": "accept"}', null);

        expect(mockCallTool).toHaveBeenCalledTimes(2);
        expect(mockCallTool).toHaveBeenNthCalledWith(1, { name: 'take_snapshot', arguments: {} }, {});
        expect(mockCallTool).toHaveBeenNthCalledWith(2, { name: 'handle_dialog', arguments: { action: 'accept' } }, {});
      });

      it('should call take_snapshot before hover command', async () => {
        await runCommand('hover', '{"uid": "element-1"}', null);

        expect(mockCallTool).toHaveBeenCalledTimes(2);
        expect(mockCallTool).toHaveBeenNthCalledWith(1, { name: 'take_snapshot', arguments: {} }, {});
        expect(mockCallTool).toHaveBeenNthCalledWith(2, { name: 'hover', arguments: { uid: 'element-1' } }, {});
      });

      it('should call take_snapshot before press_key command', async () => {
        await runCommand('press_key', '{"key": "Enter"}', null);

        expect(mockCallTool).toHaveBeenCalledTimes(2);
        expect(mockCallTool).toHaveBeenNthCalledWith(1, { name: 'take_snapshot', arguments: {} }, {});
        expect(mockCallTool).toHaveBeenNthCalledWith(2, { name: 'press_key', arguments: { key: 'Enter' } }, {});
      });

      it('should call take_snapshot before upload_file command', async () => {
        await runCommand('upload_file', '{"uid": "file-input", "path": "/path/to/file"}', null);

        expect(mockCallTool).toHaveBeenCalledTimes(2);
        expect(mockCallTool).toHaveBeenNthCalledWith(1, { name: 'take_snapshot', arguments: {} }, {});
        expect(mockCallTool).toHaveBeenNthCalledWith(
          2,
          { name: 'upload_file', arguments: { uid: 'file-input', path: '/path/to/file' } },
          {}
        );
      });

      it('should log snapshot message for commands requiring snapshot', async () => {
        await runCommand('click', '{"uid": "element-1"}', null);

        expect(consoleLogSpy).toHaveBeenCalledWith('Taking snapshot before executing command...');
      });
    });

    describe('non-snapshot-requiring commands', () => {
      it('should NOT call take_snapshot for list_pages command', async () => {
        await runCommand('list_pages', null, null);

        expect(mockCallTool).toHaveBeenCalledTimes(1);
        expect(mockCallTool).toHaveBeenCalledWith({ name: 'list_pages', arguments: {} }, {});
      });

      it('should NOT call take_snapshot for navigate_page command', async () => {
        await runCommand('navigate_page', '{"url": "https://google.com"}', null);

        expect(mockCallTool).toHaveBeenCalledTimes(1);
        expect(mockCallTool).toHaveBeenCalledWith(
          { name: 'navigate_page', arguments: { url: 'https://google.com' } },
          {}
        );
      });

      it('should NOT call take_snapshot for take_screenshot command', async () => {
        await runCommand('take_screenshot', null, null);

        expect(mockCallTool).toHaveBeenCalledTimes(1);
        expect(mockCallTool).toHaveBeenCalledWith({ name: 'take_screenshot', arguments: {} }, {});
      });

      it('should NOT call take_snapshot for evaluate_script command', async () => {
        await runCommand('evaluate_script', '{"expression": "document.title"}', null);

        expect(mockCallTool).toHaveBeenCalledTimes(1);
        expect(mockCallTool).toHaveBeenCalledWith(
          { name: 'evaluate_script', arguments: { expression: 'document.title' } },
          {}
        );
      });

      it('should NOT log snapshot message for commands not requiring snapshot', async () => {
        await runCommand('list_pages', null, null);

        expect(consoleLogSpy).not.toHaveBeenCalledWith('Taking snapshot before executing command...');
      });
    });
  });
});
