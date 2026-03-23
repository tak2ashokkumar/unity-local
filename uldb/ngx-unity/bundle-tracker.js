// @ts-check
/** @typedef {import("lodash.defaults")} defaults */
/** @typedef {import("lodash.assign")} assign */
/** @typedef {import("lodash.get")} get */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Stats} Stats */
/** @typedef {import("webpack").compilation.Compilation} Compilation */
/** @typedef {import("webpack").compilation.ContextModuleFactory} ContextModuleFactory */
/** @typedef {import("webpack").ChunkData} ChunkData  */
/** @typedef {import("../typings").Contents} Contents */
/** @typedef {import("../typings").Options} Options */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const defaults = require('lodash.defaults');
const assign = require('lodash.assign');
const get = require('lodash.get');
const each = require('lodash.foreach');
const stripAnsi = require('strip-ansi');

function getAssetPath(compilation, name) {
    return path.join(compilation.getPath(compilation.compiler.outputPath), name.split('?')[0]);
}

function getSource(compilation, name) {
    const path = getAssetPath(compilation, name);
    return fs.readFileSync(path, { encoding: 'utf-8' });
}

class BundleTrackerPlugin {
    /**
     * Track assets file location per bundle
     * @param {Options} options
     */
    constructor(options) {
        /** @type {Options} */
        this.options = options;
        /** @type {Contents} */
        this.contents = {
            status: 'initialization',
            assets: {},
            chunks: {},
        };
        this.name = 'BundleTrackerPlugin';

        this.outputChunkDir = '';
        this.outputTrackerFile = '';
        this.outputTrackerDir = '';
    }
    /**
     * Setup parameter from compiler data
     * @param {Compiler} compiler
     * @returns this
     */
    _setParamsFromCompiler(compiler) {
        this.options = defaults({}, this.options, {
            path: get(compiler.options, 'output.path', process.cwd()),
            publicPath: get(compiler.options, 'output.publicPath', ''),
            filename: 'webpack-stats.json',
            logTime: false,
            relativePath: false,
            integrity: false,
            indent: 2,
            // https://www.w3.org/TR/SRI/#cryptographic-hash-functions
            integrityHashes: ['sha256', 'sha384', 'sha512'],
        });

        // Set output directories
        this.outputChunkDir = path.resolve(get(compiler.options, 'output.path', process.cwd()));
        // @ts-ignore: TS2345 this.options.filename can't be undefined here because we set a default value above
        this.outputTrackerFile = path.resolve(this.options.filename);
        this.outputTrackerDir = path.dirname(this.outputTrackerFile);

        return this;
    }
    /**
     * Write bundle tracker stats file
     *
     * @param {Compiler} compiler
     * @param {Partial<Contents>} contents
     */
    _writeOutput(compiler, contents) {
        assign(this.contents, contents, {
            assets: assign(this.contents.assets, contents.assets),
            chunks: assign(this.contents.chunks, contents.chunks),
        });

        if (this.options.publicPath) {
            this.contents.publicPath = this.options.publicPath;
        }

        fs.mkdirSync(this.outputTrackerDir, { recursive: true, mode: 0o755 });
        fs.writeFileSync(this.outputTrackerFile, JSON.stringify(this.contents, null, this.options.indent));
    }
    /**
     * Compute hash for a content
     * @param {string} content
     */
    _computeIntegrity(content) {
        // @ts-ignore: TS2532 this.options.integrityHashes can't be undefined here because
        // we set a default value on _setParamsFromCompiler
        return this.options.integrityHashes
            .map(algorithm => {
                const hash = crypto
                    .createHash(algorithm)
                    .update(content, 'utf8')
                    .digest('base64');

                return `${algorithm}-${hash}`;
            })
            .join(' ');
    }
    /**
     * Handle compile hook
     * @param {Compiler} compiler
     */
    _handleCompile(compiler) {
        this._writeOutput(compiler, { status: 'compile' });
    }
    /**
     * Handle compile hook
     * @param {Compiler} compiler
     * @param {Stats} stats
     */
    _handleDone(compiler, stats) {
        if (stats.hasErrors()) {
            const error = stats.compilation.errors[0];
            this._writeOutput(compiler, {
                status: 'error',
                error: get(error, 'name', 'unknown-error'),
                message: stripAnsi(error['message']),
            });

            return;
        }

        /** @type {Contents} */
        const output = { status: 'done', assets: {}, chunks: {} };
        each(stats.compilation.assets, (file, assetName) => {
            const fileInfo = {
                name: assetName,
                path: getAssetPath(stats.compilation, assetName),
            };

            if (this.options.integrity === true) {
                fileInfo.integrity = this._computeIntegrity(getSource(stats.compilation, assetName));
            }

            if (this.options.publicPath) {
                fileInfo.publicPath = this.options.publicPath + assetName;
            }

            if (this.options.relativePath === true) {
                fileInfo.path = path.relative(this.outputChunkDir, fileInfo.path);
            }

            output.assets[assetName] = fileInfo;
        });
        // each(stats.compilation.chunkGroups, chunkGroup => {
        //     if (!chunkGroup.isInitial()) return;

        //     output.chunks[chunkGroup.name] = chunkGroup.getFiles();
        // });
        for (let chunk of stats.compilation.chunks) {
            output.chunks[chunk.name] = [];
            for (let file of chunk.files) {
                // var F = { name: file };
                // var publicPath = this.options.publicPath || compiler.options.output.publicPath;
                // if (publicPath) {
                //     F.publicPath = publicPath + file;
                // }
                // if (compiler.options.output.path) {
                //     F.path = path.join(compiler.options.output.path, file);
                // }
                // return F;

                const fileInfo = {
                    name: file,
                    path: getAssetPath(stats.compilation, file),
                };

                if (this.options.integrity === true) {
                    fileInfo.integrity = this._computeIntegrity(getSource(stats.compilation, file));
                }

                if (this.options.publicPath) {
                    fileInfo.publicPath = this.options.publicPath + file;
                }

                if (this.options.relativePath === true) {
                    fileInfo.path = path.relative(this.outputChunkDir, fileInfo.path);
                }

                output.chunks[chunk.name].push(fileInfo);
            }
            // output.chunks[chunk.name] = files;
        }

        //      stats.compilation.chunks.map(function(chunk) {
        //       var files = chunk.files.map(function(file) {
        //         var F = { name: file };
        //         var publicPath = self.options.publicPath || compiler.options.output.publicPath;
        //         if (publicPath) {
        //           F.publicPath = publicPath + file;
        //         }
        //         if (compiler.options.output.path) {
        //           F.path = path.join(compiler.options.output.path, file);
        //         }
        //         return F;
        //       });
        //       chunks[chunk.name] = files;
        //     });

        if (this.options.logTime === true) {
            output.startTime = stats.startTime;
            output.endTime = stats.endTime;
        }

        this._writeOutput(compiler, output);
    }
    /**
     * Method called by webpack to apply plugin hook
     * @param {Compiler} compiler
     */
    apply(compiler) {
        this._setParamsFromCompiler(compiler);

        compiler.hooks.compile.tap(this.name, this._handleCompile.bind(this, compiler));
        compiler.hooks.done.tap(this.name, this._handleDone.bind(this, compiler));
    }
}

module.exports = BundleTrackerPlugin;






















// var mkdirp = require('mkdirp');
// var extend = require('deep-extend');

// // @ts-ignore
// var assets = {};
// var DEFAULT_OUTPUT_FILENAME = 'webpack-stats.json';
// var DEFAULT_LOG_TIME = false;

// function Plugin(options) {
//   // @ts-ignore
//   this.contents = {};
//   // @ts-ignore
//   this.options = options || {};
//   // @ts-ignore
//   this.options.filename = this.options.filename || DEFAULT_OUTPUT_FILENAME;
//   // @ts-ignore
//   if (this.options.logTime === undefined) {
//     // @ts-ignore
//     this.options.logTime = DEFAULT_LOG_TIME;
//   }
// }

// Plugin.prototype.apply = function(compiler) {
//   var self = this;

//   // @ts-ignore
//   const _compilation = function(compilation, callback) {
//     const failedModule = function(fail) {
//       var output = {
//         status: 'error',
//         error: fail.error.name || 'unknown-error',
//       };
//       if (fail.error.module !== undefined) {
//         output.file = fail.error.module.userRequest;
//       }
//       if (fail.error.error !== undefined) {
//         // @ts-ignore
//         output.message = stripAnsi(fail.error.error.codeFrame);
//       } else {
//         output.message = '';
//       }
//       self.writeOutput(compiler, output);
//     };

//     if (compilation.hooks) {
//       const plugin = { name: 'BundleTrackerPlugin' };
//       compilation.hooks.failedModule.tap(plugin, failedModule);
//     } else {
//       compilation.plugin('failed-module', failedModule);
//     }
//   };

//   // @ts-ignore
//   const compile = function(factory, callback) {
//     self.writeOutput(compiler, { status: 'compiling' });
//   };

//   const done = function(stats) {
//     if (stats.compilation.errors.length > 0) {
//       var error = stats.compilation.errors[0];
//       self.writeOutput(compiler, {
//         status: 'error',
//         error: error['name'] || 'unknown-error',
//         // @ts-ignore
//         message: stripAnsi(error['message']),
//       });
//       return;
//     }

//     var chunks = {};
//     stats.compilation.chunks.map(function(chunk) {
//       var files = chunk.files.map(function(file) {
//         var F = { name: file };
//         var publicPath = self.options.publicPath || compiler.options.output.publicPath;
//         if (publicPath) {
//           F.publicPath = publicPath + file;
//         }
//         if (compiler.options.output.path) {
//           F.path = path.join(compiler.options.output.path, file);
//         }
//         return F;
//       });
//       chunks[chunk.name] = files;
//     });
//     var output = {
//       status: 'done',
//       chunks: chunks,
//     };

//     if (self.options.logTime === true) {
//       output.startTime = stats.startTime;
//       output.endTime = stats.endTime;
//     }

//     self.writeOutput(compiler, output);
//   };

//   if (compiler.hooks) {
//     const plugin = { name: 'BundleTrackerPlugin' };
//     compiler.hooks.compilation.tap(plugin, _compilation);
//     compiler.hooks.compile.tap(plugin, compile);
//     compiler.hooks.done.tap(plugin, done);
//   } else {
//     compiler.plugin('compilation', _compilation);
//     compiler.plugin('compile', compile);
//     compiler.plugin('done', done);
//   }
// };

// Plugin.prototype.writeOutput = function(compiler, contents) {
//   var outputDir = this.options.path || '.';
//   var outputFilename = path.join(outputDir, this.options.filename || DEFAULT_OUTPUT_FILENAME);
//   var publicPath = this.options.publicPath || compiler.options.output.publicPath;
//   if (publicPath) {
//     contents.publicPath = publicPath;
//   }
//   mkdirp.sync(path.dirname(outputFilename));

//   this.contents = extend(this.contents, contents);
//   // @ts-ignore
//   fs.writeFileSync(outputFilename, JSON.stringify(this.contents, null, this.options.indent));
// };

// module.exports = Plugin;