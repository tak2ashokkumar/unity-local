import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AceEditorService } from './ace-editor.service';

declare const ace: any;

interface QuickFix {
  label: string;
  apply: (code: string) => string;
}

interface LintMessage {
  line: number;
  column: number;
  message: string;
  type: 'error' | 'warning';
  fixes?: QuickFix[];
}


@Component({
  selector: 'ace-editor',
  templateUrl: './ace-editor.component.html',
  styleUrls: ['./ace-editor.component.scss']
})
export class AceEditorComponent implements OnInit {

  @ViewChild('editor') private editorEl!: ElementRef;

  private editor: any;
  currentTheme = 'monokai';
  currentMode = 'python';
  private messages: LintMessage[] = [];

  showMenu = false;
  menuX = 0;
  menuY = 0;
  hoveredMessage: LintMessage | null = null;

  private aceScript: HTMLScriptElement | null = null;
  private aceLangScript: HTMLScriptElement | null = null;


  constructor(private scriptLoader: AceEditorService) { }

  ngOnInit(): void {
    // this.aceScript = document.createElement('script');
    // this.aceScript.id = 'ace';
    // this.aceScript.src = 'static/assets/ace/ace.js';  // Your local path
    
    // this.aceLangScript = document.createElement('script');
    // this.aceLangScript.id = 'ace-lang';
    // this.aceLangScript.src = 'static/assets/ace/ext-language_tools.js';  // Your local path
  }

  async ngAfterViewInit() {

    // Lazy load scripts
    await this.scriptLoader.loadScript('static/assets/ace/ace.js');
    await this.scriptLoader.loadScript('static/assets/ace/ext-language_tools.js');
    await this.scriptLoader.loadScript('static/assets/ace/mode-python.js');
    await this.scriptLoader.loadScript('static/assets/ace/theme-monokai.js');

    this.editor = ace.edit(this.editorEl.nativeElement);
    this.setMode(this.currentMode);
    this.setTheme(this.currentTheme);
    this.editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      showLineNumbers: true,
      tabSize: 4,
    });
    this.editor.setValue('# Offline Ace Editor\nprint("Hello Offline!")');
    this.addCustomCompletions();
    this.editor.session.setOption('useWorker', false);
    this.editor.session.on('change', () => this.validateCode());
  }

  setTheme(theme: string) {
    this.currentTheme = theme;
    this.editor.setTheme('ace/theme/' + theme);
  }

  setMode(mode: string) {
    this.currentMode = mode;
    this.editor.session.setMode('ace/mode/' + mode);
  }

  // runValidation() {
  //   const code = this.editor.getValue();
  //   const annotations: any[] = [];

  //   if (this.currentMode === 'python' && !code.includes('print(')) {
  //     annotations.push({
  //       row: 0,
  //       column: 0,
  //       text: 'Python code should have at least one print() statement',
  //       type: 'error'
  //     });
  //   }

  //   this.editor.session.setAnnotations(annotations);
  // }

  /** Quick Fix All **/
  applyQuickFixes() {
    let code = this.editor.getValue();
    this.messages.forEach(msg => {
      msg.fixes?.forEach(fix => code = fix.apply(code));
    });
    this.editor.setValue(code, 1);
    this.showMenu = false;
  }

  /** Specific Fix **/
  applySpecificFix(fix: QuickFix) {
    let code = this.editor.getValue();
    const updated = fix.apply(code);
    this.editor.setValue(updated, 1);
    this.showMenu = false;
  }

  /** Validation **/
  validateCode() {
    const code = this.editor.getValue();
    this.messages = this.lintPythonCode(code);

    this.editor.session.setAnnotations(
      this.messages.map(msg => ({
        row: msg.line - 1,
        column: msg.column,
        text: msg.message,
        type: msg.type
      }))
    );
  }

  /** Hover detection **/
  onEditorMouseMove(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const row = this.editor.renderer.screenToTextCoordinates(event.clientX - rect.left, event.clientY - rect.top).row + 1;

    const message = this.messages.find(m => m.line === row && m.fixes?.length);
    if (message) {
      this.hoveredMessage = message;
      this.showMenu = true;
      this.menuX = event.clientX - rect.left + 10;
      this.menuY = event.clientY - rect.top + 10;
    } else {
      this.showMenu = false;
      this.hoveredMessage = null;
    }
  }

  /** Simple Python Linter with multiple fixes **/
  lintPythonCode(code: string): LintMessage[] {
    const messages: LintMessage[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Trailing whitespace
      if (/\s+$/.test(line)) {
        messages.push({
          line: index + 1,
          column: line.length - 1,
          message: 'Trailing whitespace',
          type: 'warning',
          fixes: [
            { label: 'Remove trailing whitespace', apply: c => c.replace(/\s+$/gm, '') }
          ]
        });
      }

      // Indentation
      const indent = line.match(/^\s*/)?.[0].length || 0;
      if (indent % 4 !== 0 && trimmed.length > 0) {
        messages.push({
          line: index + 1,
          column: 0,
          message: 'Indentation not multiple of 4',
          type: 'warning',
          fixes: [
            { label: 'Fix indentation', apply: c => c.replace(line, ' '.repeat(Math.ceil(indent / 4) * 4) + trimmed) }
          ]
        });
      }

      // Print without parentheses
      if (/^\s*print\s+[^()]/.test(line)) {
        messages.push({
          line: index + 1,
          column: 0,
          message: 'Use print() instead of print statement',
          type: 'error',
          fixes: [
            { label: 'Convert to print()', apply: c => c.replace(line, line.replace(/print\s+(.+)/, 'print($1)')) }
          ]
        });
      }
    });

    return messages;
  }

  /** Autocomplete **/
  addCustomCompletions() {
    const langTools = ace.require('ace/ext/language_tools');
    const pythonKeywords = [
      'def', 'class', 'import', 'from', 'for', 'while', 'if', 'elif', 'else',
      'try', 'except', 'finally', 'with', 'as', 'pass', 'break', 'continue',
      'return', 'yield', 'lambda', 'print', 'input', 'len', 'range', 'dict',
      'list', 'set', 'tuple', 'str', 'int', 'float', 'bool', 'True', 'False', 'None'
    ];

    const customCompleter = {
      getCompletions: (editor: any, session: any, pos: any, prefix: string, callback: any) => {
        if (prefix.length === 0) { callback(null, []); return; }
        callback(null, pythonKeywords.map(k => ({
          caption: k,
          value: k,
          meta: 'keyword'
        })));
      }
    };
    langTools.addCompleter(customCompleter);
  }
}
