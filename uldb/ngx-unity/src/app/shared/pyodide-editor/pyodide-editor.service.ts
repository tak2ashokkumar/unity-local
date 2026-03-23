import { Injectable } from '@angular/core';

@Injectable()
export class PyodideEditorService {

    constructor() { }

    /**
     * Validates the given Python code and returns a JSON encoded string containing an object with the following properties:
     *   - status: string, either "ok" or "error"
     *   - output: string, the output of the code
     *   - lineno: number, the line number of the error if status is "error"
     *   - msg: string, the error message if status is "error"
     *   - trace: string, the traceback if status is "error"
     * @param {string} code - The Python code to validate
     * @returns {string} - A JSON encoded string containing the validation result
     */
    validateCode(code: string): string {
        // const escapedCode = code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/"""/g, '\\"\\"\\"'); // triple quote safe
        return `
import ast, json, traceback, sys
from io import StringIO

user_code = ${JSON.stringify(code)}

result = {"status": "ok", "output": "", "annotations": []}
stdout = StringIO()

try:
    # Syntax check
    ast.parse(user_code)

    sys.stdout = stdout
    exec(compile(user_code, "<unknown>", "exec"), {})
    sys.stdout = sys.__stdout__

    result["output"] = stdout.getvalue()

except SystemExit as e:
    sys.stdout = sys.__stdout__
    result["status"] = "error"
    result["output"] = f"SystemExit called: {e}"

except SyntaxError as e:
    sys.stdout = sys.__stdout__
    line = e.text.rstrip() if e.text else ""
    pointer = (" " * (e.offset - 1) + "^") if e.offset else ""
    error_msg = f'  File "<unknown>", line {e.lineno}\\n'
    if line:
        error_msg += f'    {line}\\n'
    if pointer:
        error_msg += f'    {pointer}\\n'
    error_msg += f'{e.__class__.__name__}: {e.msg}'

    result["status"] = "error"
    result["output"] = error_msg
    result["annotations"].append({
        "row": e.lineno - 1,
        "column": e.offset - 1 if e.offset else 0,
        "text": e.msg,
        "type": "error"
    })

except Exception as e:
    sys.stdout = sys.__stdout__
    tb = traceback.extract_tb(sys.exc_info()[2])
    user_tb = [frame for frame in tb if frame.filename == "<unknown>"]

    error_msg = ""
    annotations = []

    if user_tb:
        error_msg += "Traceback (most recent call last):\\n"
        for frame in user_tb:
            error_msg += f'  File "<unknown>", line {frame.lineno}\\n'
            if frame.line:
                error_msg += f'    {frame.line.strip()}\\n'
            annotations.append({
                "row": frame.lineno - 1,
                "column": 0,
                "text": f'{e.__class__.__name__}: {e}',
                "type": "error"
            })

    error_msg += f'{e.__class__.__name__}: {e}'

    result["status"] = "error"
    result["output"] = error_msg
    result["annotations"] = annotations

json.dumps(result)
`;
    }
}
