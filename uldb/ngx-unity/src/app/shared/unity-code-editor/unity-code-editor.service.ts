import { Injectable } from '@angular/core';
import { cloneDeep as _clone } from 'lodash-es';
import { ANSIBLE_CONFIG } from './unity-code-editor-ansible.service';
import { BASH_CONFIG } from './unity-code-editor-bash.service';
import { POWERSHELL_CONFIG } from './unity-code-editor-powershell.service';
import { PYTHON_CONFIG } from './unity-code-editor-python.service';
import { GET_SAMPLE_SCRIPTS } from './unity-code-editor-sample-scripts.const';
import { EditorModeByScriptType, EditorThemeByScriptType, ScriptTypes } from './unity-code-editor.type';

@Injectable()
export class UnityCodeEditorService {

  constructor() { }

  /**
   * Retrieves the CodeMirror mode string corresponding to the specified script type.
   * 
   * @param scriptType - One of the {@link ScriptTypes} constants representing the script type.
   * @returns The corresponding CodeMirror mode string from {@link EditorModeByScriptTypes},
   *          or null if the script type does not match any predefined types.
   */
  getModeByScriptType(scriptType: string): string {
    switch (scriptType) {
      case ScriptTypes.ANSIBLE: return EditorModeByScriptType.ANSIBLE;
      case ScriptTypes.TERRAFORM: return EditorModeByScriptType.TERRAFORM; // custom HCL mode
      case ScriptTypes.BASH: return EditorModeByScriptType.BASH;
      case ScriptTypes.POWERSHELL: return EditorModeByScriptType.POWERSHELL;
      case ScriptTypes.PYTHON: return EditorModeByScriptType.PYTHON;
      default: return null;
    }
  }

  getThemeByScriptType(scriptType: string): string {
    switch (scriptType) {
      case ScriptTypes.ANSIBLE: return EditorThemeByScriptType.ANSIBLE;
      case ScriptTypes.TERRAFORM: return EditorThemeByScriptType.TERRAFORM; // custom HCL mode
      case ScriptTypes.BASH: return EditorThemeByScriptType.BASH;
      case ScriptTypes.POWERSHELL: return EditorThemeByScriptType.POWERSHELL;
      case ScriptTypes.PYTHON: return EditorThemeByScriptType.PYTHON;
      default: return null;
    }
  }

  getConfigByScriptType(scriptType: string) {
    switch (scriptType) {
      case ScriptTypes.ANSIBLE: return _clone(ANSIBLE_CONFIG);
      case ScriptTypes.TERRAFORM: return _clone(PYTHON_CONFIG);
      case ScriptTypes.BASH: return _clone(BASH_CONFIG);
      case ScriptTypes.POWERSHELL: return _clone(POWERSHELL_CONFIG);
      case ScriptTypes.PYTHON: return _clone(PYTHON_CONFIG);
      default: return null;
    }
  }

  getEditorConfigForScriptType(scriptType: string) {
    switch (scriptType) {
      case ScriptTypes.ANSIBLE: return this.getAnsiblePlaybookConfig();
      case ScriptTypes.TERRAFORM: return this.getTerraformScriptConfig(); // or custom HCL mode
      case ScriptTypes.BASH: return this.getBashScriptConfig();
      case ScriptTypes.POWERSHELL: return this.getPowershellScriptConfig();
      case ScriptTypes.PYTHON: return this.getPythonScriptConfig();
      default: return null;
    }
  }

  getAnsiblePlaybookConfig() {
    return {
      mode: 'yaml',
      theme: 'material',
      lineNumbers: true,
      tabSize: 2,
      lint: true,
      lineWrapping: true,
      gutters: ["CodeMirror-lint-markers"],
      extraKeys: { 'Ctrl-Space': 'autocomplete' },
    };
  }

  getTerraformScriptConfig() {
    return {
      mode: 'clike',
      theme: 'material',
      lineNumbers: true,
      tabSize: 2,
      lint: true,
      lineWrapping: true,
      gutters: ["CodeMirror-lint-markers"],
      extraKeys: { 'Ctrl-Space': 'autocomplete' },
    };
  }

  getBashScriptConfig() {
    return {
      mode: 'shell',
      theme: 'material',
      lineNumbers: true,
      tabSize: 2,
      lint: true,
      lineWrapping: true,
      gutters: ["CodeMirror-lint-markers"],
      extraKeys: { 'Ctrl-Space': 'autocomplete' },
    };
  }

  getPythonScriptConfig() {
    return {
      mode: 'python',
      theme: 'material',
      lineNumbers: true,
      tabSize: 2,
      lint: true,
      lineWrapping: true,
      gutters: ["CodeMirror-lint-markers"],
      extraKeys: { 'Ctrl-Space': 'autocomplete' },
    };
  }

  getPowershellScriptConfig() {
    return {
      mode: 'powershell',
      theme: 'material',
      lineNumbers: true,
      tabSize: 2,
      lint: true,
      lineWrapping: true,
      gutters: ["CodeMirror-lint-markers"],
      extraKeys: { 'Ctrl-Space': 'autocomplete' },
    };
  }

  getSampleScripts(type: string): string {
    return GET_SAMPLE_SCRIPTS(type);
  }

  formatPowerShellScript(script) {
    const lines = script.split('\n');
    const formattedLines = [];
    let indentLevel = 0;
    const indentSize = 4;
    const keywords = ['if', 'else', 'elseif', 'foreach', 'for', 'while', 'switch', 'function', 'return', 'break', 'continue'];

    lines.forEach((line) => {
      let trimmedLine = line.trim();

      // Adjust indent level based on closing braces
      if (trimmedLine.startsWith('}')) {
        indentLevel = Math.max(indentLevel - 1, 0);
      }

      // Normalize spacing around operators
      trimmedLine = trimmedLine.replace(/\s*([=+\-*/%<>!&|]+)\s*/g, ' $1 ');

      // Ensure single space after keywords
      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\s*\\(`, 'i');
        trimmedLine = trimmedLine.replace(regex, `${keyword} (`);
      });

      // Adjust casing for keywords
      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        trimmedLine = trimmedLine.replace(regex, keyword);
      });

      // Apply indentation
      const indent = ' '.repeat(indentLevel * indentSize);
      formattedLines.push(indent + trimmedLine);

      // Adjust indent level based on opening braces
      if (trimmedLine.endsWith('{')) {
        indentLevel += 1;
      }
    });

    return formattedLines.join('\n');
  }
}
