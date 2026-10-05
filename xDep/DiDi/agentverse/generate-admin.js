const fs = require('fs');
const path = require('path');

const routes = [
  { slug: 'categories', model: 'category', title: 'Categories', desc: 'Manage content taxonomy', cols: 'name,slug,contentType' },
  { slug: 'tags', model: 'tag', title: 'Tags', desc: 'Manage topic tags', cols: 'name,slug' },
  { slug: 'agents', model: 'agent', title: 'Agents', desc: 'AI Agents Directory', cols: 'name,slug,status' },
  { slug: 'tools', model: 'tool', title: 'Tools', desc: 'AI Tools Directory', cols: 'name,slug,status' },
  { slug: 'models', model: 'model', title: 'Models', desc: 'AI Models Directory', cols: 'name,provider,status' },
  { slug: 'frameworks', model: 'framework', title: 'Frameworks', desc: 'Agentic Frameworks', cols: 'name,language,status' },
  { slug: 'mcp', model: 'mCPServer', title: 'MCP Servers', desc: 'Model Context Protocol Servers', cols: 'name,provider,status' },
  { slug: 'security', model: 'securityAlert', title: 'Security Alerts', desc: 'AI Vulnerabilities', cols: 'title,severity,status' },
  { slug: 'glossary', model: 'glossaryTerm', title: 'Glossary Terms', desc: 'AI Dictionary', cols: 'term,slug' },
  { slug: 'contributors', model: 'contributorProfile', title: 'Contributors', desc: 'Community builders', cols: 'displayName,approved' },
  { slug: 'authors', model: 'author', title: 'Authors', desc: 'Editorial authors', cols: 'name,slug' },
  { slug: 'media', model: 'mediaAsset', title: 'Media Library', desc: 'Uploaded assets', cols: 'filename,mimeType,size' },
  { slug: 'redirects', model: 'redirect', title: 'Redirects', desc: 'URL forwarding', cols: 'source,destination,statusCode' },
  { slug: 'links', model: 'internalLink', title: 'Internal Links', desc: 'Auto-linked entities', cols: 'anchorText,targetEntityType,targetEntityId' },
  { slug: 'users', model: 'user', title: 'Users', desc: 'Platform accounts', cols: 'name,email,role' },
  { slug: 'audit', model: 'auditLog', title: 'Audit Logs', desc: 'System activity', cols: 'action,entityType,createdAt' },
];

routes.forEach(r => {
  const dir = path.join(__dirname, 'src', 'app', 'admin', r.slug);
  fs.mkdirSync(dir, { recursive: true });
  
  const colArray = r.cols.split(',').map(c => `{ key: '${c}', label: '${c.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}' }`).join(', ');

  const content = `import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function ${r.slug.charAt(0).toUpperCase() + r.slug.slice(1)}AdminPage() {
  const data = await db.${r.model}.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    ${colArray}
  ];

  return (
    <AdminDataTable
      title="${r.title}"
      description="${r.desc}"
      data={data}
      columns={columns}
      createUrl="/admin/${r.slug}/new"
    />
  );
}
`;
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
  console.log(`Generated ${r.slug}`);
});
