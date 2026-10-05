const fs = require('fs');

const files = [
  'src/app/(public)/submit/page.tsx',
  'src/app/(public)/agents/page.tsx',
  'src/app/(public)/news/page.tsx',
  'src/app/(public)/news/[slug]/page.tsx',
  'src/app/(public)/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/bg-([a-z0-9-]+)\/([0-9]+)\s+rounded-full\s+blur-\[[0-9]+px\]/g, 
    'bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-$1/$2 via-$1/5 to-transparent');
    
  fs.writeFileSync(file, content);
});
console.log('Fixed blurs!');
