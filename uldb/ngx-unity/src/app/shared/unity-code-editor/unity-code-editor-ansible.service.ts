import { Injectable } from '@angular/core';
import * as CodeMirror from 'codemirror';
import * as Prettier from 'prettier/standalone';
import parserYaml from 'prettier/parser-yaml';
import * as jsyaml from 'js-yaml';
import { EditorModeByScriptType, EditorThemeByScriptType } from './unity-code-editor.type';

@Injectable({
  providedIn: 'root'
})
export class UnityCodeEditorAnsibleService {

  constructor() {
    // Ensure Prettier is configured with YAML parser
    let yamlParser = Prettier?.getSupportInfo()?.languages?.find((lang: any) => lang?.name == "YAML");
    if (!yamlParser) {
      console.warn('Prettier YAML parser not loaded');
    }
  }

  // Formatting function
  formatYaml(text: string): { formatted: string; error: string | null } {
    try {
      const formatted = Prettier.format(text, {
        parser: 'yaml',
        plugins: [parserYaml],
        tabWidth: 2,
        useTabs: false
      });
      return { formatted, error: null };
    } catch (error) {
      return { formatted: text, error: error.message || 'Formatting failed' };
    }
  }

  // Linting function for CodeMirror
  lintYaml(text: string): CodeMirror.LintAnnotation[] {
    try {
      // Try parsing with js-yaml to validate YAML
      jsyaml.load(text, { schema: jsyaml.FAILSAFE_SCHEMA });
      return []; // No errors if parsing succeeds
    } catch (error: any) {
      // Handle js-yaml errors with line/column info
      if (error.mark && error.mark.line != null && error.mark.column != null) {
        const line = error.mark.line; // 0-based
        const column = error.mark.column; // 0-based
        return [{
          from: CodeMirror.Pos(line, column),
          to: CodeMirror.Pos(line, column + 1), // Highlight a small range
          message: error.message || 'Invalid YAML syntax',
          severity: 'error'
        }];
      }
      // Fallback for generic errors
      return [{
        from: CodeMirror.Pos(0, 0),
        to: CodeMirror.Pos(0, text.length),
        message: error.message || 'Invalid YAML syntax',
        severity: 'error'
      }];
    }
  }
}

export const ANSIBLE_CONFIG = (() => {
  const keywords = [
    'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
    'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None',
    'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield',
    'abs', 'all', 'any', 'bin', 'bool', 'chr', 'dict', 'dir', 'divmod', 'enumerate', 'eval',
    'filter', 'float', 'format', 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance',
    'issubclass', 'iter', 'len', 'list', 'map', 'max', 'min', 'next', 'object', 'oct', 'open',
    'ord', 'pow', 'print', 'range', 'repr', 'reversed', 'round', 'set', 'slice', 'sorted',
    'str', 'sum', 'tuple', 'type', 'vars', 'zip'
  ];
  return {
    mode: EditorModeByScriptType.ANSIBLE,
    theme: EditorThemeByScriptType.ANSIBLE,
    indentUnit: 2,
    tabSize: 2,
    keywords: keywords,
    regexes: {
      keywords: new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi'),
      operatorSpacing: /\s*([=+\-*/%<>!&|]+)\s*/g
    }
  }
})();
