const fs = require('fs');

let file = 'src/app/(public)/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/bg-primary\/30 rounded-full mix-blend-multiply filter blur-\[100px\]/g, 
  'bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/30 via-primary/5 to-transparent mix-blend-multiply');
  
content = content.replace(/bg-accent\/30 rounded-full mix-blend-multiply filter blur-\[120px\]/g, 
  'bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/30 via-accent/5 to-transparent mix-blend-multiply');
  
content = content.replace(/bg-blue-500\/20 rounded-full mix-blend-multiply filter blur-\[150px\]/g, 
  'bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-blue-500/20 via-blue-500/5 to-transparent mix-blend-multiply');

fs.writeFileSync(file, content);
console.log('Fixed home blurs!');
