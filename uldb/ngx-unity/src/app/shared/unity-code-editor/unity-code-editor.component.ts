import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UnityCodeEditorAnsibleService } from './unity-code-editor-ansible.service';
import { UnityCodeEditorBashService } from './unity-code-editor-bash.service';
import { UnityCodeEditorHclService } from './unity-code-editor-hcl.service';
import { UnityCodeEditorPowershellService } from './unity-code-editor-powershell.service';
import { PYTHON_CONFIG, UnityCodeEditorPythonService } from './unity-code-editor-python.service';
import { UnityCodeEditorService } from './unity-code-editor.service';

import * as CodeMirror from 'codemirror';
import 'codemirror/addon/edit/closebrackets'; // For auto-closing braces

import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';

import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';

import 'codemirror/mode/powershell/powershell'; // PowerShell
import 'codemirror/mode/python/python'; //Python
import 'codemirror/mode/shell/shell'; //Bash
import 'codemirror/mode/yaml/yaml'; //YAML (Ansible Playbooks)
import './unity-code-editor-hcl.mode'; // HCL or Terraform mode
import { ScriptTypes } from './unity-code-editor.type';

@Component({
  selector: 'unity-code-editor',
  templateUrl: './unity-code-editor.component.html',
  styleUrls: ['./unity-code-editor.component.scss'],
  providers: [UnityCodeEditorService]
})
export class UnityCodeEditorComponent implements OnInit, OnDestroy {
  @ViewChild('codeEditor', { static: true }) codeEditorRef!: ElementRef;
  editor!: CodeMirror.EditorFromTextArea;

  scriptTypes = ScriptTypes;
  activeScriptType: string = ScriptTypes.ANSIBLE;
  errorMessage: string | null = null;
  constructor(private svc: UnityCodeEditorService,
    private router: Router,
    private route: ActivatedRoute,
    private ansibleSvc: UnityCodeEditorAnsibleService,
    private pythonSvc: UnityCodeEditorPythonService,
    private powerShellSvc: UnityCodeEditorPowershellService,
    private bashSvc: UnityCodeEditorBashService,
    private hclSvc: UnityCodeEditorHclService) { }

  ngOnInit(): void {
    this.initializeEditor();
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.toTextArea();
    }
  }

  initializeEditor() {
    const config = this.svc.getConfigByScriptType(this.activeScriptType);
    this.editor = CodeMirror.fromTextArea(this.codeEditorRef.nativeElement, {
      mode: config.mode,
      theme: config.theme,
      lineNumbers: true,
      smartIndent: true,
      indentUnit: config.indentUnit,
      tabSize: config.tabSize,
      indentWithTabs: false,
      matchBrackets: true,
      autoCloseBrackets: true,
      gutters: ["CodeMirror-lint-markers"],
      lint: false,
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Ctrl-Shift-f': () => this.formatScript(),
        'Ctrl-Shift-F': () => this.formatScript()
      }
    });
    this.editor.setValue('');

    // lint check on change 
    const debouncedLint = this.debounce(() => this.getValidatorsByScriptType(this.activeScriptType), 300);
    this.editor.on('change', debouncedLint);

    this.editor.on('error', (instance: any, error: any) => {
      if (error.code == "NATIVE") return;
      this.errorMessage = error.message;
    });

    this.registerHintFunctions();

    this.editor.on('inputRead', (cm: any, change: any) => {
      if (change.text[0].match(/[a-zA-Z_]/)) {
        cm.showHint({
          hint: this.activeScriptType === ScriptTypes.PYTHON ? CodeMirror.hint.python : CodeMirror.hint.anyword
        });
      }
    });
  }

  debounce(fn: Function, delay = 500) {
    let timer: any;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Register all hint functions for CodeMirror
  registerHintFunctions() {
    // CodeMirror.registerHelper('hint', 'yaml', this.getYamlHint.bind(this));
    // CodeMirror.registerHelper('hint', 'terraform', this.getTerraformHint.bind(this));
    // CodeMirror.registerHelper('hint', 'shell', this.getBashHint.bind(this));
    // CodeMirror.registerHelper('hint', 'powershell', this.getPowerShellHint.bind(this));
    CodeMirror.registerHelper('hint', 'python', this.pythonSvc.registerPythonHint());
  }

  /**
   * Sets the active script type and updates the CodeMirror mode and content accordingly.
   * @param scriptType one of the {@link ScriptTypes} constants
   */
  onSelectScriptType(scriptType: string) {
    const config = this.svc.getConfigByScriptType(scriptType);
    if (config) {
      this.editor.setOption('mode', config.mode);
      this.editor.setOption('theme', config.theme);
      this.editor.setOption('indentUnit', config.indentUnit);
      this.editor.setOption('tabSize', config.tabSize);
      this.clearLintMarkers();
      this.activeScriptType = scriptType;
      this.getValidatorsByScriptType(scriptType);
    }
  }

  getValidatorsByScriptType(scriptType: string) {
    switch (scriptType) {
      case ScriptTypes.ANSIBLE: return this.yamlLint();
      case ScriptTypes.TERRAFORM: return this.terraformLint();
      case ScriptTypes.BASH: return this.bashLint();
      case ScriptTypes.POWERSHELL: return this.powerShellLint();
      case ScriptTypes.PYTHON: return this.pythonLint();
      default: return null;
    }
  }

  /**
   * Lints the YAML text using the Ansible service and sets the CodeMirror lint annotations.
   */
  yamlLint(): void {
    this.clearLintMarkers();
    this.editor.setOption('lint', {
      /**
       * Linting function that takes the text string and returns an array of lint annotations.
       * @param text the YAML text to lint
       * @returns the lint annotations array
       */
      getAnnotations: (text: string) => {
        if (!text.trim()) return []; // Skip empty scripts
        const rawIssues = this.ansibleSvc.lintYaml(text);
        return rawIssues;
      },
      /**
       * Whether to lint asynchronously or not.
       */
      async: false,
      /**
       * The delay in milliseconds before re-linting the text after a change.
       */
      delay: 500
    });
  }

  terraformLint(): void {
    console.log("terraformLint");
    this.clearLintMarkers();
    this.editor.setOption('lint', {
      getAnnotations: (text: string, updateLinting: (cm: any, annotations: any[]) => void, options: any, cm: any) => {
        try {
          const issues = this.hclSvc.lint(text); // Use provided text instead of cm.getValue()
          updateLinting(cm, issues);
        } catch (error: any) {
          updateLinting(cm, [{
            message: `Linting failed: ${error.message || 'Unknown error'}`,
            severity: 'error',
            from: { line: 0, ch: 0 },
            to: { line: 0, ch: 1 }
          }]);
        }
      },
      async: true
    });
  }

  bashLint(): void {
    this.clearLintMarkers();
    this.editor.setOption('lint', {
      getAnnotations: (text: string) => {
        const rawIssues = this.bashSvc.lint(text);
        return rawIssues.map(issue => ({
          message: issue.message,
          severity: issue.severity,
          from: CodeMirror.Pos(issue.fromLine, issue.fromCh),
          to: CodeMirror.Pos(issue.toLine, issue.toCh)
        }));
      },
      async: false
    });
  }

  powerShellLint(): void {
    this.editor.clearGutter('CodeMirror-lint-markers');
    this.editor.getAllMarks().forEach((mark: any) => mark.clear());
    this.editor.setOption('lint', {
      /**
       * Linting function that takes the text string and returns an array of lint annotations.
       * @param text the YAML text to lint
       * @returns the lint annotations array
       */
      getAnnotations: (text: string) => {
        if (!text.trim()) return []; // Skip empty scripts
        const rawIssues = this.ansibleSvc.lintYaml(text);
        return rawIssues;
      },
      /**
       * Whether to lint asynchronously or not.
       */
      async: false,
      /**
       * The delay in milliseconds before re-linting the text after a change.
       */
      delay: 500
    });
  }

  pythonLint(): void {
    this.editor.clearGutter('CodeMirror-lint-markers');
    this.editor.getAllMarks().forEach((mark: any) => mark.clear());
    this.editor.setOption('lint', {
      getAnnotations: (text: string) => {
        if (!text.trim()) return []; // Skip empty scripts
        const rawIssues = this.pythonSvc.lint(text);
        return rawIssues;
      },
      /**
       * Whether to lint asynchronously or not.
       */
      async: false,
      /**
       * The delay in milliseconds before re-linting the text after a change.
       */
      delay: 500
    });
  }

  addLintError(line: number, message: string): void {
    const lineNumber = line - 1;
    const lineText = this.editor.getLine(lineNumber);

    // Add gutter marker
    const gutterMarker = document.createElement("div");
    gutterMarker.style.color = "red";
    gutterMarker.innerHTML = "●";

    this.editor.setGutterMarker(lineNumber, "CodeMirror-lint-markers", gutterMarker);

    // Add inline marker
    const markerOptions = {
      className: "cm-lint-error",
      title: message,
    };

    this.editor.markText(
      { line: lineNumber, ch: 0 },
      { line: lineNumber, ch: lineText.length },
      markerOptions
    );
  }

  clearLintMarkers() {
    this.editor.clearGutter('CodeMirror-lint-markers');
    this.editor.getAllMarks().forEach((mark: any) => mark.clear());
    this.editor.refresh();
  }


  /**
   * Formats the script content based on the current script type.
   *
   * @remarks
   * The formatting is done using the PowerShell formatter.
   * For Python content, the beautify library is used.
   */
  formatScript(): void {
    const currentContent = this.editor.getValue();
    switch (this.activeScriptType) {
      case ScriptTypes.ANSIBLE:
        try {
          const result = this.ansibleSvc.formatYaml(currentContent);
          if (result.error) {
            this.errorMessage = 'Formatting failed: ' + result.error;
          } else {
            this.editor.setValue(result.formatted);
            this.editor.refresh();
            this.errorMessage = null;
          }
        } catch (error: any) {
          this.errorMessage = error.message || 'Formatting failed: Unknown error.';
        }
        return;
      case ScriptTypes.TERRAFORM:
        try {
          const formatted = this.hclSvc.format(currentContent);
          this.editor.setValue(formatted);
          this.editor.refresh();
          this.errorMessage = null; // Clear error on success
        } catch (error: any) {
          this.errorMessage = error.message || 'Formatting failed: Unknown error.';
        }
        return;
      case ScriptTypes.BASH:
        try {
          const formatted = this.bashSvc.format(currentContent);
          this.editor.setValue(formatted);
          this.editor.refresh();
          this.errorMessage = null; // Clear error on success
        } catch (error: any) {
          this.errorMessage = error.message || 'Formatting failed: Unknown error.';
        }
        return;
      case ScriptTypes.PYTHON:
        try {
          const formatted = this.pythonSvc.format(currentContent);
          this.editor.setValue(formatted);
          this.editor.refresh();
          this.errorMessage = null; // Clear error on success
        } catch (error: any) {
          this.errorMessage = error.message || 'Formatting failed: Unknown error.';
        }
        return;
      case ScriptTypes.POWERSHELL:
        try {
          const formatted = this.powerShellSvc.format(currentContent);
          this.editor.setValue(formatted);
          this.editor.refresh();
          this.errorMessage = null; // Clear error on success
        } catch (error: any) {
          this.errorMessage = error.message || 'Formatting failed: Unknown error.';
        }
        return;
    }
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
