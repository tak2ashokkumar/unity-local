import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PyodideEditorService } from './pyodide-editor.service';
declare var ace: any;

@Component({
  selector: 'pyodide-editor',
  templateUrl: './pyodide-editor.component.html',
  styleUrls: ['./pyodide-editor.component.scss'],
  providers: [PyodideEditorService]
})
export class PyodideEditorComponent implements OnInit, OnDestroy {

  @ViewChild('editor') private editorContent!: ElementRef;
  editor: any;
  pyodide: any;
  currentTheme = 'monokai';
  currentMode = 'python';
  outputMessage: string = '';

  private aceScriptElement: HTMLScriptElement | null = null;
  private langToolScriptElement: HTMLScriptElement | null = null;
  private pyodideScriptElement: HTMLScriptElement | null = null;

  constructor(private svc: PyodideEditorService) { }

  ngOnInit() {
    console.log("ng on init");
  }

  ngOnDestroy() {
    console.log("ng on destroy");
    if (this.aceScriptElement) document.body.removeChild(this.aceScriptElement);
    if (this.langToolScriptElement) document.body.removeChild(this.langToolScriptElement);
    if (this.pyodideScriptElement) document.body.removeChild(this.pyodideScriptElement);
    this.pyodide = null;
  }

  async ngAfterViewInit() {
    await this.loadAceScripts();
    await this.loadPyodide();

    this.editor = ace.edit(this.editorContent.nativeElement);
    this.setTheme('monokai');
    this.setMode('python');
    this.editor.session.setOption('useWorker', false);

    this.editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      showLineNumbers: true,
      tabSize: 4,
      useWorker: false,
    });

    this.editor.setValue('# Write Python code here', -1);
    this.editor.session.on('change', () => { this.validateAndRunPython(); });
  }

  private async loadAceScripts(): Promise<void> {
    if ((window as any).ace) return;
    await this.loadScript('static/assets/ace/ace.js');
    await this.loadScript('static/assets/ace/ext-language_tools.js');
    await this.loadScript('static/assets/ace/mode-python.js');
    await this.loadScript('static/assets/ace/theme-monokai.js');
  }

  private async loadPyodide(): Promise<void> {
    if ((window as any).loadPyodide) {
      this.pyodide = await (window as any).loadPyodide({ indexURL: 'static/assets/pyodide/' });
    } else {
      await this.loadScript('static/assets/pyodide/pyodide.js');
      this.pyodide = await (window as any).loadPyodide({ indexURL: 'static/assets/pyodide/' });
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.body.appendChild(script);
    });
  }

  setTheme(theme: string) {
    this.currentTheme = theme;
    this.editor.setTheme('ace/theme/' + theme);
  }

  setMode(mode: string) {
    this.currentMode = mode;
    this.editor.session.setMode(`ace/mode/${mode}`);
    this.editor.session.clearAnnotations();
  }

  /**
   * Runs the code in the editor through Pyodide.
   * Syntax-checks the code first, and if it passes, executes it.
   * If any errors occur, the line number and error message are extracted from the error.
   * The output is then displayed in the output box.
   */
  async validateAndRunPython() {
    if (!this.pyodide) {
      this.outputMessage = 'Pyodide not loaded';
      return;
    }

    const code = this.editor.getValue();
    const validationCode = this.svc.validateCode(code);
    try {
      const pyResult: string = await this.pyodide.runPythonAsync(validationCode);
      const result = JSON.parse(pyResult);

      // Apply annotations in Ace
      if (result.annotations?.length > 0) {
        this.editor.session.setAnnotations(result.annotations);
      } else {
        this.editor.session.clearAnnotations();
      }

      // Show both stdout and error messages
      this.outputMessage = result.output || '';

    } catch (err: any) {
      this.outputMessage = 'Execution failed: ' + err.message;
    }
  }

  // /** Apply Ace annotations for error line */
  // private applyAnnotations(result: any) {
  //   this.editor.session.setAnnotations([{
  //     row: (result.lineno || 1) - 1,
  //     column: 0,
  //     text: result.msg,
  //     type: 'error'
  //   }]);
  // }

  // showErrorBox(message: string) {
  //   this.outputMessage = message;
  //   setTimeout(() => this.outputMessage = '', 5000);
  // }

}
