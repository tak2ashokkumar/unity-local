#!/usr/bin/env node
/*
 * ascii-guard (PostToolUse hook for Edit|Write)
 *
 * Read-only validator: after Claude edits or writes a source file, this script
 * scans that file for non-ASCII characters (code points > 127) and, if any are
 * found, prints the offending lines to stderr and exits with code 2 so the
 * feedback is sent back to Claude to fix immediately.
 *
 * This script NEVER modifies any file. It only reads the file it is told about.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const CHECKED_EXTENSIONS = ['.ts', '.html', '.scss', '.js', '.json', '.md'];
const SKIPPED_DIR_PARTS = ['node_modules', 'dist', '.git'];
const MAX_REPORTED_LINES = 20;

function main() {
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch (e) {
    // Unreadable payload: do not block anything.
    process.exit(0);
  }

  const toolInput = payload.tool_input || {};
  const filePath = toolInput.file_path;
  if (!filePath) {
    process.exit(0);
  }

  const ext = path.extname(filePath).toLowerCase();
  if (CHECKED_EXTENSIONS.indexOf(ext) === -1) {
    process.exit(0);
  }

  const normalized = filePath.split('\\').join('/');
  for (let i = 0; i < SKIPPED_DIR_PARTS.length; i++) {
    if (normalized.indexOf('/' + SKIPPED_DIR_PARTS[i] + '/') !== -1) {
      process.exit(0);
    }
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    // File missing or unreadable (e.g. deleted): nothing to check.
    process.exit(0);
  }

  const lines = content.split('\n');
  const findings = [];
  for (let lineNo = 0; lineNo < lines.length; lineNo++) {
    const line = lines[lineNo];
    let firstBadCol = -1;
    for (let col = 0; col < line.length; col++) {
      if (line.charCodeAt(col) > 127) {
        firstBadCol = col;
        break;
      }
    }
    if (firstBadCol !== -1) {
      findings.push({ lineNo: lineNo + 1, col: firstBadCol, text: line });
    }
  }

  if (findings.length === 0) {
    process.exit(0);
  }

  const shown = findings.slice(0, MAX_REPORTED_LINES);
  let msg = 'ascii-guard: non-ASCII characters found in ' + filePath + '\n';
  msg += 'Project rule (CLAUDE.md): keep content plain ASCII; do not use corrupted/non-ASCII symbols.\n';
  for (let i = 0; i < shown.length; i++) {
    const f = shown[i];
    const snippet = f.text.length > 120 ? f.text.slice(0, 120) + '...' : f.text;
    msg += '  line ' + f.lineNo + ', col ' + (f.col + 1) + ': ' + snippet + '\n';
  }
  if (findings.length > shown.length) {
    msg += '  ... and ' + (findings.length - shown.length) + ' more line(s).\n';
  }
  msg += 'Please replace the non-ASCII characters with plain ASCII equivalents.';

  process.stderr.write(msg + '\n');
  process.exit(2);
}

main();
