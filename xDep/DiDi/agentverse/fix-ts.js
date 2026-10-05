const fs = require('fs');

const fixFile = (file) => {
  let content = fs.readFileSync(file, 'utf-8');
  // Remove include: { category: true }
  content = content.replace(/,\s*include:\s*\{\s*category:\s*true\s*\}/g, '');
  fs.writeFileSync(file, content);
};

fixFile('src/app/admin/frameworks/page.tsx');
fixFile('src/app/admin/mcp/page.tsx');
console.log("Reverted TS error includes");
