import * as CodeMirror from 'codemirror';
import 'codemirror/addon/mode/simple';
import 'codemirror/mode/javascript/javascript'; // For interpolations

CodeMirror.defineSimpleMode('hcl', {
    start: [
        // Quoted strings (e.g., "us-west-2")
        { regex: /"(?:[^\\"]|\\.)*"/, token: 'string' },
        // Terraform keywords (e.g., resource, provider)
        { regex: /\b(?:resource|provider|variable|output|module|data|locals|terraform)\b/, token: 'keyword' },
        // Boolean and null literals
        { regex: /\b(?:true|false|null)\b/, token: 'atom' },
        // Numbers (e.g., 123, 12.34)
        { regex: /[-+]?\d+(\.\d+)?/, token: 'number' },
        // Single-line comments (e.g., # comment)
        { regex: /#.*/, token: 'comment' },
        // Multi-line comments (e.g., /* comment */)
        { regex: /\/\*/, token: 'comment', next: 'comment' },
        // Heredoc strings (e.g., <<EOF ... EOF)
        { regex: /<<[-]?\w+/, token: 'string', next: 'heredoc' },
        // Built-in Terraform functions (e.g., format(), join())
        { regex: /\b(?:format|join|length|lookup|merge|file)\b\(/, token: 'builtin' },
        // Interpolations (e.g., ${var.name})
        { regex: /\$\{[^}]+\}/, token: 'variable-2', mode: { spec: 'javascript' } },
        // Brackets and operators (e.g., =, {, })
        { regex: /[={}]/, token: 'bracket' },
        // Identifiers (e.g., aws_instance, ami)
        { regex: /[a-zA-Z_][a-zA-Z0-9_-]*/, token: 'variable' },
        // Whitespace (ignored)
        { regex: /\s+/, token: null }
    ],
    comment: [
        // End of multi-line comment
        { regex: /\*\//, token: 'comment', next: 'start' },
        // Comment content
        { regex: /.*/, token: 'comment' }
    ],
    heredoc: [
        // End of heredoc (matches closing tag)
        { regex: /\w+/, token: 'string', next: 'start' },
        // Heredoc content
        { regex: /.*/, token: 'string' }
    ],
    meta: {
        lineComment: '#',
        blockCommentStart: '/*',
        blockCommentEnd: '*/'
    }
});