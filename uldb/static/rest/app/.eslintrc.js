module.exports = {
    "env": {
        "browser": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "angular": 1,
        "d3": 1,
        "vis": 1,
        "google": 1,
        "moment": 1,
        "jsPDF": 1,
        "$": 1,
        "Chart": 1
    },
    "rules": {
        "eqeqeq": [
            "warn",
            "smart"
        ],
        "indent": [
            "warn",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "no-console": [
            "warn"
        ],
        "no-inner-declarations": [
            "warn"
        ],
        "no-redeclare": [
            "warn"
        ],
        "no-unused-vars": [ "off",  { "args": "after-used" }],
        "no-useless-escape": [
            "warn"
        ],
        "quotes": [
            "warn",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
