import { Injectable } from '@angular/core';
import * as CodeMirror from 'codemirror';
import { EditorModeByScriptType, EditorThemeByScriptType } from './unity-code-editor.type';

declare const Sk: any; // Skulpt global

@Injectable({
  providedIn: 'root'
})
export class UnityCodeEditorPythonService {

  constructor() {
    // Configure Skulpt for Python 3
    this.configureSkulpt();
  }

  private configureSkulpt() {
    if (Sk) {
      Sk.__future__ = Sk.__future__ || {};
      Sk.__future__.python3 = { v: true };
      Sk.__future__.dict_keys = true; // Ensure bare dictionary keys are treated as strings
      Sk.tokenize = Sk.tokenize || Sk._tokenize;
      Sk.parseFlags = Sk.parseFlags || 0;
      Sk.parseFlags |= 0x200; // Enable Python 3 parsing (PyCF_ONLY_AST)
      console.log('Skulpt configured for Python 3:', Sk.__future__, 'Flags:', Sk.parseFlags);
    } else {
      console.error('Skulpt is not loaded. Ensure skulpt.min.js and skulpt-stdlib.js are included.');
    }
  }

  registerPythonHint() {
    CodeMirror.registerHelper('hint', 'python', this.getPythonHint.bind(this));
  }

  private getPythonHint(editor: any) {
    const cursor = editor.getCursor();
    const token = editor.getTokenAt(cursor);
    const word = token.string.trim();
    const start = token.start;
    const end = token.end;

    const code = editor.getValue();
    const words: string[] = code.match(/\b\w+\b/g) || [];
    const variables: string[] = [...new Set(words.filter(w => !PYTHON_CONFIG.keywords.includes(w)))];

    const suggestions = [...PYTHON_CONFIG.keywords, ...variables]
      .filter((s: string) => s.startsWith(word) && s !== word)
      .map((s: string) => ({ text: s, displayText: s }));

    return {
      list: suggestions,
      from: CodeMirror.Pos(cursor.line, start),
      to: CodeMirror.Pos(cursor.line, end),
    };
  }

  format(script: string): string {
    if (!script?.trim()) {
      return '\n'; // Empty files still need a newline
    }

    try {
      this.configureSkulpt();
      const ast = Sk.parse('<stdin>.py', script);
      const tree = Sk.astFromParse(ast.cst, '<stdin>.py', ast.flags);
      return this.formatNode(tree, 0, script.split('\n')).join('\n');
    } catch (e) {
      console.warn('AST parsing failed, using fallback formatter:', e);
      return this.fallbackFormat(script);
    }
  }

  private formatNode(node: any, indentLevel: number, originalLines: string[]): string[] {
    const lines: string[] = [];
    const indent = '    '.repeat(indentLevel);

    if (!node) return lines;

    switch (node._astname) {
      case 'Module':
        node.body.forEach((child: any, i: number) => {
          const childLines = this.formatNode(child, indentLevel, originalLines);
          if (i > 0 && (child._astname === 'FunctionDef' || child._astname === 'ClassDef')) {
            lines.push('', '');
          }
          lines.push(...childLines);
        });
        break;

      case 'FunctionDef':
        const args = this.formatArguments(node.args);
        lines.push(`${indent}def ${node.name.v}(${args}):`);
        if (node.body && node.body[0]?._astname === 'Expr' && node.body[0].value?._astname === 'Str') {
          const docstring = node.body[0].value.s.v;
          const docLines = this.formatDocstring(docstring, indentLevel + 1);
          lines.push(...docLines);
          node.body = node.body.slice(1);
          if (node.body.length && docLines.length > 1) lines.push('');
        }
        node.body.forEach((child: any) => {
          lines.push(...this.formatNode(child, indentLevel + 1, originalLines));
        });
        break;

      case 'ClassDef':
        lines.push(`${indent}class ${node.name.v}:`);
        node.body.forEach((child: any, i: number) => {
          const childLines = this.formatNode(child, indentLevel + 1, originalLines);
          if (i > 0 && child._astname === 'FunctionDef') {
            lines.push('');
          }
          lines.push(...childLines);
        });
        break;

      case 'Expr':
        if (node.value?._astname === 'Str') {
          lines.push(...this.formatDocstring(node.value.s.v, indentLevel));
        } else {
          lines.push(indent + this.formatExpression(node.value));
        }
        break;

      case 'Assign':
        const targets = node.targets.map((t: any) => this.formatExpression(t)).join(', ');
        const value = this.formatExpression(node.value);
        lines.push(`${indent}${targets} = ${value}`);
        break;

      case 'Dict':
        lines.push(...this.formatDictionary(node, indentLevel));
        break;

      case 'Import':
      case 'ImportFrom':
        const importLine = this.formatImport(node);
        if (importLine) lines.push(importLine);
        break;

      default:
        const lineNo = node.lineno ? node.lineno - 1 : 0;
        if (originalLines[lineNo]) {
          lines.push(indent + originalLines[lineNo].trim());
        }
    }

    // Remove excess blank lines, but preserve one trailing newline in final output
    while (lines.length > 1 && lines[lines.length - 1] === '' && lines[lines.length - 2] === '') {
      lines.pop();
    }

    return lines;
  }

  private formatArguments(argsNode: any): string {
    const args: string[] = [];
    argsNode.args.forEach((arg: any) => {
      let argStr = arg.arg.v;
      if (arg.annotation) {
        argStr += ': ' + this.formatExpression(arg.annotation);
      }
      if (arg.defaults && arg.defaults.length) {
        argStr += ' = ' + this.formatExpression(arg.defaults[0]);
      }
      args.push(argStr);
    });
    return args.join(', ');
  }

  private formatDocstring(docstring: string, indentLevel: number): string[] {
    const indent = '    '.repeat(indentLevel);
    const lines = docstring.split('\n').map(line => line.trim());
    if (lines.length === 1) {
      return [`${indent}"""${lines[0]}"""`];
    }
    const formatted = [`${indent}"""`];
    lines.forEach(line => formatted.push(`${indent}${line}`));
    formatted.push(`${indent}"""`);
    return formatted;
  }

  private formatDictionary(node: any, indentLevel: number): string[] {
    const indent = '    '.repeat(indentLevel);
    const nextIndent = '    '.repeat(indentLevel + 1);
    const keys = node.keys.map((k: any) => this.formatExpression(k));
    const values = node.values.map((v: any) => this.formatExpression(v));
    const pairs = keys.map((k: string, i: number) => `${k}: ${values[i]}`);

    if (pairs.join(', ').length + indent.length <= 79) {
      return [`${indent}{${pairs.join(', ')}}`];
    }

    const lines = [`${indent}{`];
    pairs.forEach((pair: string) => lines.push(`${nextIndent}${pair},`));
    lines.push(`${indent}}`);
    return lines;
  }

  private formatExpression(node: any): string {
    switch (node._astname) {
      case 'Name':
        return node.id.v;
      case 'Num':
        return String(node.n.v);
      case 'Str':
        return `"${node.s.v}"`;
      case 'BinOp':
        const left = this.formatExpression(node.left);
        const op = node.op.prototype._astname.replace('Op', '');
        const right = this.formatExpression(node.right);
        return `${left} ${op.toLowerCase()} ${right}`;
      case 'Call':
        const func = this.formatExpression(node.func);
        const args = node.args.map((a: any) => this.formatExpression(a)).join(', ');
        return `${func}(${args})`;
      default:
        return '';
    }
  }

  private formatImport(node: any): string {
    if (node._astname === 'Import') {
      return `import ${node.names.map((n: any) => n.name.v).join(', ')}`;
    }
    if (node._astname === 'ImportFrom') {
      const names = node.names.map((n: any) => n.name.v).join(', ');
      return `from ${node.module.v} import ${names}`;
    }
    return '';
  }

  private fallbackFormat(script: string): string {
    const lines = script.split('\n');
    const formattedLines: string[] = [];
    let indentLevel = 0;
    let blankCount = 0;
    let prevLineEndsWithColon = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        blankCount++;
        if (blankCount <= 1 && i < lines.length - 1) {
          formattedLines.push('');
        }
        continue;
      }
      blankCount = 0;

      if (prevLineEndsWithColon) {
        indentLevel++;
      }
      if (trimmedLine.match(/^(return|break|continue|pass|else|elif|except|finally)\b/)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      let formattedLine = trimmedLine
        .replace(/\s+$/, '')
        .replace(PYTHON_CONFIG.regexes.operators, ' $1 ')
        .replace(/\s*([\(\[\{])\s*/g, '$1')
        .replace(/\s*([\)\]\}])\s*/g, '$1')
        .replace(/,\s*/g, ', ')
        .replace(/\s*=\s*/g, ' = ');

      const indent = '    '.repeat(indentLevel);
      formattedLines.push(indent + formattedLine);
      prevLineEndsWithColon = trimmedLine.endsWith(':');
    }

    // Remove excess blank lines, but preserve one trailing newline in final output
    while (formattedLines.length > 1 && formattedLines[formattedLines.length - 1] === '' && formattedLines[formattedLines.length - 2] === '') {
      formattedLines.pop();
    }

    return formattedLines.join('\n');
  }

  lint(script: string): any[] {
    if (!script || typeof script !== 'string') {
      return [];
    }

    let normalizedScript = script;
    if (script.match(/\{[a-zA-Z_][a-zA-Z0-9_]*\s*:/)) {
      normalizedScript = script.replace(
        /([,{]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g,
        "$1'$2':"
      );
      console.warn('Normalized script:', normalizedScript);
    }

    const errors: any[] = [];
    const lines = script.split('\n');
    let inMultiLineString = false;
    let multiLineStringQuote: string | null = null;
    let inClass = false;
    let prevNonBlankLine: string | null = null;

    try {
      this.configureSkulpt();
      Sk.parse('<stdin>.py', normalizedScript);
    } catch (e: any) {
      console.warn('Skulpt parse error:', e, 'Normalized script:', normalizedScript);

      let errorMessage = 'Unknown parse error';
      let line = 0;

      if (e.args && e.args.v && e.args.v[0] && typeof e.args.v[0].v === 'string') {
        errorMessage = e.args.v[0].v;
        if (errorMessage === 'bad input' && script.match(/\{[a-zA-Z_][a-zA-Z0-9_]*\s*:/)) {
          console.warn('Skipping Skulpt error for valid bare dictionary keys');
        } else {
          if (e.traceback && e.traceback[0] && typeof e.traceback[0].lineno === 'number') {
            line = e.traceback[0].lineno - 1;
          } else {
            const lineMatch = errorMessage.match(/line (\d+)/);
            if (lineMatch) {
              line = parseInt(lineMatch[1]) - 1;
            }
          }
          errors.push({
            from: CodeMirror.Pos(line, 0),
            to: CodeMirror.Pos(line, lines[line]?.length || 0),
            message: `Syntax error: ${errorMessage}`,
            severity: 'error'
          });
        }
      } else if (typeof e.toString === 'function') {
        errorMessage = e.toString();
        const lineMatch = errorMessage.match(/line (\d+)/);
        if (lineMatch) {
          line = parseInt(lineMatch[1]) - 1;
        }
        errors.push({
          from: CodeMirror.Pos(line, 0),
          to: CodeMirror.Pos(line, lines[line]?.length || 0),
          message: `Syntax error: ${errorMessage}`,
          severity: 'error'
        });
      }
    }

    lines.forEach((line: string, index: number) => {
      // Skip shebang line
      if (index === 0 && line.startsWith('#!')) {
        return;
      }

      if (line.includes('"""') || line.includes("'''")) {
        if (inMultiLineString) {
          if (line.includes(multiLineStringQuote!)) {
            inMultiLineString = false;
            multiLineStringQuote = null;
          }
          return;
        } else if (line.match(/'''|"""/)) {
          inMultiLineString = true;
          multiLineStringQuote = line.includes('"""') ? '"""' : "'''";
          return;
        }
      }
      if (inMultiLineString) return;

      const trimmedLine = line.trim();

      if (line.includes('\t')) {
        errors.push({
          from: CodeMirror.Pos(index, line.indexOf('\t')),
          to: CodeMirror.Pos(index, line.indexOf('\t') + 1),
          message: 'Tab characters are not allowed, use spaces',
          severity: 'error'
        });
      }

      const indentMatch = line.match(/^\s*/);
      const indentLength = indentMatch ? indentMatch[0].length : 0;
      if (indentLength % 4 !== 0 && trimmedLine.length > 0) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, indentLength),
          message: 'Indentation should be multiples of 4 spaces',
          severity: 'error'
        });
      }

      if (line.length > 79) {
        errors.push({
          from: CodeMirror.Pos(index, 79),
          to: CodeMirror.Pos(index, line.length),
          message: 'Line exceeds 80 characters',
          severity: 'warning'
        });
      }

      if (trimmedLine.match(/[^+\-*/%<>!&|=]\s*[+\-*/%<>]+\s*[^+\-*/%<>]/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Missing whitespace around operator',
          severity: 'error'
        });
      }

      if (trimmedLine.match(/\s{2,}[+\-*/%<>!&|]/) || trimmedLine.match(/[+\-*/%<>!&|]\s{2,}/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Multiple spaces around operator',
          severity: 'warning'
        });
      }

      if (trimmedLine.match(/,[^ \n]/)) {
        errors.push({
          from: CodeMirror.Pos(index, line.indexOf(',')),
          to: CodeMirror.Pos(index, line.indexOf(',') + 1),
          message: 'Missing whitespace after comma',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/,\s{2,}/)) {
        errors.push({
          from: CodeMirror.Pos(index, line.indexOf(',')),
          to: CodeMirror.Pos(index, line.indexOf(',') + 1),
          message: 'Multiple spaces after comma',
          severity: 'warning'
        });
      }

      if (trimmedLine.match(/\(\s+|\s+\)/) || trimmedLine.match(/\[\s+|\s+\]/) || trimmedLine.match(/\{\s+|\s+\}/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Extraneous whitespace inside parentheses/brackets',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/[a-zA-Z0-9_]\s+\(/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Whitespace before parentheses',
          severity: 'warning'
        });
      }

      if (trimmedLine.match(/\w+\s*=\s*\w+/)) {
        const isTypeAnnotation = trimmedLine.match(/:\s*[^=]+=\s*/);
        if (!isTypeAnnotation) {
          errors.push({
            from: CodeMirror.Pos(index, 0),
            to: CodeMirror.Pos(index, line.length),
            message: 'No space around = in assignment',
            severity: 'warning'
          });
        }
      }

      // Comment checks only for inline comments
      const commentMatch = trimmedLine.match(/#+(\s*.*)/);
      if (commentMatch && trimmedLine.match(/[^ \t\n].*#/)) { // Inline only
        if (!trimmedLine.match(/[^ \t\n].*\s\s#/)) {
          errors.push({
            from: CodeMirror.Pos(index, line.indexOf('#')),
            to: CodeMirror.Pos(index, line.length),
            message: 'Inline comment should be preceded by two spaces',
            severity: 'warning'
          });
        }
        if (!commentMatch[1].match(/^\s/)) {
          errors.push({
            from: CodeMirror.Pos(index, line.indexOf('#')),
            to: CodeMirror.Pos(index, line.length),
            message: 'Inline comment should start with "# "',
            severity: 'warning'
          });
        }
        if (commentMatch[0].match(/^##/)) {
          errors.push({
            from: CodeMirror.Pos(index, line.indexOf('#')),
            to: CodeMirror.Pos(index, line.length),
            message: 'Multiple # symbols in comment',
            severity: 'warning'
          });
        }
      }

      if (trimmedLine.match(/[^;];[^;]/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Multiple statements on one line',
          severity: 'error'
        });
      }
      if (trimmedLine.endsWith(';')) {
        errors.push({
          from: CodeMirror.Pos(index, line.length - 1),
          to: CodeMirror.Pos(index, line.length),
          message: 'Unnecessary semicolon',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/^def\s+\w+\s*\(.*\):.*$/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Single-line function definition should be expanded',
          severity: 'warning'
        });
      }

      if (
        index > 0 &&
        lines
          .slice(0, index)
          .some((l) => l.trim() && !l.trim().startsWith('import') && !l.trim().startsWith('from')) &&
        (trimmedLine.startsWith('import') || trimmedLine.startsWith('from'))
      ) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Imports should be at the top of the file',
          severity: 'warning'
        });
      }

      if (trimmedLine.match(/==\s*None|!=\s*None/i)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Use "is" or "is not" for None comparisons',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/==\s*(True|False)|!=\s*(True|False)/i) && !trimmedLine.includes('__name__')) {
        errors.push({
          from: CodeMirror.Pos(index, line.indexOf('==') !== -1 ? line.indexOf('==') : line.indexOf('!=')),
          to: CodeMirror.Pos(index, line.length),
          message: 'Direct comparison to True/False',
          severity: 'warning'
        });
      }

      if (trimmedLine.match(/^\s*\w+\s*=\s*lambda/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Avoid assigning lambda expressions, use def',
          severity: 'warning'
        });
      }

      if (trimmedLine.match(/\\$/)) {
        errors.push({
          from: CodeMirror.Pos(index, line.length - 1),
          to: CodeMirror.Pos(index, line.length),
          message: 'Unnecessary line continuation',
          severity: 'warning'
        });
      }

      if (trimmedLine.match(/^def\s+[A-Z]/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Function names should be lowercase',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/^class\s+[a-z]/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Class names should be CamelCase',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/^def\s+\w+\s*\(\s*[A-Z]/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Argument names should be lowercase',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/^def\s+\w+\s*\(\s*[^,self]+/) && inClass) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Expected "self" as first argument in instance method',
          severity: 'error'
        });
      }
      if (trimmedLine.match(/^@classmethod\s+def\s+\w+\s*\(\s*[^,cls]/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Expected "cls" as first argument in class method',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/[a-zA-Z_]+\s*=/) && trimmedLine.match(/[A-Z]/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Variable names should be lowercase',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/[a-z]+\s*=/) && trimmedLine.match(/^[a-z_]+$/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Constant names should be uppercase',
          severity: 'warning'
        });
      }

      if (trimmedLine.startsWith('def ') && lines[index + 1] && !lines[index + 1].trim().match(/^['"]{3}/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Missing docstring in public function',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/^['"]{3}[^'"]+['"]{3}$/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Single-line docstring should fit on one line',
          severity: 'warning'
        });
      }
      if (trimmedLine.startsWith('def ') && lines[index + 1]?.trim() === '' && lines[index + 2]?.trim().match(/^['"]{3}/)) {
        errors.push({
          from: CodeMirror.Pos(index + 1, 0),
          to: CodeMirror.Pos(index + 1, lines[index + 1]?.length || 0),
          message: 'No blank lines before docstring',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/^['"]{3}/) && lines[index + 1]?.trim() === '') {
        errors.push({
          from: CodeMirror.Pos(index + 1, 0),
          to: CodeMirror.Pos(index + 1, lines[index + 1]?.length || 0),
          message: 'No blank lines after docstring',
          severity: 'warning'
        });
      }
      if (trimmedLine.startsWith('class ') && lines[index + 1]?.trim() && lines[index + 1]?.trim().match(/^['"]{3}/)) {
        errors.push({
          from: CodeMirror.Pos(index + 1, 0),
          to: CodeMirror.Pos(index + 1, lines[index + 1]?.length || 0),
          message: 'One blank line required before docstring',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/^['"]{3}/) && lines[index + 1]?.trim() && !lines[index + 2]?.trim()) {
        errors.push({
          from: CodeMirror.Pos(index + 2, 0),
          to: CodeMirror.Pos(index + 2, lines[index + 2]?.length || 0),
          message: 'One blank line required after docstring',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/^['"]{3}[^'"]+/) && lines[index + 1]?.trim() && !lines[index + 1].trim().startsWith('"""') && !lines[index + 1].trim().startsWith("'''")) {
        errors.push({
          from: CodeMirror.Pos(index + 1, 0),
          to: CodeMirror.Pos(index + 1, lines[index + 1]?.length || 0),
          message: 'Blank line required between docstring summary and description',
          severity: 'warning'
        });
      }
      if (trimmedLine.match(/^['"]{3}[^'"]+/) && !trimmedLine.endsWith('.')) {
        errors.push({
          from: CodeMirror.Pos(index, line.length),
          to: CodeMirror.Pos(index, line.length),
          message: 'Docstring summary should end with a period',
          severity: 'warning'
        });
      }

      if (line.match(/\s+$/)) {
        errors.push({
          from: CodeMirror.Pos(index, line.length),
          to: CodeMirror.Pos(index, line.length),
          message: 'Trailing whitespace',
          severity: 'warning'
        });
      }

      if (!trimmedLine && line.match(/\s+/)) {
        errors.push({
          from: CodeMirror.Pos(index, 0),
          to: CodeMirror.Pos(index, line.length),
          message: 'Blank line contains whitespace',
          severity: 'warning'
        });
      }

      const words = trimmedLine.split(/\s+/);
      words.forEach((word: string, i: number) => {
        if (
          word &&
          !PYTHON_CONFIG.keywords.includes(word) &&
          word.match(/^[a-zA-Z_]\w*$/) &&
          !line.includes('import') &&
          !line.includes('def')
        ) {
          const allLines = lines.slice(0, index + 1).join('\n');
          const isAssignmentTarget = line.match(new RegExp(`\\s*${word}\\s*=(?:[^=]|$)|,\\s*${word}\\s*=(?:[^=]|$)`, ''));
          console.debug(`Checking word: ${word}, Line: "${line}", IsAssignment: ${!!isAssignmentTarget}`);
          if (!isAssignmentTarget && !allLines.includes(word) && !word.match(/^[0-9]/)) {
            errors.push({
              from: CodeMirror.Pos(index, line.indexOf(word)),
              to: CodeMirror.Pos(index, line.indexOf(word) + word.length),
              message: `Undefined variable '${word}'`,
              severity: 'warning'
            });
          }
        }
      });

      if (trimmedLine.startsWith('class ')) {
        inClass = true;
      } else if (trimmedLine && indentLength === 0) {
        inClass = false;
      }
      if (trimmedLine) {
        prevNonBlankLine = trimmedLine;
      }
    });

    for (let index = 0; index < lines.length; index++) {
      const trimmedLine = lines[index].trim();
      if (trimmedLine.startsWith('def ') || trimmedLine.startsWith('class ')) {
        let blankLines = 0;
        for (let i = index - 1; i >= 0 && !lines[i].trim(); i--) {
          blankLines++;
        }
        if (index > 0 && trimmedLine.startsWith('def ') && lines[index - 1].trim().startsWith('class')) {
          if (blankLines !== 0) {
            errors.push({
              from: CodeMirror.Pos(index, 0),
              to: CodeMirror.Pos(index, lines[index].length),
              message: `Expected no blank line before method, found ${blankLines}`,
              severity: 'warning'
            });
          }
        } else if (blankLines !== 1) {
          errors.push({
            from: CodeMirror.Pos(index, 0),
            to: CodeMirror.Pos(index, lines[index].length),
            message: `Expected one blank line before function/class, found ${blankLines}`,
            severity: 'warning'
          });
        }
      }
    }

    if (lines.length && lines[lines.length - 1].trim() && !script.endsWith('\n')) {
      errors.push({
        from: CodeMirror.Pos(lines.length - 1, lines[lines.length - 1].length),
        to: CodeMirror.Pos(lines.length - 1, lines[lines.length - 1].length),
        message: 'No newline at end of file',
        severity: 'warning'
      });
    }

    return errors;
  }
}

export const PYTHON_CONFIG = (() => {
  const keywords = [
    'and', 'as', 'from', 'assert', 'break', 'with', 'class', 'continue', 'def', 'del', 'elif',
    'else', 'except', 'False', 'finally', 'import', 'for', 'if', 'in', 'is', 'lambda', 'None',
    'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield',
  ];
  return {
    mode: EditorModeByScriptType.PYTHON,
    theme: EditorThemeByScriptType.PYTHON,
    indentUnit: 4,
    tabSize: 4,
    keywords: keywords,
    regexes: {
      keywords: new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi'),
      operators: /\s*([=+\-*/%<>!&|])\s*/g,
    }
  }
})();
