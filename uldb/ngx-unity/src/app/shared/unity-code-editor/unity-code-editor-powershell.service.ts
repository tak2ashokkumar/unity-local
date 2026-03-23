import { Injectable } from '@angular/core';
import { EditorModeByScriptType, EditorThemeByScriptType } from './unity-code-editor.type';

declare const CodeMirror: any;
@Injectable({
  providedIn: 'root'
})
export class UnityCodeEditorPowershellService {
  constructor() { }

  /**
   * Formats a PowerShell script by normalizing spacing around operators, applying
   * consistent indentation, and converting function names to PascalCase.
   * The indent size is fixed at 2 spaces, and the following keywords are recognized:
   * break, continue, else, elseif, for, foreach, function, if, return, switch, while.
   * Skips formatting for strings and comments to avoid incorrect changes.
   *
   * @param script The script to format.
   * @returns The formatted script.
   */
  format(script: string): string {
    const lines = script.split('\n');
    const formattedLines: string[] = [];
    let indentLevel = 0;
    let inMultiLineComment = false;

    for (let line of lines) {
      let trimmedLine = line.trim();

      // Skip multi-line comments
      if (inMultiLineComment) {
        formattedLines.push(line);
        if (trimmedLine.includes('#>')) {
          inMultiLineComment = false;
        }
        continue;
      }
      if (trimmedLine.startsWith('<#')) {
        inMultiLineComment = true;
        formattedLines.push(line);
        continue;
      }

      // Skip single-line comments and strings
      if (trimmedLine.startsWith('#') || /".*"/.test(trimmedLine) || /'.*'/g.test(trimmedLine)) {
        formattedLines.push(line);
        continue;
      }

      // Adjust indent before line if it starts with a closing brace
      if (trimmedLine.startsWith('}')) {
        indentLevel = Math.max(indentLevel - 1, 0);
      }

      // Handle function names (e.g., get-hello → Get-Hello)
      trimmedLine = this._formatFunctionName(trimmedLine);

      // Normalize keyword spacing and casing
      trimmedLine = trimmedLine.replace(POWERSHELL_CONFIG.regexes.keywords, (match: string) => match.toLowerCase());

      // Normalize spacing around operators, but protect function names
      trimmedLine = this._applyOperatorSpacing(trimmedLine);

      const indent = ' '.repeat(indentLevel * POWERSHELL_CONFIG.indentUnit);
      formattedLines.push(indent + trimmedLine);

      // Adjust indent level after line if it ends with an opening brace
      if (trimmedLine.endsWith('{')) {
        indentLevel++;
      }
    }

    return formattedLines.join('\n');
  }

  /**
   * Converts function names to PascalCase (e.g., get-hello → Get-Hello).
   * @param line The line to process.
   * @returns The line with function names in PascalCase.
   */
  private _formatFunctionName(line: string): string {
    const functionMatch = /function\s+([a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9]+)/i.exec(line);
    if (functionMatch && functionMatch[1]) {
      const funcName = functionMatch[1];
      const parts = funcName.split('-');
      const pascalCaseName = parts
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-');
      return line.replace(funcName, pascalCaseName);
    }
    return line;
  }

  /**
   * Applies operator spacing while protecting hyphens in function names.
   * @param line The line to process.
   * @returns The line with normalized operator spacing.
   */
  private _applyOperatorSpacing(line: string): string {
    // Protect function names by temporarily replacing hyphens
    let tempLine = line;
    const functionMatch = /function\s+([a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9]+)/i.exec(line);
    if (functionMatch && functionMatch[1]) {
      const funcName = functionMatch[1];
      tempLine = tempLine.replace(funcName, funcName.replace('-', '__TEMP_HYPHEN__'));
    }

    // Apply operator spacing
    tempLine = tempLine.replace(POWERSHELL_CONFIG.regexes.operatorSpacing, ' $1 ');

    // Restore hyphens in function names
    return tempLine.replace('__TEMP_HYPHEN__', '-');
  }




  /**
   * Lints a PowerShell script, checking for common anti-patterns and returning
   * issues in a format compatible with CodeMirror's lint addon.
   *
   * @param script The script to lint.
   * @returns An array of lint issues.
   */
  lint(script: string): any[] {
    const issues: any[] = [];
    const lines = script.split('\n');

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Skip comments and strings to avoid false positives
      if (trimmed.startsWith('#') || trimmed.startsWith('<#') || /".*"/.test(trimmed) || /'.*'/g.test(trimmed)) {
        return;
      }

      // Rule 1: Avoid Cmdlet Aliases
      let match;
      while ((match = POWERSHELL_CONFIG.regexes.aliases.exec(line)) !== null) {
        issues.push(this._issue(index, match.index, match[0].length, `Avoid alias '${match[0]}', use full cmdlet.`, 'warning'));
      }

      // Rule 2: Avoid Write-Host
      const writeHostIndex = line.toLowerCase().indexOf('write-host');
      if (writeHostIndex !== -1) {
        issues.push(this._issue(index, writeHostIndex, 10, `Avoid using 'Write-Host'. Use 'Write-Output' or 'Write-Verbose'.`, 'warning'));
      }

      // Rule 3: Avoid Empty Catch
      if (/catch\s*\{\s*\}/i.test(line)) {
        const catchIndex = line.toLowerCase().indexOf('catch');
        issues.push(this._issue(index, catchIndex, 5, `Empty 'catch' block detected. Handle errors properly.`, 'warning'));
      }

      // Rule 4: Avoid Positional Parameters for Get-Item
      if (/Get-Item\s+\S+/.test(line) && !/-(Path|LiteralPath)/.test(line)) {
        const posIndex = line.toLowerCase().indexOf('get-item');
        issues.push(this._issue(index, posIndex, 8, `Avoid positional parameters for Get-Item. Use -Path or -LiteralPath.`, 'warning'));
      }

      // Rule 5: Avoid Global Variables
      if (/\$Global:/i.test(line)) {
        const globalIndex = line.indexOf('$Global:');
        issues.push(this._issue(index, globalIndex, 8, `Avoid using global variables.`, 'warning'));
      }

      // Rule 6: Avoid Invoke-Expression
      const invokeExprIndex = line.toLowerCase().indexOf('invoke-expression');
      if (invokeExprIndex !== -1) {
        issues.push(this._issue(index, invokeExprIndex, 17, `Avoid 'Invoke-Expression' due to security concerns.`, 'error'));
      }

      // Rule 7: Avoid Plaintext Passwords
      if (/-Password\s+("|').*?\1/.test(line)) {
        const passIndex = line.toLowerCase().indexOf('-password');
        issues.push(this._issue(index, passIndex, 9, `Avoid passing passwords in plaintext.`, 'error'));
      }

      // Rule 8: Enforce PascalCase for Functions
      const functionMatch = /function\s+([a-zA-Z]+)/i.exec(line);
      if (functionMatch && functionMatch[1] && !/^[A-Z][a-zA-Z0-9]+(-[A-Z][a-zA-Z0-9]+)*$/.test(functionMatch[1])) {
        const funcName = functionMatch[1];
        const funcIndex = line.indexOf(funcName);
        issues.push(this._issue(index, funcIndex, funcName.length, `Function '${funcName}' should use PascalCase (e.g., Get-Hello).`, 'warning'));
      }

      // Rule 9: Avoid Trailing Whitespace
      if (/\s+$/.test(line)) {
        const wsIndex = line.length - (line.match(/\s+$/)![0].length);
        issues.push(this._issue(index, wsIndex, line.length - wsIndex, `Line has trailing whitespace.`, 'warning'));
      }

      // Rule 10: Use Approved Verbs
      const verbMatch = /function\s+([A-Z][a-zA-Z]+)-[a-zA-Z0-9]+/.exec(line);
      if (verbMatch && !POWERSHELL_CONFIG.approvedVerbs.includes(verbMatch[1])) {
        const verb = verbMatch[1];
        const verbIndex = line.indexOf(verb);
        issues.push(this._issue(index, verbIndex, verb.length, `'${verb}' is not an approved PowerShell verb.`, 'warning'));
      }

      // Rule 11: Avoid Risky Commands
      while ((match = POWERSHELL_CONFIG.regexes.riskyCommands.exec(line)) !== null) {
        issues.push(this._issue(index, match.index, match[0].length, `Avoid risky command '${match[0]}'.`, 'error'));
      }
    });

    return issues;
  }

  private _issue(line: number, start: number, len: number, message: string, severity: 'warning' | 'error' = 'warning') {
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

export const POWERSHELL_CONFIG = (() => {
  const keywords = [
    'if', 'else', 'elseif', 'foreach', 'for',
    'while', 'switch', 'function', 'return', 'break', 'continue'
  ];
  const aliases = ['ls', 'gc', 'rm', 'mv', 'cp'];
  const riskyCommands = ['rm', 'mkfs', 'shutdown', 'reboot', 'dd', 'halt', 'init'];
  return {
    mode: EditorModeByScriptType.POWERSHELL,
    theme: EditorThemeByScriptType.POWERSHELL,
    indentUnit: 2,
    tabSize: 2,
    keywords: keywords,
    aliasList: aliases,
    riskyCommands: riskyCommands,
    approvedVerbs: ['Get', 'Set', 'New', 'Remove', 'Update', 'Invoke', 'Write', 'Read'],
    regexes: {
      keywords: new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi'),
      aliases: new RegExp(`\\b(${aliases.join('|')})\\b`, 'gi'),
      riskyCommands: new RegExp(`\\b(${riskyCommands.join('|')})\\b`, 'gi'),
      operatorSpacing: /\s*([=+\-*/%<>!&|]+)\s*/g
    }
  }
})();