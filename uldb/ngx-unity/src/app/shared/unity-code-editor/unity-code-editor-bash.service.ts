import { Injectable } from '@angular/core';
import { EditorModeByScriptType, EditorThemeByScriptType } from './unity-code-editor.type';

@Injectable({
  providedIn: 'root'
})
export class UnityCodeEditorBashService {

  constructor() { }

  format(script: string): string {
    const lines = script.split('\n');
    let indentLevel = 0;

    const formatted = lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return line; // Preserve empty lines

      // Skip shebang for comment spacing
      if (idx === 0 && trimmed.startsWith('#!')) {
        return trimmed;
      }

      // Decrease indent before closing keywords
      if (/^(fi|done|esac)$/.test(trimmed)) {
        indentLevel = Math.max(indentLevel - 1, 0);
      }

      let newLine = ' '.repeat(indentLevel * BASH_CONFIG.indentUnit) + trimmed;

      // Increase indent after opening keywords
      if (/^(if|for|while|case|select|until|do)(\s|$)/.test(trimmed)) {
        indentLevel++;
      }

      // Normalize spaces
      newLine = newLine.replace(/\s{2,}/g, ' ');

      // Add space after # for comments, excluding shebang
      if (trimmed.startsWith('#') && !/^#\s/.test(trimmed)) {
        newLine = newLine.replace(/^#/, '# ');
      }

      // Add semicolon before then if needed
      if (/^if\s.*[^;]$/.test(trimmed) && trimmed.includes('then') && !trimmed.includes(';')) {
        newLine = newLine.replace('then', '; then');
      }

      return newLine;
    });

    return formatted.join('\n');
  }

  lint(script: string): any[] {
    const lines = script.split('\n');
    const issues: any[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Shebang check
      if (idx === 0 && !trimmed.startsWith('#!')) {
        issues.push(this._issue(idx, 0, trimmed.length, 'Missing shebang line (e.g., #!/bin/bash)', 'warning'));
      }

      // Comment spacing check (exclude shebang)
      if (trimmed.startsWith('#') && !trimmed.startsWith('#!') && !/^#\s/.test(trimmed)) {
        issues.push(this._issue(idx, line.indexOf('#'), 1, 'Comment should have a space after #', 'warning'));
      }

      // Dangerous commands
      if (/\brm\s+-rf\s+\//.test(trimmed)) {
        issues.push(this._issue(idx, line.indexOf('rm'), 2, 'Dangerous command: rm -rf /', 'error'));
      }

      // Backticks
      if (/`[^`]+`/.test(trimmed)) {
        issues.push(this._issue(idx, line.indexOf('`'), 1, 'Use $(...) instead of backticks', 'warning'));
      }

      // Unquoted variables (improved regex)
      if (/\$[A-Za-z_][A-Za-z0-9_]*(?![}"'\w])/.test(trimmed)) {
        issues.push(this._issue(idx, line.indexOf('$'), 1, 'Unquoted variable', 'warning'));
      }

      // TODO comments
      if (trimmed.includes('TODO')) {
        issues.push(this._issue(idx, trimmed.indexOf('TODO'), 4, 'TODO left in script', 'warning'));
      }

      // Unknown commands
      const parts = trimmed.split(/\s+/);
      const cmd = parts[0];
      if (
        cmd &&
        !BASH_CONFIG.keywords.includes(cmd) &&
        !BASH_CONFIG.approvedCommands.includes(cmd) &&
        !cmd.startsWith('#') &&
        !cmd.startsWith('./') &&
        !cmd.startsWith('/') &&
        isNaN(Number(cmd))
      ) {
        issues.push(this._issue(idx, 0, cmd.length, `Unknown or discouraged command: ${cmd}`, 'warning'));
      }
    });

    return issues;
  }

  private _issue(line: number, start: number, len: number, message: string, severity: 'error' | 'warning' = 'warning') {
    return {
      message,
      severity,
      fromLine: line,
      fromCh: start,
      toLine: line,
      toCh: start + len
    };
  }
}

export const BASH_CONFIG = (() => {
  const keywords = [
    'if', 'then', 'else', 'elif', 'fi', 'for', 'in', 'do', 'done', 'while', 'until', 'case', 'esac',
    'function', 'select', 'time', 'break', 'continue', 'return', 'exit',
    'trap', 'readonly', 'declare', 'typeset', 'local', 'export'
  ];
  return {
    mode: EditorModeByScriptType.BASH,
    theme: EditorThemeByScriptType.BASH,
    indentUnit: 2,
    tabSize: 2,
    keywords: keywords,
    riskyCommands: ['rm', 'mkfs', 'shutdown', 'reboot', 'dd', 'halt', 'init'],
    approvedCommands: [
      'echo', 'cat', 'grep', 'awk', 'sed', 'find', 'tar', 'zip', 'scp',
      'rsync', 'read', 'printf', 'ls', 'ps', 'kill', 'chmod', 'chown',
      'rm', 'mkfs', 'shutdown', 'reboot', 'dd', 'halt', 'init'
    ],
    keywordRegex: new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi')
  }
})();
