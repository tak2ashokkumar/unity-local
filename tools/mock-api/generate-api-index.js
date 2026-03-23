const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname);
const outputFile = path.join(__dirname, "MOCK_API_INDEX.md");

function scan(dir, results = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scan(filePath, results);
    } else if (file.endsWith(".json")) {
      results.push(filePath);
    }
  });

  return results;
}

function buildIndex(files) {

  let content = `# Mock API Index\n\n`;
  content += `Generated automatically from mock-api folder.\n\n`;

  files.forEach(file => {

    const relative = path.relative(rootDir, file);
    const apiPath = relative
      .replace(/\\/g, "/")
      .replace(".json", "");

    const url = "/" + apiPath.replace(/^customer\//, "customer/");

    content += `### ${url}\n`;
    content += `File: \`${relative}\`\n\n`;

  });

  return content;
}

const files = scan(rootDir);
const index = buildIndex(files);

fs.writeFileSync(outputFile, index);

console.log("Mock API index generated:");
console.log(outputFile);