export enum ScriptTypes {
    ANSIBLE = 'ansible',
    TERRAFORM = 'terraform',
    BASH = 'bash',
    POWERSHELL = 'powershell',
    PYTHON = 'python',
}

export enum EditorModeByScriptType {
    ANSIBLE = 'yaml',
    TERRAFORM = 'hcl',
    BASH = 'shell',
    POWERSHELL = 'powershell',
    PYTHON = 'python',
}

export enum EditorThemeByScriptType {
    ANSIBLE = 'material',
    TERRAFORM = 'dracula',
    BASH = 'midnight',
    POWERSHELL = 'blackboard',
    PYTHON = 'monokai',
}