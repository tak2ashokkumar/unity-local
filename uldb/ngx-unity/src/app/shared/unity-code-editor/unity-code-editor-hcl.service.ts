import { Injectable } from '@angular/core';
import { EditorModeByScriptType, EditorThemeByScriptType } from './unity-code-editor.type';

@Injectable({
  providedIn: 'root'
})
export class UnityCodeEditorHclService {

  constructor() { }

  format(text: string): string {
    const lines = text.split('\n');
    const formatted: string[] = [];
    let indentLevel = 0;
    let inHeredoc = false;
    let inMultiLineComment = false;
    let heredocTag: string | null = null;

    // Check for unbalanced braces globally
    const openBraces = (text.match(/{/g) || []).length;
    const closeBraces = (text.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      throw new Error('Formatting failed: Unbalanced braces detected.');
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip formatting in heredocs
      if (inHeredoc) {
        formatted.push(trimmed);
        if (trimmed === heredocTag) {
          inHeredoc = false;
          heredocTag = null;
        } else if (i === lines.length - 1) {
          throw new Error(`Formatting failed: Unclosed heredoc starting with <<${heredocTag}`);
        }
        continue;
      }

      // Skip formatting in multi-line comments
      if (inMultiLineComment) {
        formatted.push(trimmed);
        if (trimmed.includes('*/')) {
          inMultiLineComment = false;
        }
        continue;
      }

      // Adjust indent for closing brace, but not for inline blocks
      if (/^}/.test(trimmed) && !/{\s*}/.test(line)) {
        indentLevel = Math.max(indentLevel - 1, 0);
      }

      // Apply indentation
      const indentedLine = ' '.repeat(indentLevel * HCL_CONFIG.indentUnit) + trimmed;
      formatted.push(indentedLine);

      // Increase indent for opening brace, unless inline
      if (/{\s*$/.test(trimmed) && !/=\s*{/.test(trimmed)) {
        indentLevel++;
      }

      // Detect heredoc or multi-line comment
      if (/<<[-]?\w+/.test(trimmed)) {
        inHeredoc = true;
        heredocTag = trimmed.match(/<<[-]?(\w+)/)?.[1] || null;
        if (!heredocTag) {
          throw new Error(`Formatting failed: Invalid heredoc tag at line ${i + 1}`);
        }
      }
      if (/\/\*/.test(trimmed)) {
        inMultiLineComment = true;
      }
    }

    // Check for unclosed multi-line comment
    if (inMultiLineComment) {
      throw new Error('Formatting failed: Unclosed multi-line comment.');
    }

    return formatted.join('\n').trimEnd();
  }

  lint(text: string): any[] {
    const issues: any[] = [];
    const lines = text.split('\n');

    // Line-by-line checks
    lines.forEach((line, index) => {
      const checks = [
        this._checkDoubleEquals(line, index),
        this._checkVariableBrace(line, index),
        this._checkUnknownKeywords(line, index),
        this._checkMissingEquals(line, index),
        this._checkInvalidModuleLabels(line, index)
      ];
      checks.forEach(issue => {
        if (issue) {
          if (Array.isArray(issue)) {
            issue.forEach(i => issues.push(i));
          } else {
            issues.push(issue);
          }
        }
      });
    });

    // Global checks
    const braceIssue = this._checkUnbalancedBraces(text);
    if (braceIssue) issues.push(braceIssue);

    return issues;
  }

  private _checkDoubleEquals(line: string, index: number): any {
    const col = line.indexOf('==');
    return col >= 0 ? {
      message: 'Avoid using ==, use = in HCL.',
      severity: 'warning',
      from: { line: index, ch: col },
      to: { line: index, ch: col + 2 }
    } : null;
  }

  private _checkVariableBrace(line: string, index: number): any {
    if (/\bvariable\b/.test(line) && !line.includes('{')) {
      return {
        message: 'Variable block must have an opening brace.',
        severity: 'warning',
        from: { line: index, ch: 0 },
        to: { line: index, ch: line.length }
      };
    }
    return null;
  }

  private _checkUnknownKeywords(line: string, index: number): any[] {
    const issues: any[] = [];
    const tokens = line.match(HCL_CONFIG.keywordRegex) || [];

    tokens.forEach(token => {
      if (!HCL_CONFIG.keywords.includes(token)) {
        const ch = line.indexOf(token);
        issues.push({
          message: `Unrecognized keyword: ${token}`,
          severity: 'warning',
          from: { line: index, ch },
          to: { line: index, ch: ch + token.length }
        });
      }
    });

    return issues;
  }

  private _checkUnbalancedBraces(text: string): any {
    const openCount = (text.match(/{/g) || []).length;
    const closeCount = (text.match(/}/g) || []).length;
    if (openCount !== closeCount) {
      return {
        message: 'Unbalanced number of opening and closing braces.',
        severity: 'error',
        from: { line: 0, ch: 0 },
        to: { line: 0, ch: 1 }
      };
    }
    return null;
  }

  private _checkMissingEquals(line: string, index: number): any {
    if (/\b[a-zA-Z0-9_]+\s+".*"(?!\s*{)/.test(line) && !line.includes('=') && !HCL_CONFIG.keywordRegex.test(line)) {
      return {
        message: 'Missing equal sign (=) between key and value.',
        severity: 'warning',
        from: { line: index, ch: 0 },
        to: { line: index, ch: line.length }
      };
    }
    return null;
  }

  private _checkInvalidModuleLabels(line: string, index: number): any {
    const match = line.match(/\bmodule\s+"([^"]+)"/);
    if (match) {
      const label = match[1];
      // Terraform module names should be alphanumeric, underscores, or hyphens
      if (!/^[a-zA-Z0-9_-]+$/.test(label)) {
        const ch = line.indexOf(`"${label}"`);
        return {
          message: `Invalid module name: "${label}". Module names should contain only letters, numbers, underscores, or hyphens.`,
          severity: 'warning',
          from: { line: index, ch },
          to: { line: index, ch: ch + label.length + 2 }
        };
      }
    }
    return null;
  }
}

export const HCL_CONFIG = (() => {
  const keywords = [
    'resource', 'provider', 'variable', 'output', 'module', 'data', 'locals', 'terraform',
    'description', 'type', 'default', 'value', 'source', 'version', 'region',
    'for_each', 'count', 'tags'
  ];
  return {
    mode: EditorModeByScriptType.TERRAFORM,
    theme: EditorThemeByScriptType.TERRAFORM,
    indentUnit: 2,
    tabSize: 2,
    keywords: keywords,
    requiredBlocks: ['resource', 'variable', 'output'],
    keywordRegex: new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi')
  }
})();
