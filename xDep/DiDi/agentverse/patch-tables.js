const fs = require('fs');
const path = require('path');

const targets = [
  { file: 'src/app/admin/agents/page.tsx', model: 'agent' },
  { file: 'src/app/admin/tools/page.tsx', model: 'tool' },
  { file: 'src/app/admin/mcp/page.tsx', model: 'mCPServer' },
  { file: 'src/app/admin/frameworks/page.tsx', model: 'framework' }
];

targets.forEach(t => {
  const fp = path.join(process.cwd(), t.file);
  if (!fs.existsSync(fp)) return;
  
  let content = fs.readFileSync(fp, 'utf-8');
  
  // Add include category and map it
  if (!content.includes('category: true') && content.includes('findMany')) {
    content = content.replace(/orderBy:\s*\{\s*createdAt:\s*'desc'\s*\},/g, "orderBy: { createdAt: 'desc' },\n    include: { category: true },");
    
    // Map the category to categoryName
    if (!content.includes('flattenedData')) {
      content = content.replace(/const columns = \[/g, `
  const flattenedData = data.map((d: any) => ({
    ...d,
    categoryName: d.category?.name || d.category || "Uncategorized" // Handle relational object or string
  }));

  const columns = [`);
      
      content = content.replace(/data=\{data\}/g, "data={flattenedData}");
      content = content.replace(/columns=\{columns\}/g, "columns={columns.concat({ key: 'categoryName', label: 'Section/Category' })}");
      
      fs.writeFileSync(fp, content);
      console.log(`Patched ${t.file}`);
    }
  }
});
