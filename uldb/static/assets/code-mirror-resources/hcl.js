CodeMirror.defineMode("hcl", function () {
    return {
        startState: function () {
            return {};
        },
        token: function (stream, state) {
            if (stream.match(/"(?:[^\\]|\\.)*?"/)) {
                return "string";
            }
            if (stream.match(/(?:resource|provider|variable|output|module|data|locals|terraform)\b/)) {
                return "keyword";
            }
            if (stream.match(/true|false|null/)) {
                return "atom";
            }
            if (stream.match(/[-+]?\d+(\.\d+)?/)) {
                return "number";
            }
            if (stream.match(/#.*/)) {
                return "comment";
            }
            if (stream.match(/[{}]/)) {
                return "bracket";
            }
            if (stream.match(/[=]/)) {
                return "operator";
            }
            stream.next();
            return null;
        }
    };
});
